import os
from platformio.managers.platform import PlatformBase
from platformio.util import get_systype


class RockchipPlatform(PlatformBase):
    def __init__(self, manifest_path):
        super().__init__(manifest_path)

    def configure_default_packages(self, options, targets):
        custom_build = options.get("custom_build_command")
        packages = {
            "buildprog": {
                "cortex-a55": {
                    "ohos-sources": [] if custom_build else ["tool_openjdk_jre"],
                    "hb": [] if custom_build else ["tool_openjdk_jre"]
                    }
                }
        }
        config = self.board_config(options["board"])
        arch = config.get('build', {}).get('cpu', '')
        framework = (set(config.get('frameworks', {}).keys()) &
                     set(options.get("pioframework", []))).pop()
        
        ohos_version = options.get("ohos_version", "")
        if ohos_version:
            packages.update({"buildprog": {}})

        required_packages = set()
        for target, package_list in packages.items():
            if target in targets and framework in package_list.get(arch, {}):
                for package in package_list.get(arch, {}).get(framework, []):
                    self.packages[package]["optional"] = False
                if package_list.get(arch, {}).get(framework, []):
                    required_packages.update(package_list.get(arch, {}).get(framework, []))

        for p in (set(self.packages) - required_packages):
            self.packages.pop(p, None)

        return super().configure_default_packages(options, targets)

    def is_embedded(self): # pylint: disable=no-self-use
        return True

    def get_boards(self, id_=None):
        result = PlatformBase.get_boards(self, id_)
        if not result:
            return result

        if id_:
            return self._add_build_artifact_name(result)
        else:
            for key, _ in result.items():
                result[key] = self._add_build_artifact_name(result[key])

        return result

    def set_platform_partitions(self, env, profile):
        if profile.endswith(".txt"):
            self._remove_partition_section(env)

            upload_partitions = []
            self._set_upload_partition_section(env, profile, upload_partitions)

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

    def _get_profile_partitions(self, profile):
        content = ''
        with open(profile) as fp:
                for line in fp:
                    if "CMDLINE" in line:
                        content = line
                        break
        partitions = content[content.index('0x'):]
        return partitions

    def _set_upload_partition_section(self, env, profile, upload_partitions):
        profile_path = os.path.split(profile)[0]
        partition_dict = {}
        loader_bin = self.config.get('env:' + env, 'upload_loader_bin', '')
        if loader_bin:
            partition_dict.update({"loader": os.path.join(profile_path, loader_bin)})
        partition_dict.update({"parameter": profile})

        for key, value in partition_dict.items():
            partition_section = f"partition:{env}_{key}"
            self._set_partition_section(env, partition_section, key, value)
            upload_partitions.append(partition_section)

        try:
            partitions = self._get_profile_partitions(profile)
            for partition in partitions.split(','):
                name = partition[(partition.index('(') + 1): partition.index(')')]
                partition_name = name.split(':')[0]
                partition_bin = os.path.join(profile_path, partition_name + '.img')
                if os.path.exists(partition_bin):
                    partition_section = f"partition:{env}_{partition_name}"
                    self._set_partition_section(env, partition_section, partition_name, partition_bin)
                    upload_partitions.append(partition_section)
        except Exception as e:
            raise Exception('Failed to create the partition use the profile') from e

    def _set_partition_section(self, partition_env, section, partition_type, out_bin):
        self.config.add_section(section)
        self.config.set(section, 'partition_env', partition_env)
        self.config.set(section, 'partition_type', partition_type)
        self.config.set(section, 'partition_board', self.config.get('env:' + partition_env, 'board', ''))
        self.config.set(section, 'partition_platform', self.config.get('env:' + partition_env, 'platform', ''))
        self.config.set(section, 'partition_bin', out_bin)

    def _add_build_artifact_name(self, board): # pylint: disable=no-self-use
        board.manifest["artifact_name"] = f'system.out'
        return board

    def tasks(self, board_id, project, env):
        tasks = []
        arg_project = ['--project-dir', project]
        arg_env = ['--environment', env]
        arg_verbose = ['--verbose'] if self.config.get(f'env:{env}', 'verbose_output', False) else []
        encoding = self.config.get(f'env:{env}', 'monitor_encoding', 'UTF-8')

        # Regular operations
        if "linux" in get_systype() and board_id in ['hh_scdy200']:
            tasks.append({'type': 'task',
                        'name': 'Build',
                        'title': 'Build target binary',
                        'id': f'deveco: build - {env}',
                        'icon': 'build',
                        'cmd': [self._hos(), 'run'] + arg_project + arg_env + arg_verbose,
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
