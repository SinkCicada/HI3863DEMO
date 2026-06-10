import os
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


def fail_check(cmd_fails, cmd_out):
    for out in cmd_out:
        if any([f for f in cmd_fails if f in out]):
            return True
    return False


def __exec(cmd, **kwargs):

    stdout = proc.LineBufferedAsyncPipe(line_callback=_echo_stdout_line)
    stderr = proc.LineBufferedAsyncPipe(line_callback=_echo_stderr_line)

    path_cmd = os.path.join(os.path.abspath('.'), 
                            'device', 'board', 'bearpi', 'bearpi_hm_micro', 'tools', 'download_img') 
    
    default = dict(stdout=stdout,
                   stderr=stderr,
                   shell=False,
                   cwd=path_cmd)
    default.update(kwargs)
    kwargs = default
 
    result = proc.exec_command(cmd, **kwargs)

    return result


def Copyfile(source_path, target_path):
    if not os.path.exists(target_path):
        os.makedirs(target_path)
    if os.path.exists(source_path):
        for file in os.listdir(source_path):
            file_path = os.path.join(source_path, file)
            if os.path.isfile(file_path):
                shutil.copy(file_path, target_path)


def Stm32progammerUpload(environ, target, source, env):  # pylint: disable=unused-argument
    board_config = env.BoardConfig()

    parts = board_config.get("upload_partitions", {})

    partitions = []
    for _, part in parts.items():
        if not part.get('partition_bin', ''):
            click.secho(
                f"Binary for partition `{part['partition_type']}` not found. Please config partition_bin for it",
                fg="red")
            return 2

        part.update({'partition_bin': os.path.abspath(env.subst(part['partition_bin']))})
        if not os.path.isfile(part["partition_bin"]):
            click.secho(f"Binary for partition `{part['partition_type']}` not found: {part['partition_bin']}",
                        fg="red")
            return 2

        if part["partition_type"] == "fastboot":
            partitions.insert(0, part)
        else:
            partitions.append(part)

    partition = {}
    partition_kernel = {}
    for v in partitions:
        if v['partition_type'] == 'bearpi_hm_micro_tsv':
            partition = v
        if v['partition_type'] == 'kernel':
            partition_kernel = v

    fpath, _ = os.path.split(partition_kernel["partition_bin"])
    
    kernel_path = os.path.join(os.path.abspath('.'), 
                               'device', 'board', 'bearpi', 'bearpi_hm_micro', 'tools', 'download_img', 'kernel')
    Copyfile(fpath, kernel_path)
    
    result = -1

    TOOL_NAME = 'STM32_Programmer_CLI.exe'
    commands = [{"args":[TOOL_NAME, "-c", "port=USB1", "-d", partition["partition_bin"]], "fail": ["Error"]}]

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

burn_env.AddMethod(Stm32progammerUpload)
