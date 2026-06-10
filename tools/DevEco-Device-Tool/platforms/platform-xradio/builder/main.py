import re
import shutil
from os.path import (join, isdir, isabs, realpath, dirname)
from platformio.util import get_systype
from SCons.Script import (DefaultEnvironment, AlwaysBuild, COMMAND_LINE_TARGETS)
from SCons import Errors


env = DefaultEnvironment()
board = env.BoardConfig()
platform = env.PioPlatform()


def patch_xr806_compiler_path(environ):
    package_dir = shutil.which("arm-none-eabi-gcc")
    if not package_dir:
        return
    package_dir = dirname(package_dir)
    toolchain_prefix = join(package_dir, "arm-none-eabi-")

    # patch board_toolchain_prefix in file config.gni
    config_path = join(environ.subst("$PROJECT_DIR"), "device/xradio/xr806/liteos_m/config.gni")
    with open(config_path, 'r+', encoding='utf-8') as config_file:
        data = config_file.read()
        toolchain_prefix_pattern = r'board_toolchain_prefix ?= ?"(.*)"'
        prefix_list = re.findall(toolchain_prefix_pattern, data)
        if prefix_list and prefix_list[0] != toolchain_prefix:
            data = re.sub(toolchain_prefix_pattern, f'board_toolchain_prefix = "{toolchain_prefix}"', data)
            config_file.seek(0)
            config_file.truncate()
            config_file.write(data)

    # patch CC_DIR in file gcc.mk
    config_path = join(environ.subst("$PROJECT_DIR"), "device/xradio/xr806/xr_skylark/gcc.mk")
    with open(config_path, 'r+', encoding='utf-8') as config_file:
        data = config_file.read()
        cc_dir_pattern = r'CC_DIR ?:= ?(.*)'
        cc_dir_list = re.findall(cc_dir_pattern, data)
        if cc_dir_list and cc_dir_list[0] != package_dir:
            data = re.sub(cc_dir_pattern, f'CC_DIR := {package_dir}', data)
            config_file.seek(0)
            config_file.truncate()
            config_file.write(data)


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


def BoardNotSupportedAction(target, source, env):
    raise Errors.BuildError(errstr=f"Action is not supported in {get_systype()}"
                            f"for board: {board.manifest.get('name')}")


def UploadProtocolNotSupportedAction(target, source, env):
    raise Errors.BuildError(errstr="Protocol upload_protocol="
                            f"{upload_protocol if upload_protocol else '<empty>'}"
                            f" is not supported for board: {board.manifest.get('name')}")


def platform_dump_ide_data(environ):
    origDumpIDEData = env.DumpIDEData
    data = origDumpIDEData()
    return data


env.Replace(
    ARFLAGS=["rc"],
    SIZEPROGREGEXP=r"^(?:\.text|\.data|\.rodata|\.text.align|\.ARM.exidx)\s+(\d+).*",
    SIZEDATAREGEXP=r"^(?:\.data|\.bss|\.noinit)\s+(\d+).*",
    SIZECHECKCMD="$SIZETOOL -A -d $SOURCES",
    SIZEPRINTCMD='$SIZETOOL -B -d $SOURCES',
    PROGSUFFIX=''
)

env.Replace(PROGNAME=board.manifest.get('artifact_name'))
if board.get("name") != "xr872" and not env.get("PIOFRAMEWORK"):
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

AlwaysBuild(target_elf)
env.Default([target_buildprog])

upload_images = []
for _, v in board.get("upload_partitions", {}).items():
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
upload_actions = [BoardNotSupportedAction]

if upload_protocol == 'phoenixmc':
    env.SConscript("phoenixmc.py", exports="env")
    upload_actions = [env.VerboseAction(env.PhoenixmcUpload, "Uploading with phoenixmc")]
else:
    upload_actions = [UploadProtocolNotSupportedAction]

AlwaysBuild(env.Alias("upload", upload_images, upload_actions))
env.SConscript("menuconfig.py", exports="env")
config_actions = [env.VerboseAction(env.MenuConfig, "Menu Config")]
AlwaysBuild(env.Alias("menuconfig", [], config_actions))

env.AddMethod(patch_xr806_compiler_path)
env.RemoveMethod(env.DumpIDEData)
env.AddMethod(platform_dump_ide_data, name="DumpIDEData")
