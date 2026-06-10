import os
import subprocess
from SCons.Script import (Import)
from platformio.proc import split_cmd_line
Import("env")

builder_env = env  # pylint: disable=undefined-variable


def MenuConfig(environ, target, source, env):  # pylint: disable=unused-argument, too-many-locals
    board_config = builder_env.BoardConfig()
    menu_config = board_config.get("frameworks", {}).get('hb', {}).get("menuconfig", {})
    os_path = env.subst("$CUSTOM_SDK_OS_PATH")
    os_path = os_path if os_path else menu_config.get("path", "")
    build_cmd = env.subst("$CUSTOM_MENU_CONFIG_CMD")
    build_cmd = build_cmd if build_cmd else menu_config.get("cmd", "")

    fullcmd = split_cmd_line(build_cmd)
    cwd = os_path if os.path.isabs(os_path) else \
        os.path.join(env.subst("$PROJECT_DIR"), os_path)
    cp = subprocess.run(fullcmd, cwd=cwd)
    return cp.returncode

builder_env.AddMethod(MenuConfig)
