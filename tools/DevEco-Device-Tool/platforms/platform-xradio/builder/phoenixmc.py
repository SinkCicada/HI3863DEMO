import os
import re
from time import sleep
import click
from serial import Serial
from platformio import (proc)
from SCons.Script import (Import)
from SCons import Errors
from platformio.project.helpers import get_project_cache_dir
from platformio.util import get_systype, serialspawn


def _echo_stdout_line(line):
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


def _expect_k2(port):
    try:
        with Serial(port, baudrate=921600) as serial_port:
            serial_port.setDTR(True)
            serial_port.setRTS(False)
            with serialspawn(serial_port) as serial_cli:
                click.secho("Please click K2", fg="green")
                serial_cli.expect(b'\xFE')
                click.echo("Please waiting...")
                sleep(2)
                serial_cli.close()
                serial_port.close()
                sleep(2)
    except Exception as ex:
        raise Errors.BuildError(errstr=f"Timeout while waiting for K2 pressed.") from ex


def phoenixmc_upload_command(speed, port, port_n, partition):
    cache_dir = get_project_cache_dir()
    if not os.path.isdir(cache_dir):
        os.makedirs(cache_dir)
    log_path = os.path.join(cache_dir, "logs-phoenixMC", "log.txt")

    if "windows" not in get_systype():
        command = {
        "args":["phoenixMC",
                "-b", str(speed),
                "-c", port,
                "-i", partition["partition_bin"],
                "-l", log_path,
                "-D", "n", "-r", "0", "-u", "0"],
        "success": "Upgrade OK"
    }
    else:
        command = {
            "args":["phoenixMC_cli",
                    "-b", str(speed),
                    "-c", str(port_n),
                    "-i", partition["partition_bin"],
                    "-l", log_path,
                    "-r", "0", "-u", "0"],
            "success": "Update OK"
        }
    return command


def phoenixmc_upload_result(command, port, board_config):
    result = -1

    if board_config.get("name") == "xr806":
        _expect_k2(port)

    try:
        res = __exec(command['args'])
        result = res['returncode'] if res['returncode'] is not None else -1

    except Exception as ex:  # pylint: disable=broad-except
        click.secho(f"An error has been occured during flash board", fg="red")
        result = -1

    if result == 0 and command['success'] not in res['out'].splitlines()[-1]:
        result = -1

    return result


def PhoenixmcUpload(environ, target, source, env):  # pylint: disable=unused-argument
    board_config = env.BoardConfig()
    port = env.subst("$UPLOAD_PORT")
    speed = env.subst("$UPLOAD_SPEED")

    if not port:
        raise Errors.BuildError(errstr="Please config upload_port.")

    if "windows" in get_systype():
        re_res = re.match(r'com(\d+)', port, re.I)
        if not re_res:
            raise Errors.BuildError(errstr="Please config upload_port.")
        else:
            port_n = re_res.group(1)

    parts = board_config.get("upload_partitions", {})

    partitions = [v for k, v in parts.items() if v['partition_type'] == 'system']

    if len(partitions) == 0:
        raise Errors.BuildError(errstr="Please config partition_type:system to burn.")

    partition = partitions[0]

    if not partition.get('partition_bin', ''):
        raise Errors.BuildError(errstr=f"Partition {partition['partition_type']} file not found."
                                "Please config partition_bin for it")

    partition.update({
        'partition_bin':
        os.path.abspath(env.subst(partition['partition_bin']))
    })
    if not os.path.isfile(partition["partition_bin"]):
        raise Errors.BuildError(errstr=f"Partition {partition['partition_type']} "
                                       f"file not found: {partition['partition_bin']}")

    upload_command = phoenixmc_upload_command(speed, port, port_n, partition)
    upload_res = phoenixmc_upload_result(upload_command, port, board_config)

    return upload_res

Import("env")

burn_env = env  # noqa: F821  # pylint: disable=undefined-variable

burn_env.AddMethod(PhoenixmcUpload)
