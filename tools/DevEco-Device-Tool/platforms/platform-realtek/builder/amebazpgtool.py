import os
import click
from platformio import (proc)
from SCons.Script import (Import)
from SCons import Errors
from platformio.util import get_systype


def _echo_stdout_line(line):
    click.secho(line, fg=None, nl=False)


def _echo_stderr_line(line):
    click.secho(line, fg="red", nl=False)


def fail_check(cmd_fails, cmd_out):
    for out in cmd_out:
        if any([f for f in cmd_fails if f in out]):
            return True
    return False


def __exec(cmd, **kwargs):

    stdout = proc.ByteBufferedAsyncPipe(byte_callback=_echo_stdout_line)
    stderr = proc.ByteBufferedAsyncPipe(byte_callback=_echo_stderr_line)

    default = dict(stdout=stdout,
                   stderr=stderr,
                   shell=False)
    default.update(kwargs)
    kwargs = default

    result = proc.exec_command(cmd, **kwargs)

    return result


def AmebazpgtoolUpload(environ, target, source, env):  # pylint: disable=unused-argument

    board_config = env.BoardConfig()

    port = env.subst("$UPLOAD_PORT")

    if not port:
        raise Errors.BuildError(errstr="Please config upload_port.")

    parts = board_config.get("upload_partitions", {})

    partitions = [v for k, v in parts.items() if v['partition_type'] == 'flash']

    if len(partitions) == 0:
        raise Errors.BuildError(errstr="Please config partition_type:flash to burn.")

    partition = partitions[0]

    if not partition.get('partition_bin', ''):
        raise Errors.BuildError(errstr=f"Partition {partition['partition_type']} file not found."
                                "Please config partition_bin for it")

    partition.update({
        'partition_bin':
        os.path.abspath(env.subst(partition['partition_bin']))
    })
    if not os.path.isfile(partition["partition_bin"]):
        raise Errors.BuildError(errstr=f"Partition {partition['partition_type']} file not found:"
                                f"{partition['partition_bin']}")

    result = -1

    TOOL_NAME = 'AmebaZII_PGTool_v1.2.39.exe' if "windows" in get_systype() else 'AmebaZII_PGTool_Linux_v1.0.9'
    commands = [
        {"args":[TOOL_NAME,
                "-set", "baudrate", "921600"],
         "fail":[]},
        {"args":[TOOL_NAME,
                "-add", "device", port],
         "fail":[]},
        {"args": [TOOL_NAME,
                "-set", "image", partition["partition_bin"]],
         "fail":[]},
        {"args": [TOOL_NAME, "-download"],
         "fail": ["error", "Err", "failed", "Received:"]}
    ]


    for command in commands:
        try:
            res = __exec(command['args'])
            result = res['returncode'] if res['returncode'] is not None else -1
            if result != 0:
                break

        except Exception as ex:  # pylint: disable=broad-except
            click.secho(f"An error has been occured during flash board", fg="red")
            result = -1
            break

        if 'out' in res and (not res['out'] or fail_check(command['fail'], res['out'].splitlines())):
            result = -1

    return result


Import("env")

burn_env = env  # noqa: F821  # pylint: disable=undefined-variable

burn_env.AddMethod(AmebazpgtoolUpload)
