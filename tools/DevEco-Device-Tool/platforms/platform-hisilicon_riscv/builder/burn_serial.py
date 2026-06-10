import os
import re
import click
import shutil
from platformio import (proc)
from SCons.Script import (Import)
from SCons import Errors
from platformio.util import get_systype

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


def upload_run_result(port, partition, env):

    speed = env.subst("$UPLOAD_SPEED")
    reset = env.subst("$UPLOAD_RESET")

    if not speed:
        raise ValueError(f"Invalid value: {speed}")

    result = -1
    args = [
        'burntool.exe',
        '-com:%s' % port,
        '-bin:%s' % partition['partition_bin'],
        '-signalbaud:%s' % speed
    ]
    if reset == "True":
        args.append('-reset')

    click.echo(f'upload args: {args}')
    try:
        res = __exec(args)
        result = res['returncode'] if res['returncode'] is not None else -1
    except IOError as ex:
        click.secho(f"error:monitor port used", fg="red")
    except Exception as ex:
        click.secho(f"error:An unknown error has been occured", fg="red")

    return result


def BurnSerialUpload(environ, target, source, env):  # pylint: disable=unused-argument

    if "windows" not in get_systype():
        raise Errors.BuildError(errstr="Currently, burn-serial only supports Windows.")

    if not shutil.which("burntool.exe"):
        raise Errors.BuildError(errstr="Burntool path incorrect, Please, configure correctly 'tool_burn' on 'Tools' page")

    board_config = env.BoardConfig()
    parts = board_config.get("upload_partitions", {})
    port = env.subst("$UPLOAD_PORT")

    if "windows" in get_systype():
        re_res = re.match(r'com(\d+)', port, re.I)
        if not re_res:
            raise Errors.BuildError(errstr="Please config upload_port.")   
        else:
            port = re_res.group(1)

    if len(parts) > 1:
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
        raise Errors.BuildError(errstr="Please config upload_partitions to burn.")

    res = upload_run_result(port, partition, env)

    return res


Import("env")

burn_env = env  # noqa: F821 # pylint: disable=undefined-variable

burn_env.AddMethod(BurnSerialUpload)
