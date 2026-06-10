from platformio.managers.platform import PlatformBase
from platformio.util import get_systype


class AllwinnerPlatform(PlatformBase):
    def __init__(self, manifest_path):
        super().__init__(manifest_path)

    def configure_default_packages(self, options, targets):
        build_packages = {
            "ohos-sources": ["tool_openjdk_jre"]
        }

        config = self.board_config(options["board"])
        framework = (set(config.get('frameworks', {}).keys()) & set(options.get("pioframework", []))).pop()
        arch = config.get('build', {}).get('cpu', '')

        required_packages = set()
        custom_build = options.get("custom_build_command")

        if not custom_build and "linux" in get_systype() and (not targets or "buildprog" in targets):
            for p in build_packages.get(framework, []):
                self.packages[p]["optional"] = False

            if build_packages.get(framework, []):
                required_packages.update(build_packages.get(framework))

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
            result = self._add_default_monitor(result)
            return self._add_build_artifact_name(result)
        else:
            for key, _ in result.items():
                result[key] = self._add_default_monitor(result[key])
                result[key] = self._add_build_artifact_name(result[key])

        return result

    def _add_build_artifact_name(self, board): # pylint: disable=no-self-use
        board.manifest["artifact_name"] = 'system.img'
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
        if "linux" in get_systype() and board_id in ['t507']:
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
