import os
import click
import subprocess
from SCons.Script import (Import)
from platformio.proc import split_cmd_line
Import("env")

builder_env = env  # pylint: disable=undefined-variable


def build_sdk(board_config, env):
    if board_config.get("name") == "xr806":
        env.patch_xr806_compiler_path()

    sdk_config = board_config.get("frameworks", {}).get('hb', {}).get("build_sdk", {})
    exec_path = sdk_config.get("path", env.subst("$PROJECT_DIR"))
    cmds = sdk_config.get("cmd", [])
    cwd = exec_path if os.path.isabs(exec_path) else \
            os.path.join(env.subst("$PROJECT_DIR"), exec_path)

    ret_code = 1
    for build_cmd in cmds:
        fullcmd = split_cmd_line(build_cmd)
        cp = subprocess.run(fullcmd, cwd=cwd)
        ret_code = cp.returncode
        if ret_code != 0 :
            break

    return ret_code


def MenuConfig(environ, target, source, env):  # pylint: disable=unused-argument
    board_config = builder_env.BoardConfig()
    menu_config = board_config.get("frameworks", {}).get('hb', {}).get("menuconfig", {})
    os_path = env.subst("$CUSTOM_SDK_OS_PATH")
    os_path = os_path if os_path else menu_config.get("path", "")
    build_cmd = env.subst("$CUSTOM_MENU_CONFIG_CMD")
    build_cmd = build_cmd if build_cmd else menu_config.get("cmd", "")
    fullcmd = split_cmd_line(build_cmd)
    cwd = os_path if os.path.isabs(os_path) else \
        os.path.join(env.subst("$PROJECT_DIR"), os_path)

    result_code = 0
    cp = subprocess.run(fullcmd, cwd=cwd)
    if (cp.returncode != 0):
        return cp.returncode
    result_code = cp.returncode

    click.echo()
    res = input(click.style('Do you want to rebuild sdk? [Y/n]: ', fg='green'))
    if res not in ['N', 'n']:
        result_code = build_sdk(board_config, env)

    return result_code

builder_env.AddMethod(MenuConfig)
