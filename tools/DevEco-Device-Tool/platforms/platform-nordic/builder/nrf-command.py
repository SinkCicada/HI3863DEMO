#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Copyright (c) Huawei Technologies Co., Ltd. 2021-2021. All rights reserved.
Description: nordic upload script
Create: 2021-08-23
"""

import os
import re
import click
from platformio import (proc)
from SCons.Script import (Import)
from platformio.util import get_systype


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


def exec_args(args):
    result = -1
    try:
        res = __exec(args)
        result = res['returncode'] if res['returncode'] is not None else -1
    except Exception as ex:  # pylint: disable=broad-except
        click.secho(f"An error has been occured during flash board", fg="red")
    return result


def upload_result(parts, build_path, version_name, env):
    partition = list(parts.items())[0][1]
    if (partition['partition_type'] == 'app'):
        partition.update({'partition_bin': os.path.join(build_path, '_build', env.subst(partition['partition_bin']))})

        if not os.path.isfile(partition["partition_bin"]):
            click.secho(f"File not found: {partition['partition_bin']}", fg="red")
            return 2

    args = ['nrfjprog.exe', '--eraseall', '-f', 'NRF52']
    result = exec_args(args)

    if result != 0:
        click.secho("erase chip Failed", fg="red")
        return result

    bootloader_path = os.path.join(env.subst("$PROJECT_DIR"), 'components', 'softdevice', version_name,
                                   'hex', env.subst("$NRF_BOOTLOADER_HEX"))
    args = ['nrfjprog.exe', '--program', bootloader_path]
    result = exec_args(args)

    if result != 0:
        click.secho("program %s Failed" % bootloader_path, fg="red")
        return result

    args = ['nrfjprog.exe', '--program', partition['partition_bin'], '--verify', '-f', 'NRF52']
    result = exec_args(args)

    if result != 0:
        click.secho("program %s Failed" % partition['partition_bin'], fg="red")
        return result

    args = ['nrfjprog.exe', '--reset', '-f', 'NRF52']
    result = exec_args(args)

    if result != 0:
        click.secho("Reset Failed", fg="red")

    return result


def CommandUpload(environ, target, source, env):  # pylint: disable=unused-argument,R0911,R0912
    if "windows" not in get_systype():
        click.secho("Currently, nrf-command only supports Windows.", fg="red")
        return 2

    board_config = env.BoardConfig()
    parts = board_config.get("upload_partitions", {})

    port = env.subst("$UPLOAD_PORT")

    if "windows" in get_systype():
        re_res = re.match(r'com(\d+)', port, re.I)
        if not re_res:
            click.secho("Please config upload_port.", fg="red")
            return 2
        else:
            port = re_res.group(1)

    if len(parts) != 1:
        click.secho("Please config partition_type:app to burn.", fg="red")
        return 2

    build_path = env.GetProjectOption("build_device_path", '')
    if not build_path:
        build_path = os.path.join(env.subst("$PROJECT_DIR"), 'examples',
                                  'ble_peripheral', 'ble_app_hids_keyboard',
                                  'pca10056', 's140', 'armgcc')
    else:
        build_path = os.path.join(env.subst("$PROJECT_DIR"), 'examples',
                                  build_path.split("examples\\")[-1])

    version_name = os.path.basename(os.path.dirname(build_path))

    res = upload_result(parts, build_path, version_name, env)

    return res

Import("env")

burn_env = env  # noqa: F821 # pylint: disable=undefined-variable

burn_env.AddMethod(CommandUpload)
