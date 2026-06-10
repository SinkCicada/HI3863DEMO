import os
import re
from os.path import (join, isfile, isdir, isabs)
import click
from platformio import (fs, proc)
from SCons.Script import (Import, ARGUMENTS)
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


def DldtoolUpload(environ, target, source, env):

    board_config = env.BoardConfig()
    platform = env.PioPlatform()
    
    program_bin = join(platform.get_package_dir('dldtool'), 'programmer.bin')
    
    if not isfile(program_bin) or not isabs(program_bin):
        raise Errors.BuildError(errstr="programmer.bin file not found.")

    port = env.subst("$UPLOAD_PORT")
    parts = board_config.get("upload_partitions", {})

    if "windows" in get_systype():
        re_res = re.match(r'com(\d+)', port, re.I)
        if not re_res:
            raise Errors.BuildError(errstr="Please config upload_port.")
        else:
            port = re_res.group(1)

    partitions = [v for k, v in parts.items() if v['partition_type'] == 'app']

    if len(partitions) == 0:
        raise Errors.BuildError(errstr="Please config partition_type:app to burn.")

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

    command = {
        "args":["dldtool.exe", port,
                program_bin,
                partition["partition_bin"],
                ],
        "success": "PROGRAMMING SUCCEEDED"
    }

    try:
        res = __exec(command['args'])
        result = res['returncode'] if res['returncode'] is not None else -1

    except Exception as ex:
        click.secho(f"An error has been occured during flash board", fg="red")
        result = -1

    if result == 0 and command['success'] not in res['out'].splitlines()[-3]:
        result = -1

    return result

Import("env")

burn_env = env  # noqa: F821

burn_env.AddMethod(DldtoolUpload)
