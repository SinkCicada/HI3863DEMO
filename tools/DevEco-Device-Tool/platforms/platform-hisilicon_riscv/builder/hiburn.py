# pylint: disable=too-many-branches, too-many-locals
from tempfile import mkdtemp
import os
import click
from hiburn_adapter import HiBurn
from platformio import (fs, proc)
from platformio.project.helpers import get_project_cache_dir
from SCons.Script import (Import, ARGUMENTS)
from SCons import Errors


def _echo_stdout_line(line):
    click.secho(line, fg=None, nl=False)


def _echo_stderr_line(line):
    click.secho(line, fg="red", nl=False)


def get_tools_location(env):
    platform = env.PioPlatform()
    jre_path = platform.get_package_dir("tool_openjdk_jre")
    jre_path = os.path.join(jre_path, 'bin') if jre_path else None
    tool_path = env.subst("$CUSTOM_TOOL_PATH") if env.subst("$CUSTOM_TOOL_PATH") else \
                                        platform.get_upload_tool("tool_hiburn")
    return tool_path, jre_path


def HiBurnUpload(environ, target, source, env):
    return HiBurnOneRunCmd(environ, target, source, env)


def hiburn_get_partition(bin_file, parts, env):
    partition = {}
    if bin_file:
        partition = {"partition_type": "UploadBin", "partition_bin": bin_file}
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
    elif len(parts) > 1:
        raise Errors.BuildError(errstr="Only supported one partition to burn.")
    else:
        raise Errors.BuildError(errstr="Please config upload_partitions or upload_bin_file to burn.")
    return partition


def HiBurnOneRunCmd(environ, target, source, env):

    board_config = env.BoardConfig()
    parts = board_config.get("upload_partitions", {})
    port = env.subst("$UPLOAD_PORT")
    speed = env.subst("$UPLOAD_SPEED")
    delay_time = env.subst("$UPLOAD_DELAY_TIME")
    bin_file = env.subst("$UPLOAD_BIN_FILE")
    if not port:
        raise Errors.BuildError(errstr="Please config upload_port.")

    partition = hiburn_get_partition(bin_file, parts, env)

    result = -1

    project_cache_dir = get_project_cache_dir()
    if not os.path.isdir(project_cache_dir):
        os.makedirs(project_cache_dir)

    cache_dir = mkdtemp(dir=project_cache_dir, prefix=".hiburn-")
    log_path = os.path.join(project_cache_dir, "logs-hiburn")
    tool_path, jre_path = get_tools_location(env)
    verbose = bool(int(ARGUMENTS.get("PIOVERBOSE", 0)))

    kwargs = dict(
        bin_file=partition['partition_bin'],
        chip=board_config.get("build", {}).get("mcu", ""),
        port=port,
        speed=speed,
        delay_time = delay_time
    )
    try:
        stdout = proc.LineBufferedAsyncPipe(line_callback=_echo_stdout_line)
        stderr = proc.LineBufferedAsyncPipe(line_callback=_echo_stderr_line)
        hiburn = HiBurn(
            cache_dir=cache_dir,
            log_path = log_path,
            tool_path=tool_path,
            jre_path=jre_path,
            debug=verbose,
            stdout=stdout,
            stderr=stderr)

        print("upload args:", kwargs)
        result = hiburn.burn_one(**kwargs)
    except Exception as ex:  # pylint: disable=broad-except
        click.secho(f"An error has been occured during flash board", fg="red")
    finally:
        stdout.close()
        stderr.close()
        if not verbose:
            fs.rmtree(cache_dir)
    return result


Import("env")

hiburn_env = env  # noqa: F821  # pylint: disable=undefined-variable

hiburn_env.AddMethod(HiBurnUpload)
