from os.path import (join, isdir, isabs, realpath)
from platformio.util import get_systype
from SCons.Script import (DefaultEnvironment,
                          COMMAND_LINE_TARGETS)
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
    elif platf.get_upload_tool("tool_upgrade"):
        paths.append(platf.get_upload_tool("tool_upgrade"))

    for p in paths:
        environ.PrependENVPath("PATH", p)

    return environ

env = DefaultEnvironment()
board = env.BoardConfig()
platform = env.PioPlatform()

origDumpIDEData = env.DumpIDEData


def platform_dump_ide_data(environ): # pylint: disable=unused-argument
    data = origDumpIDEData()
    return data


def BoardNotSupportedAction(target, source, env):
    raise Errors.BuildError(errstr=f"Action is not supported in linux for "
                                   f"board: {board.manifest.get('build', {}).get('mcu')}")


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
    target_elf = env.get("PIOMAINPROG")

target_buildprog = env.Alias("buildprog", target_elf, target_elf)

if "windows" in get_systype():
    env.Precious(target_elf)
else:
    AlwaysBuild(target_elf)

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

env.SConscript("upgrade_upload.py", exports="env")
upload_actions = [env.VerboseAction(env.UpgradeUpload, "Uploading with UpgradeUpload")]
if 'linux' in get_systype():
    upload_actions = [BoardNotSupportedAction]
AlwaysBuild(env.Alias("upload", upload_images, upload_actions))

env.RemoveMethod(env.DumpIDEData)
env.AddMethod(platform_dump_ide_data, name="DumpIDEData")
