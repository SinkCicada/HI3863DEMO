import os
from platformio.managers.platform import PlatformBase
from platformio.util import get_systype
import xml.etree.ElementTree as xml


class HisiliconArmLinuxPlatform(PlatformBase):
    def __init__(self, manifest_path):
        super().__init__(manifest_path)

    def configure_default_packages(self, options, targets):
        build_packages = {
            "ohos-sources": ["hc_gen"],
            "hpm": [],
            "hb": ["tool_openjdk_jre"]
        }

        uploader_packages = ["tool_openjdk_jre"]

        config = self.board_config(options["board"])
        framework = (set(config.get('frameworks', {}).keys()) & set(options.get("pioframework", []))).pop()

        required_packages = set()
        custom_build = options.get("custom_build_command")

        bundle = options.get('hpm_project_base_package')
        if bundle == '@ohos/hispark_taurus_linux':
            build_packages["hpm"] = ["tool_openjdk_jre"]

        ohos_version = options.get("ohos_version", "")
        if ohos_version:
            build_packages = {}

        if not custom_build and "linux" in get_systype() and (not targets or "buildprog" in targets):
            for p in build_packages.get(framework, []):
                self.packages[p]["optional"] = False

            if build_packages.get(framework, []):
                required_packages.update(build_packages[framework])

        if "upload" in targets or "erase" in targets:
            required_packages.update(uploader_packages)

        for p in (set(self.packages) - required_packages):
            self.packages.pop(p, None)

        return super().configure_default_packages(options, targets)

    def is_embedded(self):
        return True

    def get_boards(self, id_=None):
        result = PlatformBase.get_boards(self, id_)
        if not result:
            return result

        if id_:
            result = self._add_platform_name(result)
            result = self._add_build_artifact_name(result)
            result = self._add_default_monitor(result)
            if id_ == 'hi3516dv300':
                result = self._add_specific_options(result)
        else:
            for key, _ in result.items():
                if result[key].manifest.get('name', '') == 'Hi3516DV300':
                    result[key] = self._add_specific_options(result[key])
                result[key] = self._add_platform_name(result[key])
                result[key] = self._add_build_artifact_name(result[key])
                result[key] = self._add_default_monitor(result[key])

        return result

    def set_platform_partitions(self, env, profile):
        if profile.endswith(".xml"):
            self._remove_partition_section(env)

            upload_partitions = []
            self._set_partition_section(env, profile, upload_partitions)

            self.config.set('env:' + env, 'upload_partitions',  upload_partitions)
            if upload_partitions:
                self.config.set('env:' + env, 'use_partitions_profile',  False)
            self.config.save()
        else:
            raise Exception(f'The profile type cannot support parsed. ({profile})')

    def _remove_partition_section(self, env):
        for section in self.config.sections():
                clean_partition = [section.startswith("partition:"),
                            self.config.has_option(section, "partition_env"),
                            self.config.get(section, "partition_env", '') == env
                            ]
                if all(clean_partition):
                    self.config.remove_section(section)

    def _set_partition_section(self, env, profile, upload_partitions):
        profile_path = os.path.split(profile)[0]

        try:
            tree = xml.parse(profile, parser=xml.XMLParser(encoding="iso-8859-5"))
            root = tree.getroot()
            for Part in root.iter('Part'):
                partition_name = Part.get('PartitionName')
                partition_mem = Part.get('FlashType')
                partition_fs = Part.get('FileSystem')
                partition_addr = self._byte_to_hex(Part.get('Start'))
                partition_length = self._byte_to_hex(Part.get('Length'))
                partition_bin = Part.get('SelectFile')
                if partition_bin and not os.path.exists(partition_bin):
                    partition_bin = self._join_partition_bin(partition_bin, profile_path)

                partition_section = f"partition:{env}_{partition_name}"
                self.config.add_section(partition_section)
                self.config.set(partition_section, 'partition_env', env)
                self.config.set(partition_section, 'partition_type', partition_name)
                self.config.set(partition_section, 'partition_board', self.config.get('env:' + env, 'board', ''))
                self.config.set(partition_section, 'partition_platform', self.config.get('env:' + env, 'platform', ''))
                self.config.set(partition_section, 'partition_mem', partition_mem)
                self.config.set(partition_section, 'partition_fs', partition_fs)
                self.config.set(partition_section, 'partition_addr', partition_addr)
                self.config.set(partition_section, 'partition_length', partition_length)
                self.config.set(partition_section, 'partition_bin', partition_bin)
                upload_partitions.append(partition_section)
        except Exception as e:
            raise Exception('Failed to create the partition use the profile') from e

    def _join_partition_bin(self, partition_bin, profile_path):
        if "/" in partition_bin:
            partition_bin = os.path.join(profile_path, os.path.basename(partition_bin))
        else:
            partition_bin = os.path.join(profile_path, partition_bin.split('\\')[-1])
        return partition_bin

    def _byte_to_hex(self, val):
        if val.isdigit():
            num = hex(int(val))
        elif val.endswith('B'):
            num = hex(int(val[:len(val)-1]))
        elif val.endswith('K'):
            num = hex(int(val[:len(val)-1]) * 1024)
        elif val.endswith('M'):
            num = hex(int(val[:len(val)-1]) * 1024 ** 2)
        elif val.endswith('G'):
            num = hex(int(val[:len(val)-1]) * 1024 ** 3)
        elif val.endswith('T'):
            num = hex(int(val[:len(val)-1]) * 1024 ** 4)
        else:
            raise Exception(f"Don't know how to interpret value {val} of type {type(val)} on .xml file")
        return num

    def _add_platform_name(self, board):  # pylint: disable=no-self-use
        board.manifest["platform"] = 'hisilicon_arm_linux'
        return board

    def _add_build_artifact_name(self, board):  # pylint: disable=no-self-use
        board.manifest["artifact_name"] = 'uImage.out'
        return board

    def _add_default_monitor(self, board):  # pylint: disable=no-self-use
        if "monitor" not in board.manifest:
            board.manifest["monitor"] = {
                "speed": "115200",
                "raw": True,
                "eol": "LF"
            }
        return board

    def _get_small_partitions_bin(self):
        small_partitions = {
            "fastboot": {
                "addr": "0x000000",
                "length": "0x100000",
                "mem": "emmc",
                'bin': "${UPLOAD_IMAGE_FASTBOOT_BIN}"
            },
            "kernel": {
                "addr": "0x100000",
                "length": "0x900000",
                "mem": "emmc",
                "bin": "${UPLOAD_IMAGE_KERNEL_BIN}"
            },
            "rootfs": {
                "addr": "0xa00000",
                "length": "0x6400000",
                "mem": "emmc",
                "fs": "ext3/4",
                "bin": "${UPLOAD_IMAGE_ROOTFS_BIN}"
            },
            "userfs": {
                "addr": "0x6e00000",
                "length": "0x6400000",
                "mem": "emmc",
                "fs": "ext3/4",
                "bin": "${UPLOAD_IMAGE_USERFS_BIN}"
            },
            "userdata": {
                "addr": "0xd200000",
                "length": "0x80000000",
                "mem": "emmc",
                "fs": "ext3/4",
                "bin": "${UPLOAD_IMAGE_USERDATA_BIN}"
            }
        }

        small_output_bin = {
            "fastboot": "device/board/hisilicon/hispark_taurus/uboot/out/boot/u-boot-hi3516dv300.bin",
            "kernel": "out/hispark_taurus/ipcamera_hispark_taurus_linux/uImage_hispark_taurus_smp",
            "rootfs": "out/hispark_taurus/ipcamera_hispark_taurus_linux/rootfs_ext4.img",
            "userfs": "out/hispark_taurus/ipcamera_hispark_taurus_linux/userfs_ext4.img",
            "userdata": "out/hispark_taurus/ipcamera_hispark_taurus_linux/userdata_ext4.img"
        }

        hpm_small_output_bin = {
            "fastboot": "device/board/hisilicon/hispark_taurus/uboot/out/boot/u-boot-hi3516dv300.bin",
            "kernel": "out/hispark_taurus/ipcamera_hispark_taurus_linux/uImage_hi3516dv300_smp",
            "rootfs": "out/hispark_taurus/ipcamera_hispark_taurus_linux/rootfs_ext4.img",
            "userfs": "out/hispark_taurus/ipcamera_hispark_taurus_linux/userfs_ext4.img",
            "userdata": "out/hispark_taurus/ipcamera_hispark_taurus_linux/userdata_ext4.img"
        }

        return small_partitions, small_output_bin, hpm_small_output_bin

    def _get_framework_partition(self):

        small_partitions, small_output_bin, hpm_small_output_bin = self._get_small_partitions_bin() 

        framework_partition = {
            "ipcamera_hispark_taurus_linux@hisilicon": {
                "partitions": small_partitions,
                "output_bin": small_output_bin,
                "output_bin_version":{
                    "3.0": {
                        "fastboot": "device/hisilicon/hispark_taurus/sdk_liteos/uboot/out/boot/u-boot-hi3516dv300.bin",
                        "kernel": "out/hispark_taurus/ipcamera_hispark_taurus_linux/uImage_hi3516dv300_smp"
                    },
                    "3.1": {
                        "kernel": "out/hispark_taurus/ipcamera_hispark_taurus_linux/uImage_hi3516dv300_smp"
                    }
                },
            },
            "@ohos/hispark_taurus_linux": {
                "partitions": small_partitions,
                "output_bin": hpm_small_output_bin
            }
        }

        return framework_partition

    def _add_specific_options(self, board):  # pylint: disable=no-self-use

        board.manifest['upload']['framework_partition'] = self._get_framework_partition()

        small_uboot = {
            "prompt": "hisilicon\\s*#",
            "config": {
                "uboot_config_boot": {
                    "name": "Boot OS",
                    "cmds": [
                        "(autoboot:\\s+\\d+|${UBOOTCHAT_UBOOT_PROMPT})",
                        " ",
                        "${UBOOTCHAT_UBOOT_PROMPT}",
                        "setenv bootcmd \"mmc read 0x0 0x82000000 0x800 0x4800;bootm 0x82000000;\";",
                        "${UBOOTCHAT_UBOOT_PROMPT}",
                        "setenv bootargs \"mem=128M console=ttyAMA0,115200 root=/dev/mmcblk0p3 " \
                        + "rw rootfstype=ext4 rootwait " \
                        + "blkdevparts=mmcblk0:1M(boot),9M(kernel),100M(rootfs),100M(userfs),2048M(userdata)\";",
                        "${UBOOTCHAT_UBOOT_PROMPT}",
                        "setenv bootdelay 3",
                        "${UBOOTCHAT_UBOOT_PROMPT}",
                        "saveenv",
                        "Writing\\sto\\sMMC\\(0\\)\\.\\.\\.\\s*OK\\s*\\r?\\n.*${UBOOTCHAT_UBOOT_PROMPT}",
                        "reset"
                    ]
                }
            }
        }

        uboot = {
            "hb": small_uboot,
            "@ohos/hispark_taurus_linux":small_uboot
        }

        board.manifest['uboot'] = uboot
        return board

    def tasks(self, board_id, project, env):
        tasks = super().tasks(board_id, project, env)
        if "windows" in get_systype():
            tasks = [task for task in tasks if "name" not in task or task["name"] not in ["Clean", "Build", "Rebuild"]]

        board_config = self.get_boards(board_id)
        framework = (set(board_config.get('frameworks', {}).keys()) & 
                     set(self.config.get('env', 'framework', []))).pop()
        bundle = self.config.get(f'env:{env}', 'hpm_project_base_package', '')
        board_uboot = board_config.get('uboot', {})
        uboot = board_uboot.get(framework, {}) if board_uboot.get(framework, {}) else board_uboot.get(bundle, {})

        if uboot:
            arg_project = ['--project-dir', project]
            arg_env = ['--environment', env]
            arg_verbose = ['--verbose'] if self.config.get(f'env:{env}', 'verbose_output', False) else []
            group_len = len([v for v in tasks if v['type'] == 'group'])
            task_len = len(tasks) - group_len - 1
            for target, cfg in uboot.get('config', {}).items():
                tasks.insert(task_len, {'type': 'task',
                        'name': f'Configure bootloader ({cfg["name"]})',
                        'id': f'deveco: configure bootloader ({cfg["name"]}) - {env}',
                        'icon': 'tool',
                        'cmd': [self._hos(), 'run', '--target', target
                                ] + arg_project + arg_env + arg_verbose,
                        'exclusive': self._generate_exclusive(['bootloader'], env),
                        'execution-type': 'process'})
                task_len += 1

        return tasks
