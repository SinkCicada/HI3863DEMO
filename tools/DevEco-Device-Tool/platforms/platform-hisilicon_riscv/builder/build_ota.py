import os
import subprocess
from SCons.Script import (Import)
Import("env")

builder_env = env  # pylint: disable=undefined-variable


def BuildOta(environ, target, source, env):  # pylint: disable=unused-argument, too-many-locals
    board_config = builder_env.BoardConfig()
    build_config = board_config.get("frameworks", {}).get('hb', {}).get("build_ota", {})
    os_path = env.subst("$CUSTOM_SDK_OS_PATH")
    os_path = os_path if os_path else build_config.get("path", "")
    build_cmd = env.subst("$CUSTOM_BUILD_OTA_CMD")
    build_cmd = build_cmd if build_cmd else build_config.get("cmd", "")

    fullcmd = build_cmd.split(" ")
    cwd = os_path if os.path.isabs(os_path) else \
        os.path.join(env.subst("$PROJECT_DIR"), os_path)
    cp = subprocess.run(fullcmd, cwd=cwd)
    return cp.returncode

builder_env.AddMethod(BuildOta)
