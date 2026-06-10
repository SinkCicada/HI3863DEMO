# pylint: disable=too-many-branches, too-many-locals
import os
import platform
import subprocess
import tempfile
import click
from platformio import (fs, proc)
from SCons.Script import (Import, ARGUMENTS)
from SCons import Errors
from platformio.project.helpers import get_project_cache_dir


UUU_NAME = "uuu.exe" if platform.system() == "Windows" else "uuu"


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

    try:
        p = subprocess.Popen(cmd, **kwargs)
        out, err = p.communicate(timeout=60)

        if isinstance(out, bytes):
            out = out.decode()

        if isinstance(err, bytes):
            err = err.decode()

    except subprocess.TimeoutExpired as e:
        p.kill()
        raise TimeoutError('Timeout and Ensure that fastboot is available on the board') from e

    finally:
        if isinstance(stdout, proc.AsyncPipeBase):
            stdout.close()

        if isinstance(stderr, proc.AsyncPipeBase):
            stderr.close()

    return p.returncode, out if out is not None else '', err if err is not None else ''


def UuuUpload(environ, target, source, env):  # pylint: disable=unused-argument

    verbose = bool(int(ARGUMENTS.get("PIOVERBOSE", 0)))
    board_config = env.BoardConfig()

    parts = board_config.get("upload_partitions")

    if len(parts) == 0:
        raise Errors.BuildError(errstr="Please select partition to burn.")

    partition_fastboot = []
    partition_images = []
    for _, part in parts.items():
        part.update({'partition_bin': os.path.abspath(env.subst(part['partition_bin']))})
        if not os.path.isfile(part["partition_bin"]):
            raise Errors.BuildError(errstr=f"{part['partition_type']} file not found: {part['partition_bin']}")

        if part["partition_type"] == "fastboot":
            partition_fastboot.append(part)
        else:
            partition_images.append(part)

    cmds = ['uuu_version 1.2.39']

    if len(partition_fastboot) > 0:
        cmds.append(f"SDP: boot -f {partition_fastboot[0]['partition_bin']}")
    if len(partition_images) > 0:
        cmds.append('FB[-t 60000]: ucmd setenv emmc_dev 1')
        for item in partition_images:
            cmds.append(f"FB: download -f {item['partition_bin']}")
            cmds.append('FB[-t 60000]: ucmd ext4write  mmc  ${emmc_dev}:2  ${fastboot_buffer} /%s  ${fastboot_bytes}' \
                        % item['partition_destination'])
        cmds.append('FB: Done')
    else:
        cmds.append('SDP: Done')


    if not os.path.isdir(get_project_cache_dir()):
        os.makedirs(get_project_cache_dir())
    cache_dir = tempfile.mkdtemp(dir=get_project_cache_dir(), prefix=".nxp-")
    with tempfile.NamedTemporaryFile(prefix="nxp-", suffix=".clst", dir=cache_dir, delete=False) as parts_file:
        separator_str = '\r\n'
        parts_file.write(separator_str.join(cmds).encode())
        parts_file.flush()

    clst_name = os.path.basename(parts_file.name)
    exec_cmd = [UUU_NAME, clst_name]
    result = -1

    try:
        err, _, _ = __exec(exec_cmd, cwd=cache_dir)
        result = err

    except Exception as ex:  # pylint: disable=broad-except
        click.secho(f"An error has been occured during flash board", fg="red")

    finally:
        if not verbose:
            fs.rmtree(cache_dir)

    return result



Import("env")

uuu_env = env  # noqa: F821  # pylint: disable=undefined-variable

uuu_env.AddMethod(UuuUpload)
