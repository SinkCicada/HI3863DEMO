import os
import sys
import subprocess
import shutil
import click
import hb_adapter
import json
from os.path import join
from SCons.Script import (Import, ARGUMENTS)
from SCons import Errors
from platformio.util import get_systype
from platformio import (proc)
from platformio import exception

Import("env")

builder_env = env  # noqa: F821
platform = builder_env.PioPlatform()
board = builder_env.BoardConfig()
framework_settings = board.get("frameworks").get("hb").get("build")
output_bin = board.get("frameworks").get("hb").get("output_bin")
build_product = board.get("frameworks.hb.build.product", "")


def _echo_stdout_line(line):
    click.secho(line, fg=None, nl=False)


def _echo_stderr_line(line):
    click.secho(line, fg="red", nl=False)


def buildImage(cmd, cwd):
    stdout = proc.LineBufferedAsyncPipe(line_callback=_echo_stdout_line)
    stderr = proc.LineBufferedAsyncPipe(line_callback=_echo_stderr_line)
    p = subprocess.Popen(cmd, stdout=stdout, stderr=stderr, encoding="utf-8", cwd=cwd)
    try:
        _, err = p.communicate(timeout=900)
        rc = p.returncode
    except KeyboardInterrupt as e:
        raise exception.AbortedByUser('KeyboardInterrupt')
    finally:
        stdout.close()
        stderr.close()
    if rc != 0:
        raise Errors.BuildError(
            errstr=f"build error"
        )  # pylint: disable=E0702
    return rc


def _create_qemuinit(projectDir):
    file = projectDir + "/qemu-init"
    flags = os.O_RDWR | os.O_CREAT | os.O_TRUNC
    with os.fdopen(os.open(file, flags, 0o755), 'w') as f:
        qemu_init_str = '''bootargs=$(cat <<-END
bootargs=root=cfi-flash fstype=jffs2 rootaddr=10M rootsize=27M useraddr=37M usersize=27M
END
)
echo -ne "${bootargs}"'\0' > out/arm_virt/qemu_small_system_demo/bootargs
ohos=out/arm_virt/qemu_small_system_demo/OHOS_Image.bin
bootargs=out/arm_virt/qemu_small_system_demo/bootargs
rootfs=out/arm_virt/qemu_small_system_demo/rootfs_jffs2.img
userfs=out/arm_virt/qemu_small_system_demo/userfs_jffs2.img
brk=out/arm_virt/qemu_small_system_demo/data/line_cj.brk
otf=out/arm_virt/qemu_small_system_demo/data/SourceHanSansSC-Regular.otf
if [ ! -f "${ohos}" ] || [ ! -f "${bootargs}" ]||[ ! -f "${rootfs}" ]||[ ! -f "${userfs}" ]||[ ! -f "${brk}" ]||[ ! -f "${otf}" ]; then
echo "镜像所需文件不齐全"
fi
dd if=/dev/zero of=./flash.img bs=64M count=1 2> /dev/null
if [ ! -f "./flash.img" ]; then
echo "flash.img生成失败"
fi
dd if=${ohos} of=./flash.img conv=notrunc seek=0 oflag=seek_bytes  2> /dev/null
dd if=${bootargs} of=./flash.img conv=notrunc seek=9984k oflag=seek_bytes  2> /dev/null
dd if=${rootfs} of=./flash.img conv=notrunc seek=10M oflag=seek_bytes 2> /dev/null
dd if=${userfs} of=./flash.img conv=notrunc seek=37M oflag=seek_bytes 2> /dev/null
echo "使用空闲loop："$(losetup -f)
idleLoop=$(losetup -f)
dd if=/dev/zero of=smallmmc.img bs=512KiB count=64 2> /dev/null
if [ ! -f "./smallmmc.img" ]; then
echo "flash.img生成失败"
fi
sudo parted -s smallmmc.img -- mklabel msdos mkpart primary fat32 2048s 25MiB mkpart primary fat32 25MiB 30MiB mkpart primary fat32 30MiB -1s
sudo losetup ${idleLoop} smallmmc.img
sudo partprobe ${idleLoop}
sudo mkfs.vfat ${idleLoop}p1 > /dev/null
sudo mkfs.vfat ${idleLoop}p2 > /dev/null
sudo mkfs.vfat ${idleLoop}p3 > /dev/null
sudo mkdir -p ./mntTemp
sudo mount ${idleLoop}p1 ./mntTemp
sudo mkdir ./mntTemp/data
sudo cp ${brk}  ./mntTemp/data
sudo cp ${otf}  ./mntTemp/data
sudo umount ./mntTemp
sudo rm -r ./mntTemp
sudo losetup -d ${idleLoop}'''
        f.write(qemu_init_str)


def build_virt_image(projectDir):
    """
    For the virt board, use the init file to create the qemu image.
    """
    _create_qemuinit(projectDir)
    file = os.path.join(projectDir, "qemu-init")

    if not os.path.exists(file):
        _create_qemuinit(projectDir)
    buildImage(["bash", "qemu-init"], cwd=projectDir)


def builder(target, source, env):
    projectDir = env.subst("$PROJECT_DIR")
    hb = hb_adapter.Hb(projectDir, stdout=None, stderr=None)
    build_type = env.GetBuildType()

    # always set hb root_path as $PROJECT_DIR
    hb.setting(root_path=env.subst("$PROJECT_DIR"))
    res = 0 if hb.build(env.subst("$PROJECT_DIR"),
                        build_product,
                        build_type == 'debug') else -1

    board_config = env.BoardConfig()
    board_name = board_config.get("name")
    qemu_image = board_config.get("frameworks").get("hb").get("qemu_image")
    if board_name == "ARM_VIRT":
        build_virt_image(projectDir)
    if board_name == "MPS2_AN386":
        for image in qemu_image:
            shutil.copy(join(projectDir, 'out', 'arm_mps2_an386', 'qemu_mini_system_demo', image), projectDir)
    return res


try:
    if "@" in build_product:
        product_name, company = build_product.split('@')
    else:
        product_name = build_product
except ValueError as ex:
    raise Errors.BuildError(
        errstr=f"Please set 'board_frameworks.hb.build.product' in project options"
    )

builder_env.Append(BUILDERS=dict(HbBuilder=builder_env.Builder(
    action=builder_env.Action(builder))))

builder_env.Replace(
    FRAMEWORK_BUILD_TARGET=join(framework_settings.get("board"),
                                product_name),
)

builder_env.Replace(**{f"UPLOAD_IMAGE_{k.upper()}_BIN": v for k, v in output_bin.items()})

builder_env.Replace(
    BUILD_OUT_DIR=join("$PROJECT_DIR", "out",
                       framework_settings.get("board"),
                       product_name)
)

builder_env.Replace(
    BUILD_ELF_TARGET=join("$BUILD_OUT_DIR", builder_env.subst("${PROGNAME}")),
    PROG_PATH='$BUILD_ELF_TARGET',
)

program = builder_env.HbBuilder(['$BUILD_ELF_TARGET'], None)
builder_env.Replace(PIOMAINPROG=program)


def Cleaner(env):
    hb = hb_adapter.Hb(env.subst("$PROJECT_DIR"), stdout=None, stderr=None)
    if not hb.clean():
        raise Errors.BuildError(errstr="Hb clean failed")
    print("Done hb cleaning")


builder_env.AddMethod(Cleaner)
