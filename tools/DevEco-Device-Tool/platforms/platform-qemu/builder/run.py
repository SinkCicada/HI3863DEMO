import click
import os
import sys
from SCons.Script import (Import)
from SCons.Script import ARGUMENTS  # pylint: disable=import-error
from platformio.util import get_systype
from platformio.helpers import get_config_json_path
from SCons import Errors
from os.path import join
import subprocess
from platformio.project.config import ProjectConfig


def qemuUpload(environ, target, source, env):  # pylint: disable=unused-argument
    client_port = ARGUMENTS.get("CLIENTPORT", '0')
    board_config = env.BoardConfig()
    projectDir = env.subst("$PROJECT_DIR")
    configBoard = board_config.get("frameworks").get("hb").get("build").get("board")
    qemuName = "qemu-windows-arm.exe" if "windows" in get_systype() else "qemu-linux-arm"
    qemuToolPath = os.path.join(get_config_json_path(), "tools", "qemu", qemuName)
    command = {
        "qemurun": [qemuToolPath, "-machine", configBoard, "-img-path", projectDir],
        "success": "Upgrade OK"
    }
    if client_port != "0":
        command.get('qemurun').extend(["-debug-port", client_port])
    exit_code = -1
    try:
        p = subprocess.run(command.get('qemurun'))
        exit_code = p.returncode
    except Exception as ex:  # pylint: disable=broad-except
        click.secho(f"An error has been occured during run qemu", fg="red")

    return exit_code


Import("env")

burn_env = env  # noqa: F821  # pylint: disable=undefined-variable

burn_env.AddMethod(qemuUpload)
