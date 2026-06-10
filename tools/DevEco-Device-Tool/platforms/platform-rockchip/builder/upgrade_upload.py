import subprocess
import click
import re
import os
import time
from platformio import (proc)
from platformio.util import get_systype
from SCons.Script import (Import)
from SCons import Errors


def _echo_stdout_line(line):
    if not line.startswith("Program Log will save in the"):
        click.secho(line, fg=None, nl=False)


def _echo_stderr_line(line):
    click.secho(line, fg="red", nl=False)


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


def board_mode():
    res = __exec(['upgrade_tool', "LD"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    on_mode = re.search( r'Mode=(\w+)', res['out'], re.I)
    return on_mode, on_mode.group(1) if on_mode else None


def upload_result(upload_args):
    result = -1
    try:
        for args in upload_args:
            upload_file_name = os.path.basename(args[2] if args[1] == "UL" else args[3])
            click.secho(f"\nUpload file: {upload_file_name}", fg="green")
            res = __exec(args)
            result = res['returncode'] if res['returncode'] is not None else -1
            if result != 0:
                break
    except Exception as ex:  # pylint: disable=broad-except
        click.secho(f"Upgrade, please check whether the board is in Mode Loader", fg="red")

    return result


def UpgradeUpload(environ, target, source, env):  # pylint: disable=unused-argument
    if "windows" not in get_systype():
        raise Errors.BuildError(errstr=f"Currently, Upgrade only supports Windows")

    click.secho("Operation paused, Please press Enter key to continue", fg="blue")
    input()
    board_config = env.BoardConfig()
    parts = board_config.get("upload_partitions")

    if len(parts) == 0:
        raise Errors.BuildError(errstr="Please config partition to upload.")

    loader_param_args = []
    parts_args = []
    for _, part in parts.items():
        part.update({'partition_bin': os.path.abspath(env.subst(part['partition_bin']))})
        if not os.path.isfile(part["partition_bin"]):
            raise Errors.BuildError(errstr=f"{part['partition_type']} file not found: {part['partition_bin']}")

        if part["partition_type"] == "loader":
            loader_param_args.insert(0, ["upgrade_tool", "UL", part["partition_bin"], "-noreset"])
        elif part["partition_type"] == "parameter":
            loader_param_args.append(["upgrade_tool", "DI", "-p", part["partition_bin"]])
        else:
            partition_type = part["partition_type"]
            parts_args.append(["upgrade_tool", "DI", f"-{partition_type}", part["partition_bin"]])
    
    upload_args = loader_param_args + parts_args

    on_mode, mode = board_mode()
    if not on_mode:
        raise Errors.BuildError(errstr="Check whether the board is connected")
 
    if mode != "Loader":
        click.secho(f"The board is not in Loader mode."
                    f"Please Hold on the VOL+ key, 3 seconds later press RESET key," 
                    f"and 3 seconds later release VOL+ key.", fg="blue")

        start_time = time.time()
        is_loader = False
        while time.time() - start_time < 60:
            _, mode = board_mode()
            if mode == "Loader":
                is_loader = True
                break
            time.sleep(5)
        if not is_loader:
            raise Errors.BuildError(errstr="Waiting for enter the Loader mode times out.")

    click.secho("Current Mode: Loader\n", fg="green")

    res = upload_result(upload_args)
    
    return res


Import("env")

burn_env = env  # noqa: F821 # pylint: disable=undefined-variable

burn_env.AddMethod(UpgradeUpload)
