from os.path import (join, realpath, isfile, isdir, isabs)
from platformio.project.options import ProjectOptions
from platformio.commands.debug.helpers import reveal_debug_port
from platformio.util import get_systype
from SCons.Script import (DefaultEnvironment,
                          COMMAND_LINE_TARGETS)
from SCons.Script import AlwaysBuild
from SCons import Errors


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

    board_config = platf.board_config(environ["BOARD"])
    arch = board_config.get("build", {}).get("cpu", {})
    default_toolchain = default_gnu_toolchain

    toolchains = {'llvm':
                  dict(
                      **default_llvm_toolchain
                  ),

                  'arm_noneeabi_gcc': dict(
                      CROSS_COMPILE="arm-none-eabi-",
                      **default_gnu_toolchain
                  ),

                  'gcc_riscv32': dict(
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


def NotSupportedAction(target, source, env):
    raise Errors.BuildError(errstr=f"Action is not supported for board: {board.manifest.get('build', {}).get('mcu')}")


def BoardNotSupportedAction(target, source, env):
    raise Errors.BuildError(errstr=f"Action is not supported in linux for "
                                   f"board: {board.manifest.get('build', {}).get('mcu')}")


def UploadProtocolNotSupportedAction(target, source, env):  # pylint: disable=unused-argument
    upload_proto = env.subst('$UPLOAD_PROTOCOL')
    raise Errors.BuildError(errstr="Protocol upload_protocol="
                            f"{upload_proto if upload_proto else '<empty>'}"
                            f" is not supported for board: {board.manifest.get('name')}")


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
        "buildxts" in COMMAND_LINE_TARGETS or
        "stackAnalysis" in COMMAND_LINE_TARGETS or
        "imageAnalysis" in COMMAND_LINE_TARGETS,
        "nobuild" not in COMMAND_LINE_TARGETS
    ]
) or ("windows" in get_systype() and board.get("name") not in ["Hi3861"])

if skip_build:
    COMMAND_LINE_TARGETS += ["nobuild"]

if "nobuild" in COMMAND_LINE_TARGETS:
    target_elf = "$BUILD_ELF_TARGET"
else:
    target_elf = env.BuildProgram()

target_buildprog = env.Alias("buildprog", target_elf, target_elf)

if "windows" in get_systype() and board.get("name") not in ["Hi3861"]:
    env.Precious(target_elf)
else:
    AlwaysBuild(target_elf)

upload_protocol = env.subst("$UPLOAD_PROTOCOL")
upload_images = []

for _, v in board.get("upload_partitions", {}).items():
    upload_image = v.get("partition_bin")
    if upload_image is None:
        image_id = f"${{UPLOAD_IMAGE_{v.get('partition_type').upper()}_BIN}}"
        if (upload_protocol == "burn-serial" or upload_protocol.startswith("hiburn")):
            upload_image = image_id if env.subst(image_id) else ''
        elif upload_protocol == "openocd-serial":
            upload_image = "${FRAMEWORK_BUILD_TARGET}/" + ("Hi3861_wifiiot_app_burn.bin" \
                if board.get('build', {}).get('mcu') == "Hi3861" else "target.bin")
        v.update({"partition_bin": upload_image})

    if upload_image and not isabs(upload_image):
        upload_image = join("$PROJECT_DIR", upload_image)

    if upload_image:
        upload_images.append(upload_image)

#
# Target: Upload by default .bin file
#

debug_tools = board.get("debug.tools", {})
upload_actions = [UploadProtocolNotSupportedAction]
if upload_protocol.startswith("hiburn"):
    env.SConscript("hiburn.py", exports="env")
    upload_actions = [env.VerboseAction(env.HiBurnUpload, "Uploading with HiBurn")]

elif upload_protocol == "openocd-serial":
    env.SConscript("openocd_serial.py", exports="env")
    upload_actions = [env.VerboseAction(env.OpenocdSerialUpload, "Uploading with OpenocdSerial")]

# custom upload tool
elif upload_protocol == "custom":
    upload_actions = [env.VerboseAction("$UPLOADCMD", "Uploading $SOURCE")]

erase_actions = [NotSupportedAction]

env.SConscript("build_ota.py", exports="env")
ota_actions = [env.VerboseAction(env.BuildOta, "Build OTA")]

env.SConscript("menuconfig.py", exports="env")
config_actions = [env.VerboseAction(env.MenuConfig, "Menu Config")]

AlwaysBuild(env.Alias("upload", upload_images, upload_actions))
AlwaysBuild(env.Alias("erase", [], erase_actions))
AlwaysBuild(env.Alias("build_ota", [], ota_actions))
AlwaysBuild(env.Alias("menuconfig", [], config_actions))

if "stackAnalysis" in COMMAND_LINE_TARGETS:
    env.SConscript("analysis.py", exports="env")
    stackAnalysis_actions = [env.VerboseAction(env.StackAnalysis, "stack Analysis")]
    AlwaysBuild(env.Alias("stackAnalysis", [], stackAnalysis_actions))

if "imageAnalysis" in COMMAND_LINE_TARGETS:
    env.SConscript("analysis.py", exports="env")
    imageAnalysis_actions = [env.VerboseAction(env.ImageAnalysis, "image Analysis")]
    AlwaysBuild(env.Alias("imageAnalysis", [], imageAnalysis_actions))

if "buildxts" in COMMAND_LINE_TARGETS:
    env.SConscript("buildxts.py", exports="env")
    buildxts_actions = [env.VerboseAction(env.BuildXtsCmd, "build xts")]
    AlwaysBuild(env.Alias("buildxts", [], buildxts_actions))

env.Default([target_buildprog])

# replace original DumpIDEData with our own to extend project ide settings

env.RemoveMethod(env.DumpIDEData)
env.AddMethod(_platformDumpIDEData, name="DumpIDEData")
