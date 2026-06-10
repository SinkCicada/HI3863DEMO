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


def _prepare_cli_cmd(env_cmd, _env):
    print(env_cmd, _env.get(env_cmd))
    cmd, arg = _env.get(env_cmd).split()
    return [_env.subst(cmd)] + \
        [_env.subst(a) for a in _env.get(arg.strip('$')) if a]


def _echo_stdout_line(line):
    click.secho(line, fg=None, nl=False)


def _echo_stderr_line(line):
    click.secho(line, fg="red", nl=False)


def exec_wrapper(args, name, result):
    result[name] = \
        exec_command(args,
                     stdout=proc.LineBufferedAsyncPipe(
                         line_callback=_echo_stdout_line),
                     stderr=proc.LineBufferedAsyncPipe(
                         line_callback=_echo_stderr_line))

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


env.Default([target_buildprog])


def BoardNotSupportedAction(target, source, env):
    raise Errors.BuildError(errstr=f"Action is not supported in linux for "
                                   f"board: {board.manifest.get('build', {}).get('mcu')}")
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

env.SConscript("stm32_programmer.py", exports="env")
upload_actions = [env.VerboseAction(env.Stm32progammerUpload, "Uploading with STM32_Programmer_CLI")]
if 'linux' in get_systype():
    upload_actions = [BoardNotSupportedAction]
AlwaysBuild(env.Alias("upload", upload_images, upload_actions))

# replace original DumpIDEData with our own to extend project ide settings

env.RemoveMethod(env.DumpIDEData)
env.AddMethod(platform_dump_ide_data, name="DumpIDEData")
