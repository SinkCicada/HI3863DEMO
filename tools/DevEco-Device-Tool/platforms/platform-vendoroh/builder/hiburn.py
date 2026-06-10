# pylint: disable=too-many-branches, too-many-locals
import os
import re
import subprocess

import click
import serial
from platformio.util import get_systype
from SCons.Script import Import


def HiBurnUpload(environ, target, source, env):
    upload_env = env  # noqa: F821
    board = upload_env.BoardConfig()
    
    output_bin = board.get("upload").get("framework_partition") \
                        .get("hb").get("output_bin").get("app")
    output_bin = os.path.join(env.subst("$PROJECT_DIR"), output_bin)

    tool_path = os.path.join(env.subst("$COMPILER_BIN_PATH"), "burntool", "BurnTool.exe")

    port = env.subst("$UPLOAD_PORT")
    speed = env.subst("$UPLOAD_SPEED")
    reset = env.subst("$UPLOAD_RESET")
    board_id = env.subst("$BOARD")

    if "windows" in get_systype():
        if port:
            re_res = re.match(r'com(\d+)', port, re.I)
            com = re_res.group(1)
        else:
            click.secho("Please config upload_port.", fg="red")
            return -1

    try:
        s = serial.Serial(port, int(speed), timeout=1)
        s.close()
    except(OSError, serial.SerialException) as e:
        click.secho(f"error 4: upload port is occupied.", fg="red")
        return -1

    args = [
        tool_path,
        '-com:%s' % com,
        '-bin:%s' % output_bin,
        '-signalbaud:%s' % speed
    ]
    if reset == "True":
        args.append('-reset')
    try:
        res = subprocess.run(args)
        result = res.returncode
    except Exception as ex:
        click.secho(f"error:An unknown error has been occured", fg="red")

    return result

Import("env")

hiburn_env = env  # noqa: F821  # pylint: disable=undefined-variable

hiburn_env.AddMethod(HiBurnUpload)
