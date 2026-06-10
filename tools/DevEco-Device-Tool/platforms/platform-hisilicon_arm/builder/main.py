from itertools import zip_longest
from os.path import (join, dirname, realpath, isfile, isdir, isabs)
import click
from platformio import proc
from platformio.proc import exec_command, quote_cmd_line
from platformio.project.options import ProjectOptions
from platformio.commands.debug.helpers import reveal_debug_port
from platformio.util import get_systype
from SCons.Script import (DefaultEnvironment,
                          COMMAND_LINE_TARGETS, ARGUMENTS)
from SCons.Script import AlwaysBuild
from SCons import Errors

UBOOT_PROMPT = r'hisilicon\s*#'


def select_toolchain(environ, platf):
    default_gnu_toolchain = dict(
        AR="${CROSS_COMPILE}ar",
        AS="${CROSS_COMPILE}as",
        CC="${CROSS_COMPILE}gcc",
        CXX="${CROSS_COMPILE}g++",
        OBJCOPY="${CROSS_COMPILE}objcopy",
        RANLIB="${CROSS_COMPILE}ranlib",
        SIZETOOL="",
        GDB="${CROSS_COMPILE}gdb"
    )
    default_llvm_toolchain = dict(
        CROSS_COMPILE="llvm-",
        CC="clang",
        CXX="clang++",
        SIZETOOL="",
        GDB="lldb"
    )

    default_toolchain = default_llvm_toolchain

    toolchains = {'llvm':
                  dict(
                      **default_llvm_toolchain
                  ),

                  'arm_noneeabi_gcc': dict(
                      CROSS_COMPILE="arm-none-eabi-",
                      **default_gnu_toolchain
                  ),

                  'riscv32-gdb': dict(
                      CROSS_COMPILE="riscv32-unknown-elf-",
                      **default_gnu_toolchain
                  ),
                  }
    environ.Replace(**default_toolchain)
    toolchain = [k for k, p in platf.packages.items() if p["type"] == "toolchain" and k in toolchains]
    if toolchain:
        environ.Replace(**toolchains.get(toolchain[0]))

    return environ


def add_tools_path(environ, platf):
    tool_bin_path = ["bin", "script"]
    paths = []
    for name, p in platf.packages.items():
        package_dir = platf.get_package_dir(name)
        type_ = p["type"]
        if type_ == "tool" and not p["optional"]:
            bin_path = [path for path in map(lambda x: join(package_dir, x), tool_bin_path)
                        if isdir(path)]

            for path in bin_path:
                paths.append(path)

            paths.append(package_dir)

    for p in paths:
        environ.PrependENVPath("PATH", p)

    return environ


env = DefaultEnvironment()
board = env.BoardConfig()
platform = env.PioPlatform()

env.Replace(
    ARFLAGS=["rc"],
    SIZEPROGREGEXP=r"^(?:\.text|\.data|\.rodata|\.text.align|\.ARM.exidx)\s+(\d+).*",
    SIZEDATAREGEXP=r"^(?:\.data|\.bss|\.noinit)\s+(\d+).*",
    SIZECHECKCMD="$SIZETOOL -A -d $SOURCES",
    SIZEPRINTCMD='$SIZETOOL -B -d $SOURCES',

    PROGSUFFIX=''
)


def UploadProtocolNotSupportedAction(target, source, env):  # pylint: disable=unused-argument
    upload_proto = env.subst('$UPLOAD_PROTOCOL')
    raise Errors.BuildError(errstr="Protocol upload_protocol="
                            f"{upload_proto if upload_proto else '<empty>'}"
                            f" is not supported for board: {board.manifest.get('name')}")


def ResetTargetAction(target, source, env):  # pylint: disable=unused-argument
    click.secho("Please reset the board."
                " If it doesn't work please try reset board again in 10 seconds.", fg="yellow")
    return 0


origDumpIDEData = env.DumpIDEData


def _get_lldb_path(environ):
    liblldb_path = environ.GetProjectOption("debug_liblldb_path")
    if liblldb_path:
        return realpath(liblldb_path)

    if "BOARD" not in environ:
        return None
    try:
        liblldb_path = environ.BoardConfig().get("debug.liblldb_path")
        if not liblldb_path:
            return None
    except KeyError:
        return None
    # custom path to liblldb.so file
    if isfile(liblldb_path):
        return liblldb_path

    return None


