from os.path import (join, isdir, isabs, realpath)
import click
from platformio.util import get_systype
from SCons.Script import (DefaultEnvironment,
                          COMMAND_LINE_TARGETS)
from SCons.Script import AlwaysBuild
from SCons import Errors


def add_tools_path(environ, platf):
    tool_bin_path = ["bin", "script"]
    paths = []
    for name, package in platf.packages.items():
        package_dir = platf.get_package_dir(name)
        type_ = package["type"]
        if type_ == "tool" and not package["optional"]:
            bin_path = [path for path in map(lambda x: join(package_dir, x), tool_bin_path)
                        if isdir(path)]

            for path in bin_path:
                paths.append(path)

            paths.append(package_dir)

    if env.subst("$CUSTOM_TOOL_PATH"):
        paths.append(realpath(env.subst("$CUSTOM_TOOL_PATH")))

    for path in paths:
        environ.PrependENVPath("PATH", path)

    return environ


def UploadProtocolNotSupportedAction(target, source, env):  # pylint: disable=unused-argument
    raise Errors.BuildError(errstr="Protocol upload_protocol="
                            f"{upload_protocol if upload_protocol else '<empty>'}"
                            f" is not supported for board: {board.manifest.get('name')}")


def ResetTargetAction(target, source, env):  # pylint: disable=unused-argument
    click.secho("Please reset the board.", fg="yellow")
    return 0

env = DefaultEnvironment()
board = env.BoardConfig()
platform = env.PioPlatform()

orig_dump_data = env.DumpIDEData


def platform_dump_ide_data(environ): # pylint: disable=unused-argument
    data = orig_dump_data()
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

env.SConscript("patch_kernel.py", exports="env")
patch_actions = [env.VerboseAction(env.PatchKernel, "Patch Kernel")]
AlwaysBuild(env.Alias("patch_kernel", [], patch_actions))

env.Default([target_buildprog])

upload_images = []
for _, v in board.get("upload_partitions", {}).items():
    upload_image = v.get("partition_bin")
    if upload_image is None:
        partition_type = v.get("partition_type", "").upper()
        upload_image = "${" + f"UPLOAD_IMAGE_{partition_type}_BIN" + "}"
        v.update({"partition_bin": upload_image})

    if upload_image and not isabs(upload_image):
        upload_image = join("$PROJECT_DIR", upload_image)

    upload_images.append(upload_image)

upload_protocol = env.subst("$UPLOAD_PROTOCOL")
upload_actions = [UploadProtocolNotSupportedAction]

if upload_protocol == 'awflash':
    env.SConscript("awflash.py", exports="env")
    upload_actions = [ResetTargetAction]
    upload_actions.extend([
        env.VerboseAction(env.AwflashUpload, "Uploading with awflash")
    ])

AlwaysBuild(env.Alias("upload", upload_images, upload_actions))

env.RemoveMethod(env.DumpIDEData)
env.AddMethod(platform_dump_ide_data, name="DumpIDEData")
