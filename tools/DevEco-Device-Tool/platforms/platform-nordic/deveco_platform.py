#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Copyright (c) Huawei Technologies Co., Ltd. 2021-2021. All rights reserved.
Description: deveco_platform
Create: 2021-08-23
"""

from platformio.managers.platform import PlatformBase
from platformio.util import get_systype
from platformio.project.options import ProjectOptions, ConfigEnvOption
import click


class NordicPlatform(PlatformBase):
    def __init__(self, manifest_path):
        super().__init__(manifest_path)

        ProjectOptions.update(
            {
                'env.build_device_path':
                    ConfigEnvOption(
                        group="build",
                        name="build_device_path",
                        description="Custom path to build device default",
                        type=click.Path(exists=False, file_okay=False,
                                        dir_okay=True),
                        default=''
                    )
            }
        )

    def configure_default_packages(self, options, targets):
        build_packages = {
            "cortex-m": {"ohos-sources": ["tool_msys", "arm_noneeabi_gcc"]}
        }
        clean_packages = {
            "cortex-m": {"ohos-sources": ["tool_msys", "arm_noneeabi_gcc"]}
        }
        if "linux" in get_systype():
            build_packages["cortex-m"]["ohos-sources"] = ["arm_noneeabi_gcc"]
            clean_packages["cortex-m"]["ohos-sources"] = ["arm_noneeabi_gcc"]

        config = self.board_config(options["board"])
        arch = config.get('build', {}).get('cpu', '')
        framework = (set(config.get('frameworks', {}).keys()) & set(options.get("pioframework", []))).pop()
        required_packages = set()
        custom_build = options.get("custom_build_command")
        custom_clean = options.get("custom_clean_command")

        if not custom_clean and "clean" in targets and framework in clean_packages[arch]:
            for p in clean_packages[arch][framework]:
                self.packages[p]["optional"] = False

            if clean_packages[arch][framework]:
                required_packages.update(clean_packages[arch][framework])

        if not custom_build and (not targets or "buildprog" in targets):
            for p in build_packages[arch][framework]:
                self.packages[p]["optional"] = False

            if build_packages[arch][framework]:
                required_packages.update(build_packages[arch][framework])

        if "upload" in targets and options.get("upload_protocol", "") == "nrf_command":
            self.packages["tool_nrfjprog"]["optional"] = False

        for p in (set(self.packages) - required_packages):
            self.packages.pop(p, None)

        return super().configure_default_packages(options, targets)

    def is_embedded(self):  # pylint: disable=no-self-use
        return True

    def get_boards(self, id_=None):
        result = PlatformBase.get_boards(self, id_)
        if not result:
            return result

        if id_:
            result = self._add_build_artifact_name(result)
            return self._add_default_monitor(result)
        else:
            for key, _ in result.items():
                result[key] = self._add_build_artifact_name(result[key])
                result[key] = self._add_default_monitor(result[key])
        return result

    def _add_build_artifact_name(self, board):  # pylint: disable=no-self-use
        board.manifest["artifact_name"] = f'nrf52840_xxaa.out'
        return board

    def _add_default_monitor(self, board):  # pylint: disable=no-self-use
        if "monitor" not in board.manifest:
            board.manifest["monitor"] = {
                "speed": "115200",
                "raw": True,
                "eol": "LF"
            }
        return board

    def tasks(self, board_id, project, env):
        tasks = []
        arg_project = ['--project-dir', project]
        arg_env = ['--environment', env]
        arg_verbose = ['--verbose'] if self.config.get(f'env:{env}', 'verbose_output', False) else []
        encoding = self.config.get(f'env:{env}', 'monitor_encoding', 'UTF-8')

        # Regular operations
        tasks.append({'type': 'task',
                    'name': 'Clean',
                    'title': 'Clean output',
                    'id': f'deveco: clean - {env}',
                    'icon': 'clean',
                    'cmd': [self._hos(), 'run', '--target', 'clean'
                            ] + arg_project + arg_env + arg_verbose,
                    'exclusive': self._generate_exclusive(['build'], env),
                    'execution-type': 'process'})

        tasks.append({'type': 'task',
                    'name': 'Build',
                    'title': 'Build target binary',
                    'id': f'deveco: build - {env}',
                    'icon': 'build',
                    'cmd': [self._hos(), 'run'] +
                            arg_project + arg_env + arg_verbose,
                    'exclusive': self._generate_exclusive(['build'], env),
                    'execution-type': 'process'})

        tasks.append({'type': 'task',
                    'name': 'Rebuild',
                    'title': 'Rebuild target binary',
                    'id': f'deveco: rebuild - {env}',
                    'icon': 'rebuild',
                    'cmd': [self._hos(), 'run', '--target', 'clean', '--target',
                            'buildprog'] + arg_project + arg_env + arg_verbose,
                    'exclusive': self._generate_exclusive(['build'], env),
                    'execution-type': 'process'})

        tasks.append({'type': 'task',
                    'name': 'Upload',
                    'title': f'Upload to device',
                    'id': f'deveco: upload - {env}',
                    'icon': 'burn',
                    'cmd': [self._hos(), 'run', '--target', 'upload'
                            ] + arg_project + arg_env + arg_verbose,
                    'execution-type': 'process'})

        tasks.append({'type': 'task',
                    'name': 'Monitor',
                    'title': 'Start device monitor',
                    'id': f'deveco: monitor - {env}',
                    'icon': 'monitor',
                    'cmd': [self._hos(), 'device', 'monitor', '--encoding', encoding] + arg_project + arg_env,
                    'execution-type': 'process'})

        return tasks
