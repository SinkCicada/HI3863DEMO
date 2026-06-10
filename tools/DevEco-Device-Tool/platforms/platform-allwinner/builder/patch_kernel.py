import os
import subprocess
from SCons.Script import (Import)
from platformio.proc import split_cmd_line
Import("env")

builder_env = env  # pylint: disable=undefined-variable


def PatchKernel(environ, target, source, env):  # pylint: disable=unused-argument
    board_config = builder_env.BoardConfig()
    patch_config = board_config.get("frameworks", {}).get('ohos-sources', {}).get("patch_kernel", {})
    exec_path = patch_config.get("path", env.subst("$PROJECT_DIR"))
    cmds = patch_config.get("cmd", [])
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

builder_env.AddMethod(PatchKernel)
