import sys
from os.path import (join, isdir, isabs, realpath)
from platformio.util import get_systype
from SCons.Script import (DefaultEnvironment,
                          COMMAND_LINE_TARGETS, ARGUMENTS, Default)
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

    default_toolchain = default_gnu_toolchain

    toolchains = {'arm_noneeabi_gcc': dict(
                      CROSS_COMPILE="arm-none-eabi-",
                      **default_gnu_toolchain
                  ),
                  }
    environ.Replace(**default_toolchain)
    toolchain = [k for k, p in platf.packages.items() if p["type"] == "toolchain" and k in toolchains]
    if toolchain:
        environ.Replace(**toolchains.get(toolchain[0]))

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

    if env.subst("$CUSTOM_TOOL_PATH"):
        paths.append(realpath(env.subst("$CUSTOM_TOOL_PATH")))

    for p in paths:
        environ.PrependENVPath("PATH", p)

    return environ


origDumpIDEData = env.DumpIDEData


def platform_dump_ide_data(environ):
    data = origDumpIDEData()
    return data

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
        "erase" in COMMAND_LINE_TARGETS,
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


env.Default([target_buildprog])

upload_images = []
for _, v in board.get("upload_partitions").items():
    upload_image = v.get("partition_bin")
    if upload_image is None:
        partition_type = v.get("partition_type", "").upper()
        image_id = f"${{UPLOAD_IMAGE_{partition_type}_BIN}}"
        upload_image = image_id if env.subst(image_id) else ''
        v.update({"partition_bin": upload_image})

    if upload_image and not isabs(upload_image):
        upload_image = join("$PROJECT_DIR", upload_image)

    if upload_image:
        upload_images.append(upload_image)

upload_protocol = env.subst("$UPLOAD_PROTOCOL")


def UploadProtocolNotSupportedAction(target, source, env):
    raise Errors.BuildError(errstr="Protocol upload_protocol="
                            f"{upload_protocol if upload_protocol else '<empty>'}"
                            f" is not supported for board: {board.manifest.get('name')}")

upload_actions = [UploadProtocolNotSupportedAction]  
if upload_protocol == 'amebazpgtool':
    env.SConscript("amebazpgtool.py", exports="env")
    upload_actions = [env.VerboseAction(env.AmebazpgtoolUpload, "Uploading with amebazpgtool")]


AlwaysBuild(env.Alias("upload", upload_images, upload_actions))

# replace original DumpIDEData with our own to extend project ide settings

env.RemoveMethod(env.DumpIDEData)
env.AddMethod(platform_dump_ide_data, name="DumpIDEData")
