#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Copyright (c) Huawei Technologies Co., Ltd. 2021-2021. All rights reserved.
Description: main
Create: 2021-08-23
"""

import os
from os.path import (join, realpath, isdir, isabs)
from pathlib import Path
from platformio.util import get_systype
from SCons.Script import (DefaultEnvironment,
                          COMMAND_LINE_TARGETS)
from SCons.Script import AlwaysBuild
from SCons import Errors


def select_toolchain(environ, platf):
    default_gnu_toolchain = dict(
        AR="${CROSS_COMPILE}ar",
        AS="${CROSS_COMPILE}as",
        CC="${CROSS_COMPILE}gcc",
        CXX="${CROSS_COMPILE}g++",
        OBJCOPY="${CROSS_COMPILE}objcopy",
        RANLIB="${CROSS_COMPILE}ranlib",
        SIZETOOL="",
        GDB="${CROSS_COMPILE}gdb"
    )

    default_toolchain = default_gnu_toolchain

    toolchains = {'tool_msys': dict(
                      CROSS_COMPILE="make-unknown-elf-",
                      **default_gnu_toolchain
                  ),
                  'arm_noneeabi_gcc': dict(
                       CROSS_COMPILE="arm-none-eabi-",
                       **default_gnu_toolchain
                  )
                  }
    environ.Replace(**default_toolchain)
    toolchain = [k for k, p in platf.packages.items() if p["type"] == "toolchain" and k in toolchains]
    if toolchain:
        environ.Replace(**toolchains.get(toolchain[0]))

    return environ


def add_tools_path(environ, platf):
    tool_bin_path = ["bin", "script"]
    paths = []
    for name, p in platf.packages.items():
        package_dir = platf.get_package_dir(name)
        type_ = p["type"]
        if type_ == "tool" and not p["optional"]:
            bin_path = [path for path in map(lambda x: join(package_dir, x), tool_bin_path)
                        if isdir(path)]

            for path in bin_path:
                paths.append(path)

            paths.append(package_dir)

    if env.subst("$CUSTOM_TOOL_PATH"):
        paths.append(realpath(env.subst("$CUSTOM_TOOL_PATH")))

    for p in paths:
        environ.PrependENVPath("PATH", p)

    return environ

env = DefaultEnvironment()
board = env.BoardConfig()
framework_settings = board.get("frameworks").get('ohos-sources').get("build")
platform = env.PioPlatform()

env.Replace(
    ARFLAGS=["rc"],
    SIZEPROGREGEXP=r"^(?:\.text|\.data|\.rodata|\.text.align|\.ARM.exidx)\s+(\d+).*",
    SIZEDATAREGEXP=r"^(?:\.data|\.bss|\.noinit)\s+(\d+).*",
    SIZECHECKCMD="$SIZETOOL -A -d $SOURCES",
    SIZEPRINTCMD='$SIZETOOL -B -d $SOURCES',
    PROGSUFFIX=''
)


def NotSupportedAction(target, source, env):  # pylint: disable=W0621
    raise Errors.BuildError(errstr=f"Action is not supported for board: {board.manifest.get('build', {}).get('mcu')}")


def BoardNotSupportedAction(target, source, env):  # pylint: disable=W0621
    raise Errors.BuildError(errstr=f"Action is not supported  for "
                                   f"board: {board.manifest.get('build', {}).get('mcu')}")


def UploadProtocolNotSupportedAction(target, source, env):  # pylint: disable=W0613, W0621
    upload_proto = env.subst('$UPLOAD_PROTOCOL')
    raise Errors.BuildError(errstr="Protocol upload_protocol="
                            f"{upload_proto if upload_proto else '<empty>'}"
                            f" is not supported for board: {board.manifest.get('name')}")


origDumpIDEData = env.DumpIDEData


def _get_device_path(environ):
    device_path = environ.GetProjectOption("build_device_path")
    if device_path:
        return realpath(device_path)
    return None


def _platformDumpIDEData(environ):
    data = origDumpIDEData()
    data.update({"device_path": _get_device_path(environ)})
    return data

env.Replace(PROGNAME=board.manifest.get('artifact_name'))

if not env.get("PIOFRAMEWORK"):
    raise Errors.BuildError(errstr="Bare metal building is not supported")

env.BuildFrameworks(env.get("PIOFRAMEWORK"))

# replace builder with custom command
if env.subst("$BUILD_CMD_CUSTOM"):
    env.Replace(BUILDERS=dict(CustomBuilder=env.Builder(
        action=env.Action("$BUILD_CMD_CUSTOM"))))
    env.Replace(PIOMAINPROG=env.CustomBuilder(['$BUILD_ELF_TARGET'], None))

env = add_tools_path(env, platform)
env = select_toolchain(env, platform)

skip_build = all(
    [
        "upload" in COMMAND_LINE_TARGETS or
        "erase" in COMMAND_LINE_TARGETS,
        "nobuild" not in COMMAND_LINE_TARGETS
    ]
)

if skip_build:
    COMMAND_LINE_TARGETS += ["nobuild"]

if "nobuild" in COMMAND_LINE_TARGETS:
    target_elf = "$BUILD_ELF_TARGET"
else:
    target_elf = env.BuildProgram()

target_buildprog = env.Alias("buildprog", target_elf, target_elf)

AlwaysBuild(target_elf)

upload_protocol = env.subst("$UPLOAD_PROTOCOL")
upload_images = []

build_path = env.GetProjectOption("build_device_path", '')

if not build_path:
    build_path = os.path.join(env.subst("$PROJECT_DIR"), 'examples',
                              'ble_peripheral', 'ble_app_hids_keyboard',
                              'pca10056', 's140', 'armgcc')

for _, v in board.get("upload_partitions", {}).items():
    upload_image = v.get("partition_bin")
    if upload_image is None:
        if upload_protocol == "nrf-command":
            upload_image = "${UPLOAD_IMAGE_APP_BIN}"
        v.update({"partition_bin": upload_image})

    if upload_image and not isabs(upload_image):
        upload_image = os.path.join(build_path, framework_settings.get("target"), upload_image)

    upload_images.append(upload_image)


version_name = os.path.basename(os.path.dirname(build_path))

bootloader_dir = os.path.join(env.subst("$PROJECT_DIR"), 'components', 'softdevice', version_name, 'hex')
q = Path(bootloader_dir)
bootloader_path = str(next(q.glob('*.hex')))
upload_images.append(bootloader_path)

bootloader_filename = os.path.basename(bootloader_path)
env.Replace(NRF_BOOTLOADER_HEX=bootloader_filename)


upload_actions = [UploadProtocolNotSupportedAction]
if upload_protocol.startswith("nrf-command"):
    env.SConscript("nrf-command.py", exports="env")
    upload_actions = [env.VerboseAction(env.CommandUpload, "Uploading with nrf")]
    if 'linux' in get_systype():
        upload_actions = [BoardNotSupportedAction]

AlwaysBuild(env.Alias("upload", upload_images, upload_actions))

env.Default([target_buildprog])
env.RemoveMethod(env.DumpIDEData)
env.AddMethod(_platformDumpIDEData, name="DumpIDEData")
