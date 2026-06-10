#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Copyright (c) Huawei Technologies Co., Ltd. 2021-2021. All rights reserved.
Description: 
Create: 2021-12-30
"""
import json
import os
import click
from platformio import proc
from SCons.Script import (Import)


def _echo_stdout_line(line):
    click.secho(line, fg=None, nl=False)


def _echo_stderr_line(line):
    click.secho(line, fg="red", nl=False)


def __exec(cmd, project_dir, **kwargs):
    stdout = proc.ByteBufferedAsyncPipe(byte_callback=_echo_stdout_line)
    stderr = proc.ByteBufferedAsyncPipe(byte_callback=_echo_stderr_line)

    default = dict(cwd=project_dir,
                   stdout=stdout,
                   stderr=stderr,
                   shell=False)
    default.update(kwargs)
    kwargs = default

    result = proc.exec_command(cmd, **kwargs)

    return result


def modify_compiler_config(env):
    """
    modify the compiler Configure file
    """
    compiler_abs_path = env.subst(
        os.path.join("$PROJECT_DIR", "vendor", "hisilicon", "hi3861", "config.json"))
    compiler_config = json.load(open(compiler_abs_path, 'rt'))
    subsystems = compiler_config.get("subsystems")
    components = [
        {
            "component": "xts_acts",
            "features": []
        },
        {
            "component": "xts_tools",
            "features": []
        }
    ]
    for subsystem in subsystems:
        if subsystem.get("subsystem") == "test":
            subsystem['components'] = components
    compiler_config["subsystems"] = subsystems
    with os.fdopen(os.open(compiler_abs_path, os.O_RDWR | os.O_CREAT | os.O_TRUNC, 0o755), 'w+') as sf:
        json.dump(compiler_config, sf)


def BuildXtsCmd(environ, target, source, env):
    modify_compiler_config(env)
    build_path = os.path.join('test', 'xts', 'tools', 'lite', 'build.sh')
    cmd = ['sh', build_path, 'product=wifiiot', 'xts=acts']
    __exec(cmd, env.subst("$PROJECT_DIR"))
    return


Import("env")

analysis_env = env  # noqa: F821  # pylint: disable=undefined-variable

analysis_env.AddMethod(BuildXtsCmd)
