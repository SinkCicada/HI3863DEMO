import os
import click
from platformio import (proc)
from SCons.Script import Import
from SCons import Errors
from platformio.util import get_systype

Import("env")
burn_env = env  # pylint: disable=undefined-variable
platform = burn_env.PioPlatform()


def _echo_stdout_line(line):
    click.secho(line, fg=None, nl=False)


def _echo_stderr_line(line):
    if line.startswith("Upload"):
        click.secho(line, fg="blue", nl=False)
    elif line.startswith("Error"):
        click.secho(line, fg="red", nl=False)
    else:
        click.echo(line, nl=False)


def __exec(cmd, **kwargs):

    stdout = proc.LineBufferedAsyncPipe(line_callback=_echo_stdout_line)
    stderr = proc.LineBufferedAsyncPipe(line_callback=_echo_stderr_line)

    default = dict(stdout=stdout,
                   stderr=stderr,
                   shell=False)
    default.update(kwargs)
    kwargs = default

    result = proc.exec_command(cmd, **kwargs)

    return result


def OpenocdSerialUpload(environ, target, source, env):  # pylint: disable=unused-argument, too-many-locals

    if "windows" not in get_systype():
        raise Errors.BuildError(errstr="Currently, openocd-serial only supports Windows.")

    board_config = env.BoardConfig()
    parts = board_config.get("upload_partitions", {})
    bin_file = env.subst("$UPLOAD_BIN_FILE")

    if bin_file:
        partition = {"partition_type": "UploadBin", "partition_bin": bin_file}
    elif len(parts) > 1:
        raise Errors.BuildError(errstr="Only supported one partition to burn.")
    elif len(parts) == 1:
        partition = list(parts.items())[0][1]
        if partition.get('partition_bin', ''):
            partition.update({
                'partition_bin':
                os.path.abspath(env.subst(partition['partition_bin']))
            })
            if not os.path.isfile(partition["partition_bin"]):
                raise Errors.BuildError(errstr=f"File not found: {partition['partition_bin']}")
        else:
            raise Errors.BuildError(errstr="Please config partition_bin or partition_type:app of partition.")
    else:
        raise Errors.BuildError(errstr="Please config upload_partitions or upload_bin_file to burn.")

    result = -1
    click.secho("Huawei-openocd JTAG upload only for burn.bin.", fg="blue")
    platform_dir = platform.get_dir()

    partition_bin = partition['partition_bin']
    FLASH_ADDR = board_config.get("upload", {}).get("flashAddr", "0x400000")
    partition_bin_esc = partition_bin.replace('\\', '\\\\')
    mcu =  board_config.get("build", {}).get("mcu")
    debug_interface = env.subst("$DEBUG_INTERFACE") if env.subst("$DEBUG_INTERFACE") else "jtag"
    args = [
        'openocd.exe',
        "-s", os.path.join(platform_dir, "scripts", "openocd"),
        "-f", os.path.join("interface", f"hi-ft2232d-ftdi-{debug_interface}.cfg"),
        "-f", os.path.join("target", f"{mcu.lower()}-{debug_interface}.cfg"),
        "-c", f"load_bin {partition_bin_esc} {FLASH_ADDR}"
    ]
    try:
        res = __exec(args)
        result = res['returncode'] if res['returncode'] is not None else -1
    except Exception as ex:  # pylint: disable=broad-except
        click.secho(f"An error has been occured during flash board", fg="red")

    return result


burn_env.AddMethod(OpenocdSerialUpload)
