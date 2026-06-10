#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Copyright (c) Huawei Technologies Co., Ltd. 2021-2021. All rights reserved.
Description: nordic build script
Create: 2021-08-23
"""

import os
from os.path import join
import subprocess
from SCons.Script import Import

Import("env")

builder_env = env  # noqa: F821  # pylint: disable=undefined-variable

platform = builder_env.PioPlatform()
board = builder_env.BoardConfig()
framework_settings = board.get("frameworks").get('ohos-sources').get("build")
output_bin = board.get("frameworks").get("ohos-sources").get("output_bin", {})


def message(target, source, env):  # pylint: disable=unused-argument
    default_device_path = os.path.join(env.subst("$PROJECT_DIR"), 'examples',
                                       'ble_peripheral', 'ble_app_hids_keyboard',
                                       'pca10056', 's140', 'armgcc')

    build_device_path = env.GetProjectOption("build_device_path", default_device_path)

    gnu_path = platform.get_package_dir("arm_noneeabi_gcc") + os.sep

    fullcmd = ["make",
               "-e",
               "GNU_INSTALL_ROOT={}".format(gnu_path)]

    return 'cd ' + build_device_path + ' && ' + ' '.join(fullcmd)


def builder(target, source, env):  # pylint: disable=unused-argument,unreachable
    default_device_path = os.path.join(env.subst("$PROJECT_DIR"), 'examples',
                                       'ble_peripheral', 'ble_app_hids_keyboard',
                                       'pca10056', 's140', 'armgcc')

    build_device_path = env.GetProjectOption("build_device_path", default_device_path)

    gnu_path = platform.get_package_dir("arm_noneeabi_gcc") + os.sep

    fullcmd = ["make",
               "-e",
               "GNU_INSTALL_ROOT={}".format(gnu_path)]

    cp = subprocess.run(fullcmd,
                        cwd=build_device_path)
    return cp.returncode

builder_env.Append(BUILDERS=dict(RepoBuilder=builder_env.Builder(
    action=builder_env.Action(builder, message))))

builder_env.Replace(
    FRAMEWORK_BUILD_TARGET=framework_settings.get("target"),
)

builder_env.Replace(**{f"UPLOAD_IMAGE_{k.upper()}_BIN": v for k, v in output_bin.items()})

build_path = builder_env.GetProjectOption("build_device_path", '')

if not build_path:
    builder_env.Replace(
        BUILD_OUT_DIR=join(builder_env.subst("$PROJECT_DIR"), 'examples',
                           'ble_peripheral', 'ble_app_hids_keyboard',
                           'pca10056', 's140', 'armgcc', framework_settings.get("target")))
else:
    builder_env.Replace(
        BUILD_OUT_DIR=join(build_path, framework_settings.get("target")))

builder_env.Replace(
    BUILD_ELF_TARGET=join("$BUILD_OUT_DIR", builder_env.subst("${PROGNAME}")),
    PROG_PATH='$BUILD_ELF_TARGET',
)

program = builder_env.RepoBuilder(['$BUILD_ELF_TARGET'], None)
builder_env.Replace(PIOMAINPROG=program)


def Cleaner(env):
    default_device_path = os.path.join(env.subst("$PROJECT_DIR"), 'examples',
                                       'ble_peripheral', 'ble_app_hids_keyboard',
                                       'pca10056', 's140', 'armgcc')

    build_device_path = env.GetProjectOption("build_device_path", default_device_path)

    gnu_path = platform.get_package_dir("arm_noneeabi_gcc") + os.sep

    fullcmd = ["make",
               "clean",
               "-e",
               "GNU_INSTALL_ROOT={}".format(gnu_path)]
    cp = subprocess.run(fullcmd,
                        cwd=build_device_path)
    return cp.returncode

builder_env.AddMethod(Cleaner)
