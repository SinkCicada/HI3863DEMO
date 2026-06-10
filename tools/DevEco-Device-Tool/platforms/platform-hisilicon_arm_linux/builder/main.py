from itertools import zip_longest
from os.path import (join, dirname, realpath, isfile, isdir, isabs)
import click
from platformio.proc import quote_cmd_line
from platformio.util import get_systype
from SCons.Script import (DefaultEnvironment,
                          COMMAND_LINE_TARGETS, ARGUMENTS)
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
        "erase" in COMMAND_LINE_TARGETS or
        "uboot_config_boot" in COMMAND_LINE_TARGETS,
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

AlwaysBuild(env.Alias("upload", upload_images, upload_actions))
AlwaysBuild(env.Alias("erase", erase_images, erase_actions))

#
# Configure bootloader
#

framework = (set(board.get('frameworks', {}).keys()) & set(env.get("PIOFRAMEWORK", []))).pop()
bundle = env.GetProjectOption("hpm_project_base_package", '')
board_uboot = board.get('uboot', {})
uboot = board_uboot.get(framework, {}) if board_uboot.get(framework, {}) else board_uboot.get(bundle, {})
if uboot:
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

    uboot_configs = uboot.get('config', [])
    uboot_prompt = uboot.get('prompt', "hisilicon\\s*#")
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
env.AddMethod(platform_dump_ide_data, name="DumpIDEData")
