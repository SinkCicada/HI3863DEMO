
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


def BflbEflashLoaderUpload(environ, target, source, env):  # pylint: disable=unused-argument

    if 'linux' in get_systype():
        raise Errors.BuildError(errstr='Can not Upload on linux')

    board_config = env.BoardConfig()

    port = env.subst("$UPLOAD_PORT")
    speed = env.subst("$UPLOAD_SPEED")

    if not port:
        raise Errors.BuildError(errstr="Please config upload_port.")

    parts = board_config.get("upload_partitions", {})

    partitions = [v for k, v in parts.items() if v['partition_type'] == 'firmware']

    if len(partitions) == 0:
        raise Errors.BuildError(errstr="Please config partition_type:firmware to burn.")

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

    name = board_config.get("name", '')
    command = {
            "args":[
                "bflb_eflash_loader.exe",
                "-w", "--flash", f"--chipname={name}",
                "-p", port,
                "-b", speed,
                f"--mass={partition['partition_bin']}"
            ],
            "success": "All Success"
    }

    tool_path = os.path.realpath(env.subst("$CUSTOM_TOOL_PATH"))

    result = -1
    try:
        res = __exec(command['args'], cwd=tool_path)
        result = res['returncode'] if res['returncode'] is not None else -1
    except Exception as ex:  # pylint: disable=broad-except
        click.secho(f"An error has been occured during flash board", fg="red")
    
    if result == 0 and command['success'] not in res['out'].splitlines()[-1]:
        result = -1

    return result


Import("env")

burn_env = env  # noqa: F821  # pylint: disable=undefined-variable

burn_env.AddMethod(BflbEflashLoaderUpload)
