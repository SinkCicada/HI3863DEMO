from os import environ
from platformio.managers.platform import PlatformBase
from platformio.util import get_systype
from platformio.project.options import ProjectOptions, ConfigEnvOption


class XradioPlatform(PlatformBase):
    def __init__(self, manifest_path):
        super().__init__(manifest_path)

    def configure_default_packages(self, options, targets):
        custom_build = options.get("custom_build_command")
        custom_clean = options.get("custom_clean_command")
        packages = {
            "buildprog": {"ARMv8-M": {
                "hb": [] if custom_build else ["gn", "ninja", "arm_noneeabi_gcc"]}},
            "clean": {"ARMv8-M": {"hb": [] if custom_clean else ["gn"]}}
        }
        uploader_packages = {
            "ARM Cortex-M4F": ["phoenixmc"]
        }
        config = self.board_config(options["board"])
        arch = config.get('build', {}).get('cpu', '')
        frameworks = (set(config.get('frameworks', {}).keys()) &
                     set(options.get("pioframework", [])))
        framework = frameworks.pop() if frameworks else ''

        ohos_version = options.get("ohos_version", "")
        if ohos_version:
            packages.update({"buildprog": {}})
            packages.update({"clean": {}})
            uploader_packages = {}

        required_packages = set()
        for target, package_list in packages.items():
            if target in targets and framework in package_list.get(arch, {}):
                for package in package_list[arch][framework]:
                    self.packages[package]["optional"] = False
                if package_list[arch][framework]:
                    required_packages.update(package_list[arch][framework])

        if "windows" in get_systype() and "upload" in targets and arch in uploader_packages:
            for package in uploader_packages[arch]:
                self.packages[package]["optional"] = False
            required_packages.update(uploader_packages[arch])

        for p in (set(self.packages) - required_packages):
            self.packages.pop(p, None)

        return super().configure_default_packages(options, targets)

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
        board.manifest["artifact_name"] = 'xr_system.out'
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

        if "linux" in get_systype() and board_id == 'xr806':
            tasks.append({'type': 'task',
                        'name': 'Menu Config',
                        'title': 'Menu Config',
                        'id': f'deveco: config - {env}',
                        'icon': 'menu',
                        'cmd': [self._hos(), 'run', '--target',
                                'menuconfig'] + arg_project + arg_env + arg_verbose,
                        'exclusive': self._generate_exclusive(['build'], env),
                        'execution-type': 'process'})

            tasks.append({'type': 'task',
                        'name': 'Clean',
                        'title': 'Clean output',
                        'id': f'deveco: clean - {env}',
                        'icon': 'clean',
                        'cmd': [self._hos(), 'run', '--target', 'clean'] + arg_project + arg_env + arg_verbose,
                        'exclusive': self._generate_exclusive(['build'], env),
                        'execution-type': 'process'})

            tasks.append({'type': 'task',
                        'name': 'Build',
                        'title': 'Build target binary',
                        'id': f'deveco: build - {env}',
                        'icon': 'build',
                        'cmd': [self._hos(), 'run'] + arg_project + arg_env + arg_verbose,
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

        arg_list = {'arg_project': arg_project, 'arg_env': arg_env, 'arg_verbose': arg_verbose}
        self._set_upload_task(tasks, env, arg_list) 
        return tasks

    def _set_upload_task(self, tasks, env, arg_list):
        encoding = self.config.get(f'env:{env}', 'monitor_encoding', 'UTF-8')
        tasks.append({'type': 'task',
                    'name': 'Upload',
                    'title': f'Upload to device',
                    'id': f'deveco: upload - {env}',
                    'icon': 'burn',
                    'cmd': [self._hos(), 'run', '--target', 'upload'
                            ] + arg_list.get('arg_project') +
                                arg_list.get('arg_env') + arg_list.get('arg_verbose'),
                    'execution-type': 'process'})

        tasks.append({'type': 'task',
                    'name': 'Monitor',
                    'title': 'Start device monitor',
                    'id': f'deveco: monitor - {env}',
                    'icon': 'monitor',
                    'cmd': [self._hos(), 'device', 'monitor', '--encoding', encoding] +
                            arg_list.get('arg_project') + arg_list.get('arg_env'),
                    'execution-type': 'process'})
