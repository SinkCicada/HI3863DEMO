# pylint: disable=too-many-branches, too-many-locals
from tempfile import mkdtemp
import os
import click
from hiburn_adapter import HiBurn
from platformio import (fs, proc)
from platformio.project.helpers import get_project_cache_dir
from SCons.Script import (Import, ARGUMENTS)


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
    return HiBurnRunCmd(environ, target, source, env, "burn")


def HiBurnErase(environ, target, source, env):
    return HiBurnRunCmd(environ, target, source, env, "erase")


def hiburn_run_result(action, partitions, kwargs, env):
    verbose = bool(int(ARGUMENTS.get("PIOVERBOSE", 0)))
    project_cache_dir = get_project_cache_dir()
    if not os.path.isdir(project_cache_dir):
        os.makedirs(project_cache_dir)

    cache_dir = mkdtemp(dir=project_cache_dir, prefix=".hiburn-")
    log_path = os.path.join(project_cache_dir, "logs-hiburn")
    tool_path, jre_path = get_tools_location(env)

    result = -1

    try:
        click.secho("Operation paused, Please press Enter key to continue", fg="blue")
        input()
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

        if action == "burn":
            result = hiburn.burn(partitions, chip=env.get("BOARD"), **kwargs)
        else:
            result = hiburn.erase(partitions, chip=env.get("BOARD"), **kwargs)

    except Exception as ex:  # pylint: disable=broad-except
        click.secho(f"An error has been occured during flash board", fg="red")

    finally:
        stdout.close()
        stderr.close()
        if not verbose:
            fs.rmtree(cache_dir)
    return result


def HiBurnRunCmd(environ, target, source, env, action):  # pylint: disable=unused-argument
    required_options = {
        "net": ['port', 'net_server_ip', 'net_client_ip', 'net_client_mask', 'net_client_gw'],
        "serial": ['port'],
        "usb": []
    }

    board_config = env.BoardConfig()
    parts = board_config.get("upload_partitions")
    check_partition_file = True
    mode = env.subst("$UPLOAD_PROTOCOL").split('-')[1]

    if action == "erase":
        check_partition_file = False
        mode = "serial"

    partitions = []
    for _, part in parts.items():
        if 'partition_bin' not in part or not part['partition_bin']:
            part['partition_bin'] = ''

        else:
            part.update({'partition_bin': os.path.abspath(env.subst(part['partition_bin']))})
            if check_partition_file and not os.path.isfile(part["partition_bin"]):
                click.secho(f"Binary for partition `{part['partition_type']}` not found: {part['partition_bin']}",
                            fg="red")
                return 2

        if part["partition_type"] == "fastboot":
            partitions.insert(0, part)
        else:
            partitions.append(part)

    kwargs = dict(
        mode=mode,
        port=env.subst("$UPLOAD_PORT"),
        net_server_ip=env.subst("$UPLOAD_NET_SERVER_IP"),
        net_client_ip=env.subst("$UPLOAD_NET_CLIENT_IP"),
        net_client_mask=env.subst("$UPLOAD_NET_CLIENT_MASK"),
        net_client_gw=env.subst("$UPLOAD_NET_CLIENT_GW"),
        net_server_port=env.subst("$UPLOAD_NET_SERVER_PORT") or "69"
    )

    missed_options = []
    if mode in required_options:
        missed_options = [k for k, v in kwargs.items() if k in required_options[mode] and not v]

    if any(missed_options):
        click.secho("Project options required"
                    f" to perform uploading with '{env.subst('$UPLOAD_PROTOCOL')}':"
                    f" {['upload_' + k for k in missed_options]}", fg="red"
                    )
        return -1

    res = hiburn_run_result(action, partitions, kwargs, env)
    
    return res

Import("env")

hiburn_env = env  # noqa: F821  # pylint: disable=undefined-variable

hiburn_env.AddMethod(HiBurnUpload)
hiburn_env.AddMethod(HiBurnErase)
