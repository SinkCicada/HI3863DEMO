import sys
from os.path import (join, isdir, isabs, realpath)
import click
from platformio import proc
from platformio.proc import exec_command
from platformio.util import get_systype
from SCons.Script import (DefaultEnvironment,
                          COMMAND_LINE_TARGETS, ARGUMENTS, Default)
from SCons.Script import AlwaysBuild
from SCons import Errors


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


def BoardNotSupportedAction(target, source, env):
    raise Errors.BuildError(errstr=f"Action is not supported in linux for board: {board.manifest.get('name', '')}")


origDumpIDEData = env.DumpIDEData


def platform_dump_ide_data(environ):
    data = origDumpIDEData()
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

upload_protocol = env.subst("$UPLOAD_PROTOCOL")
upload_images = []
for _, v in board.get("upload_partitions", {}).items():
    upload_image = v.get("partition_bin")
    if upload_image is None:
        if upload_protocol == "dayu-downloader":
            upload_image = "${UPLOAD_IMAGE_PAC_BIN}"
        v.update({"partition_bin": upload_image})
    if upload_image and not isabs(upload_image):
        upload_image = join("$PROJECT_DIR", upload_image)
    upload_images.append(upload_image)

upload_actions = [UploadProtocolNotSupportedAction]
if upload_protocol == "dayu-downloader":
    env.SConscript("dayu_downloader.py", exports="env")
    upload_actions = [env.VerboseAction(env.DownloaderUpload, "Uploading with Downloader")]
    if 'linux' in get_systype():
        upload_actions = [BoardNotSupportedAction]
AlwaysBuild(env.Alias("upload", upload_images, upload_actions))

env.Default([target_buildprog])
env.RemoveMethod(env.DumpIDEData)
env.AddMethod(platform_dump_ide_data, name="DumpIDEData")
