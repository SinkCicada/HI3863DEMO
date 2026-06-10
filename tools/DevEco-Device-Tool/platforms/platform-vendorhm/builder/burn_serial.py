import os

import click
from SCons.Script import Import
from SCons import Errors

from platformio import proc
from platformio.util import get_systype
from platformio.project.helpers import get_project_cache_dir


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


def get_tools_location(env):
    return os.path.abspath(os.path.join(env.subst("$CHIP_PACKAGE_PATH"), '../', 'IDE', 'tool_burncli'))


def BurnSerialUpload(environ, target, source, env):  # pylint: disable=unused-argument
    if "windows" not in get_systype():
        raise Errors.BuildError(errstr="Currently, burn-serial only supports Windows.")

    platform = env.PioPlatform()
    board_config = env.BoardConfig()
    port = env.subst("$UPLOAD_PORT")
    speed = env.subst("$UPLOAD_SPEED")
    bin_file = env.subst("$UPLOAD_BIN_FILE")

    if not port:
        raise Errors.BuildError(errstr="upload_port is empty or Invalid, Please config it in Project Settings")

    if not bin_file:
        raise Errors.BuildError(errstr="Please config upload_bin_file to burn.")

    partition = os.path.abspath(bin_file)
    if not os.path.isfile(partition):
        raise Errors.BuildError(errstr=f"upload_bin_file Invalid, File not found: {partition}")

    cache_dir = get_project_cache_dir()
    if not os.path.isdir(cache_dir):
        os.makedirs(cache_dir)
    log_path = os.path.join(cache_dir, "logs-burncli")
    jre_path = platform.get_package_dir("tool_openjdk_jre")
    jre_exe = os.path.join(jre_path, 'bin', 'java.exe') if jre_path else 'java.exe'

    args = [
        jre_exe,
        '-Duser.language=en',
        '-jar',
        'burntoolcli.jar',
        '--burn',
        '-n', board_config.get("build", {}).get("mcu", ""),
        '-m', 'serial', port, str(speed),
        '-t', '0x200',
        '-b', partition,
        '-lp', log_path
    ]

    result = -1
    try:
        res = __exec(args, cwd=get_tools_location(env))
        result = res['returncode'] if res['returncode'] is not None else -1
    except Exception as ex:  # pylint: disable=broad-except
        click.secho(f"An error has been occured during flash board", fg="red")

    return result

Import("env")

burn_env = env  # noqa: F821 # pylint: disable=undefined-variable

burn_env.AddMethod(BurnSerialUpload)
