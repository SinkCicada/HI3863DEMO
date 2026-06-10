import sys
from os.path import (join, isfile, isdir, realpath)
from platformio.project.options import ProjectOptions
from platformio.commands.debug.helpers import reveal_debug_port
from platformio.util import get_systype
from SCons.Script import (DefaultEnvironment,
                          COMMAND_LINE_TARGETS)
from SCons.Script import AlwaysBuild
from SCons import Errors


def select_toolchain(environ, inner_platform):
    default_toolchain = dict(
        AR="${CROSS_COMPILE}ar",
        AS="${CROSS_COMPILE}as",
        CC="${CROSS_COMPILE}gcc",
        CXX="${CROSS_COMPILE}g++",
        OBJCOPY="${CROSS_COMPILE}objcopy",
        RANLIB="${CROSS_COMPILE}ranlib",
        SIZETOOL="",
        GDB="${CROSS_COMPILE}gdb"
    )
    toolchains = {
                    'arm_noneeabi_gcc': dict(
                      CROSS_COMPILE="arm-none-eabi-",
                    )
                 }
    environ.Replace(**default_toolchain)
    toolchain = [k for k, p in inner_platform.packages.items() if p["type"] == "toolchain"  and k in toolchains]
    if toolchain:
        environ.Replace(**toolchains.get(toolchain[0]))

    return environ


def add_tools_path(environ, inner_platform):
    tool_bin_path = ["bin", "script"]
    paths = []
    for name, p in inner_platform.packages.items():
        package_dir = inner_platform.get_package_dir(name)
        type_ = p["type"]
        if type_ == "tool" and not p["optional"]:
            bin_path = [path for path in map(lambda x: join(package_dir, x), tool_bin_path)
                        if isdir(path)]

            for path in bin_path:
                paths.append(path)

            paths.append(package_dir)

    if env.subst("$CUSTOM_TOOL_PATH"):
        paths.append(realpath(env.subst("$CUSTOM_TOOL_PATH")))

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
        debug_client_options = tool_settings.get("client", {}).get(_get_debug_client(environ), {})
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
    data.update({"debug_init_break": _get_debug_option(environ, "init_break")})
    data.update({"debug_extra_cmds": _get_debug_option(environ, "extra_cmds")})
    data.update({"debug_tool": _get_debug_tool(environ)})
    data.update({"debug_client": _get_debug_client(environ)})
    data.update({"debug_port": _get_debug_port(environ)})
    return data


env.Replace(PROGNAME=board.manifest.get('artifact_name'))


env.Replace(
    PROG_PATH=join("$PROJECT_DIR", "kernel", "liteos_a", "out", 'imx6ull', env.subst("${PROGNAME}"))
)

env = add_tools_path(env, platform)
env = select_toolchain(env, platform)

skip_build = all(
    [
        "upload" in COMMAND_LINE_TARGETS,
        "erase" in COMMAND_LINE_TARGETS,
        "nobuild" not in COMMAND_LINE_TARGETS,
        isfile(env.subst(join("$BUILD_BIN_DIR", "${PROGNAME}.bin")))
    ]
) or "windows" in get_systype()

if skip_build:
    COMMAND_LINE_TARGETS += ["nobuild"]

env.Replace(PIOMAINPROG="$PROG_PATH")
target_elf = env.BuildProgram()
env.AlwaysBuild(env.Alias("nobuild", target_elf))
target_buildprog = env.Alias("buildprog", target_elf, target_elf)

if "windows" in get_systype():
    env.Precious(target_elf)


def UploadProtocolNotSupportedAction(target, source, env):
    raise Errors.BuildError(errstr="Protocol upload_protocol="
                            f"{upload_protocol if upload_protocol else '<empty>'}"
                            f" is not supported for board: {board.manifest.get('name')}")

upload_images = []
for _, v in board.get("upload_partitions", {}).items():
    upload_images.append(v.get("partition_bin"))

upload_protocol = env.subst("$UPLOAD_PROTOCOL")
upload_actions = [UploadProtocolNotSupportedAction]
if upload_protocol.startswith("uuu"):
    env.SConscript("uuu.py", exports="env")
    upload_actions = [env.VerboseAction(env.UuuUpload, "Uploading with UUU")]

elif upload_protocol == "custom":
    upload_actions = [env.VerboseAction("$UPLOADCMD", "Uploading $SOURCE")]

AlwaysBuild(env.Alias("upload", upload_images, upload_actions))

env.Default([target_buildprog])

env.RemoveMethod(env.DumpIDEData)
env.AddMethod(_platformDumpIDEData, name="DumpIDEData")