def _get_debug_option(environ, option):
    option_value = environ.GetProjectOption(f"debug_{option}", None)
    if option_value:
        return option_value

    try:
        board_config = platform.board_config(environ["BOARD"])
        tool_name = _get_debug_tool(environ)
        tool_settings = board_config.get("debug", {}).get("tools", {}).get(tool_name, {})
        debug_client_options = tool_settings.get("client_tools", {}).get(_get_debug_client(environ), {})
        option_value = tool_settings.get(option,
                                         debug_client_options.get(option,
                                                                  ProjectOptions[f"env.debug_{option}"].default))

    except (AssertionError, KeyError):
        option_value = None

    return option_value


def _get_debug_tool(environ):
    debug_tool = environ.GetProjectOption("debug_tool", None)
    if debug_tool:
        return debug_tool

    if "BOARD" not in environ:
        return None
    try:
        board_config = platform.board_config(environ["BOARD"])
        debug_tool = board_config.get_debug_tool_name(environ.get("debug_tool"))
    except KeyError:
        return None

    if debug_tool:
        return debug_tool
    return None


def _get_debug_client(environ):
    debug_client = environ.GetProjectOption("debug_client")
    if debug_client:
        return debug_client

    if "BOARD" not in environ:
        return None

    try:
        board_config = platform.board_config(environ["BOARD"])
        debug_client = board_config.get("debug", {}).get("client")
    except KeyError:
        return None

    if debug_client:
        return debug_client
    return None


def _get_debug_port(environ):
    debug_port = environ.GetProjectOption("debug_port")
    if debug_port:
        return debug_port

    if "BOARD" not in environ:
        return None
    try:
        board_config = platform.board_config(environ["BOARD"])
        tool_name = _get_debug_tool(environ)
        tool_settings = board_config.get("debug", {}).get("tools", {}).get(tool_name, {})
        debug_port = reveal_debug_port(
            environ.get("debug_port", tool_settings.get("port")),
            tool_name,
            tool_settings,
        )
    except KeyError:
        return None

    if debug_port:
        return debug_port
    return None


def _platformDumpIDEData(environ):
    data = origDumpIDEData()
    data.update({"liblldb_path": _get_lldb_path(environ)})
    data.update({"debug_init_break": _get_debug_option(environ, "init_break")})
    data.update({"debug_extra_cmds": _get_debug_option(environ, "extra_cmds")})
    data.update({"debug_tool": _get_debug_tool(environ)})
    data.update({"debug_client": _get_debug_client(environ)})
    data.update({"debug_port": _get_debug_port(environ)})
    return data


env.Replace(PROGNAME=board.manifest.get('artifact_name'))

if not env.get("PIOFRAMEWORK"):
    raise Errors.BuildError(errstr="Bare metal building is not supported")

env.BuildFrameworks(env.get("PIOFRAMEWORK"))

# replace builder with custom command
if env.subst("$BUILD_CMD_CUSTOM"):
    env.Replace(BUILDERS=dict(CustomBuilder=env.Builder(
        action=env.Action("$BUILD_CMD_CUSTOM"))))
    env.Replace(PIOMAINPROG=env.CustomBuilder(['$BUILD_ELF_TARGET'], None))

env = add_tools_path(env, platform)
env = select_toolchain(env, platform)

skip_build = all(
    [
        "upload" in COMMAND_LINE_TARGETS or
        "erase" in COMMAND_LINE_TARGETS or
        "uboot_config_boot" in COMMAND_LINE_TARGETS or
        "uboot_config_debug" in COMMAND_LINE_TARGETS or
        "perfAnalysis" in COMMAND_LINE_TARGETS,
        "nobuild" not in COMMAND_LINE_TARGETS
    ]
) or ("windows" in get_systype())

if skip_build:
    COMMAND_LINE_TARGETS += ["nobuild"]

if "nobuild" in COMMAND_LINE_TARGETS:
    target_elf = "$BUILD_ELF_TARGET"
else:
    target_elf = env.BuildProgram()

target_buildprog = env.Alias("buildprog", target_elf, target_elf)

if "windows" in get_systype():
    env.Precious(target_elf)
else:
    AlwaysBuild(target_elf)

upload_protocol = env.subst("$UPLOAD_PROTOCOL")
upload_images = []
erase_images = []
for _, v in board.get("upload_partitions", {}).items():
    upload_image = v.get("partition_bin")

    if upload_image and not isabs(upload_image):
        upload_image = join("$PROJECT_DIR", upload_image)

    upload_images.append(upload_image)

    if v.get("partition_type") == "fastboot":
        erase_images.append(upload_image)

#
# Target: Upload by default .bin file
#

