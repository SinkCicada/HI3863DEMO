import os
import tempfile
import click
import shutil
from platformio import (proc)
from SCons.Script import (Import)
from SCons import Errors
from platformio.util import get_systype
from platformio.project.helpers import get_project_cache_dir


def _echo_stdout_line(line):
    click.secho(line, fg=None, nl=False)


def _echo_stderr_line(line):
    click.secho(line, fg="red", nl=False)


def _get_int_value(val) -> int:
    if isinstance(val, int):
        return val
    if isinstance(val, str):
        return (val.startswith("0x") and int(val, 16)) or int(val, 0)
    raise ValueError(f"Don't know how to interpret value {val} of type {type(val)}")


def _exec(cmd, **kwargs):
    stdout = proc.LineBufferedAsyncPipe(line_callback=_echo_stdout_line)
    stderr = proc.LineBufferedAsyncPipe(line_callback=_echo_stderr_line)
    default = dict(stdout=stdout,
                   stderr=stderr,
                   shell=False)
                   
    default.update(kwargs)
    kwargs = default

    result = proc.exec_command(cmd, **kwargs)

    return result


def JlinkUpload(environ, target, source, env):  # pylint: disable=unused-argument
    board_config = env.BoardConfig()
    parts = board_config.get("upload_partitions", {})
    partitions = [v for k, v in parts.items() if v['partition_type'] == 'bin']

    if len(partitions) < 1:
        raise Errors.BuildError(errstr="Please config partition_type:bin to upload")

    upload_files = []
    for _, part in parts.items():
        part.update({
            'partition_bin':
            os.path.abspath(env.subst(part['partition_bin']))
        })
        if not os.path.isfile(part["partition_bin"]):
            raise Errors.BuildError(errstr=f"{part['partition_type']} file not found: {part['partition_bin']}")
        
        upload_file = part["partition_bin"]
        addr = hex(_get_int_value(part.get("partition_addr", 0)))
        upload_files.append(f"loadbin {upload_file} {addr}")

    result = -1
    
    if not os.path.isdir(get_project_cache_dir()):
        os.makedirs(get_project_cache_dir())
    cache_dir = tempfile.mkdtemp(dir=get_project_cache_dir(), prefix=".jlink-")

    with tempfile.NamedTemporaryFile(prefix="jlink-",
                                     suffix=".jlink",
                                     dir=cache_dir,
                                     delete=False) as cmd_script_file:

        cmd_lines = ["r", *upload_files, "g", "qc"]
        separator_str = '\r\n'
        cmd_script_file.write(separator_str.join(cmd_lines).encode())
        cmd_script_file.flush()

    try:
        speed = env.subst("$UPLOAD_SPEED")
        args = [
            'JLinkExe' if "linux" in get_systype() else 'Jlink.exe',
            '-device', 'AMA4B2KK-KBR',
            '-if', 'swd',
            '-speed', speed if speed else '4000',
            '-jtagconf', '-1,-1',
            '-autoconnect', '1',
            '-ExitOnError',
            '-CommanderScript', str(cmd_script_file.name)
        ]
        res = _exec(args)
        result = res['returncode'] if res['returncode'] is not None else -1
    except Exception as ex:  # pylint: disable=broad-except
        click.secho(f"An error has been occured during flash board", fg="red")
    finally:
        shutil.rmtree(cache_dir, ignore_errors=True)

    return result


Import("env")

burn_env = env  # noqa: F821 # pylint: disable=undefined-variable

burn_env.AddMethod(JlinkUpload)
