from os.path import (join, isdir)
import re
from platformio.project.options import ProjectOptions
from platformio.commands.debug.helpers import reveal_debug_port
from platformio.util import get_systype
from SCons.Script import (DefaultEnvironment,
                          COMMAND_LINE_TARGETS)
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
        GDB="lldb",
        SIZETOOL="",
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

origDumpIDEData = env.DumpIDEData


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
            environ.get(
                "debug_port",
                tool_settings.get(
                    "port",
                    tool_settings.get(
                        "client_tools",
                        {}).get(
                        _get_debug_client(environ),
                        {}).get("port"))),
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
    data.update({"debug_init_break": _get_debug_option(environ, "init_break")})
    data.update({"debug_extra_cmds": _get_debug_option(environ, "extra_cmds")})
    data.update({"debug_tool": _get_debug_tool(environ)})
    data.update({"debug_client": _get_debug_client(environ)})
    data.update({"debug_port": _get_debug_port(environ)})
    data.update({"monitor_port": _monitor_port_to_qemu(_get_monitor_port(env))})
    return data


def _get_monitor_port(environ):
    monitor_port = environ.GetProjectOption("monitor_port")
    if monitor_port:
        return monitor_port

    if "BOARD" not in environ:
        return None

    _board = environ.BoardConfig()
    try:
        monitor_port = _board.manifest.get("monitor", {}).get("port")
    except KeyError:
        return None

    return monitor_port


def _monitor_port_to_qemu(port):
    port_re = re.compile(r'socket://(?P<host>[^:]+)?:(?P<port>\d+)')
    if not port:
        return None

    m = port_re.match(port)
    if not m:
        return None

    if m.group('port'):
        return m.group('port')

    return None


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
        "run" in COMMAND_LINE_TARGETS ,
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

framework = env.get("PIOFRAMEWORK", [])[0]
env.Replace(
    FRAMEWORK_BUILD_TARGET=board.get("frameworks", {}).get(framework, {}).get("build", {}).get("target"),
)

env.SConscript("build_image.py", exports="env")
upload_actions = [env.VerboseAction(env.BuildImage, "Build QEMU image")]

env.SConscript("run.py", exports="env")
run_actions = [env.VerboseAction(env.qemuUpload, "Uploading with qemuUpload")]

AlwaysBuild(env.Alias("upload", None, upload_actions))
AlwaysBuild(env.Alias("run", None, run_actions))

env.Default([target_buildprog])

# replace original DumpIDEData with our own to extend project ide settings

env.RemoveMethod(env.DumpIDEData)
env.AddMethod(_platformDumpIDEData, name="DumpIDEData")