debug_tools = board.get("debug.tools", {})
upload_actions = [UploadProtocolNotSupportedAction]
if upload_protocol.startswith("hiburn"):
    env.SConscript("hiburn.py", exports="env")
    upload_actions = [env.VerboseAction(env.HiBurnUpload, "Uploading with HiBurn")]

# custom upload tool
elif upload_protocol == "custom":
    upload_actions = [env.VerboseAction("$UPLOADCMD", "Uploading $SOURCE")]


erase_actions = [UploadProtocolNotSupportedAction]
if upload_protocol.startswith("hiburn"):
    env.SConscript("hiburn.py", exports="env")
    erase_actions = [env.VerboseAction(env.HiBurnErase, "Erasing with HiBurn")]

env.SConscript("menuconfig.py", exports="env")
config_actions = [env.VerboseAction(env.MenuConfig, "Menu Config")]

AlwaysBuild(env.Alias("upload", upload_images, upload_actions))
AlwaysBuild(env.Alias("erase", erase_images, erase_actions))
AlwaysBuild(env.Alias("menuconfig", [], config_actions))

if "perfAnalysis" in COMMAND_LINE_TARGETS:
    env.SConscript("analysis.py", exports="env")
    perfAnalysis_actions = [env.VerboseAction(env.PerfAnalysis, "perf Analysis")]
    AlwaysBuild(env.Alias("perfAnalysis", [], perfAnalysis_actions))

#
# Configure bootloader
#

env.Replace(
    UBOOTCHAT_EXE=quote_cmd_line(join(dirname(env['PLATFORM_MANIFEST']), "tools", "uboot",
                       "uboot-chat.py")),
)
verbose = int(ARGUMENTS.get("PIOVERBOSE", 0))
ubootchat_args = ["-v"] if verbose else False or []
ubootchat_args.extend([
    "-D",
    "$UPLOAD_PORT",
    "-b",
    "115200"
])

uboot_configs = board.get('uboot.config', [])
uboot_prompt = board.get('uboot.prompt', "hisilicon\\s*#")
env.Replace(
    UBOOTCHAT_UBOOT_PROMPT=uboot_prompt
)

for uboot_config_cmd in uboot_configs:

    uboot_config_cmds = uboot_configs[uboot_config_cmd]['cmds']
    ubootchat_config_args = ubootchat_args.copy()

    default_boot_stop = [r'(autoboot:\s+\d+|${UBOOTCHAT_UBOOT_PROMPT})',
                         ' ',
                         '${UBOOTCHAT_UBOOT_PROMPT}']

    custom_cmd_var = uboot_config_cmd + "_cmds"
    custom_cmds = env.get(custom_cmd_var.upper(), None)
    if custom_cmds:
        uboot_config_cmds = default_boot_stop
        for x in zip_longest(custom_cmds,
                             [],
                             fillvalue='${UBOOTCHAT_UBOOT_PROMPT}'):
            uboot_config_cmds.extend(x)

    for i, v in enumerate(uboot_config_cmds):
        prefix = '-e'
        if i % 2:
            prefix = '-s'

        ubootchat_config_args.extend([prefix, quote_cmd_line(env.subst(v))
                                      if ' ' not in v else env.subst(v).replace('\"', '\\"')])

    python_exe = quote_cmd_line(env.subst("$PYTHONEXE"))
    ubootchat_env = {
        f"UBOOTCHAT_{uboot_config_cmd.upper()}": ["$UBOOTCHAT_EXE"] + ubootchat_config_args,
        f"UBOOTCHAT_{uboot_config_cmd.upper()}_CMD": f'{python_exe} $UBOOTCHAT_{uboot_config_cmd.upper()}'
    }
    env.Replace(**ubootchat_env)

    def CheckOptionsAction(target, source, env):  # pylint: disable=unused-argument
        if not env.subst("$UPLOAD_PORT"):
            raise Errors.BuildError(errstr="Project option required: ['upload_port']")

        return 0

    uboot_config_actions = []
    uboot_config_actions.extend([
        env.VerboseAction(CheckOptionsAction, "Checking for required options"),
        env.VerboseAction(ResetTargetAction, "Prompt to reset target"),
        env.VerboseAction(
            f"$UBOOTCHAT_{uboot_config_cmd.upper()}_CMD",
            "Configuring uboot environment")
    ])
    AlwaysBuild(env.Alias(f"{uboot_config_cmd}", None, uboot_config_actions))

env.Default([target_buildprog])

# replace original DumpIDEData with our own to extend project ide settings

env.RemoveMethod(env.DumpIDEData)
env.AddMethod(_platformDumpIDEData, name="DumpIDEData")
