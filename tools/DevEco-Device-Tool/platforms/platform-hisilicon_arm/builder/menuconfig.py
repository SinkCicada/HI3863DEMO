import os
from SCons.Script import (Import)
from SCons import Errors
import subprocess
import hb_adapter
from platformio.proc import split_cmd_line

Import("env")

builder_env = env  # pylint: disable=undefined-variable
pioframework = builder_env.get("PIOFRAMEWORK")
board_config = builder_env.BoardConfig()
menu_config = board_config.get("frameworks", {}).get(pioframework[0], {}).get("menuconfig", {})


def MenuConfig(environ, target, source, env):  # pylint: disable=unused-argument, too-many-locals
    if 'hb' in pioframework:
        build_product = board_config.get("frameworks.hb.build.product", "")
        try:
            product_name, company = build_product.split('@')
        except ValueError as ex:
            raise Errors.BuildError(
                errstr=f"Please set 'board_frameworks.hb.build.product' in project options"
            )

        hb = hb_adapter.Hb(env.subst("$PROJECT_DIR"), stdout=None, stderr=None)
        hb.setting(root_path=env.subst("$PROJECT_DIR"))
        hb.setting_product(product_name, company)

    os_path = env.subst("$CUSTOM_SDK_OS_PATH")
    os_path = os_path if os_path else menu_config.get("path", "")
    if not os_path:
        raise Errors.BuildError(errstr="Please set 'custom_sdk_os_path' in project options")

    menu_cmd = env.subst("$CUSTOM_MENU_CONFIG_CMD")
    menu_cmd = menu_cmd if menu_cmd else menu_config.get("cmd", "")
    if not menu_cmd:
        raise Errors.BuildError(errstr="Please set 'custom_menu_config_cmd' in project options")

    fullcmd = split_cmd_line(menu_cmd)
    cwd = os_path if os.path.isabs(os_path) else \
        os.path.join(env.subst("$PROJECT_DIR"), os_path)
    cp = subprocess.run(fullcmd, cwd=cwd)
    return cp.returncode

builder_env.AddMethod(MenuConfig)
