import os
import click
from platformio import (proc)
from platformio.util import get_systype
from SCons.Script import (Import)
from SCons import Errors


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


def AwflashUpload(environ, target, source, env):  # pylint: disable=unused-argument

    if 'linux' in get_systype():
        raise Errors.BuildError(errstr='Can not Upload on linux')

    board_config = env.BoardConfig()

    parts = board_config.get("upload_partitions", {})

    partitions = [v for k, v in parts.items() if v['partition_type'] == 'system']

    if len(partitions) == 0:
        raise Errors.BuildError(errstr="Please config partition_type:system to burn.")

    partition = partitions[0]

    if 'partition_bin' not in partition.keys():
        raise Errors.BuildError(errstr="Please config Partition partition_bin Options.")

    partition.update({
        'partition_bin':
        os.path.abspath(env.subst(partition['partition_bin']))
    })
    if not os.path.isfile(partition["partition_bin"]):
        raise Errors.BuildError(errstr=f"Partition {partition['partition_type']} file not found:"
                                f"{partition['partition_bin']}")

    args = [
        "awflash",
        "-r",
        "-o", "1",
        "-p", partition["partition_bin"]
    ]

    result = -1
    try:
        res = __exec(args)
        result = res['returncode'] if res['returncode'] is not None else -1
    except Exception as ex:  # pylint: disable=broad-except
        click.secho(f"An error has been occured during flash board", fg="red")
    return result


Import("env")

burn_env = env  # noqa: F821  # pylint: disable=undefined-variable

burn_env.AddMethod(AwflashUpload)
