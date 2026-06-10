from platformio.managers.platform import PlatformBase
from platformio.project.config import ProjectConfig
from platformio.util import get_systype


class BouffaloPlatform(PlatformBase):
    def __init__(self, manifest_path):
        super().__init__(manifest_path)

    def configure_default_packages(self, options, targets):
        build_packages = {
            "risc-v": {"hb": ["gn", "ninja", "gcc_riscv32", "llvm"]}
        }

        clean_packages = {
            "risc-v": {"hb": ["gn"]}
        }

        config = self.board_config(options["board"])
        arch = config.get('build', {}).get('cpu', '')
        framework = (set(config.get('frameworks', {}).keys()) & set(options.get("pioframework", []))).pop()

        required_packages = set()
        custom_build = options.get("custom_build_command")
        custom_clean = options.get("custom_clean_command")

        ohos_version = options.get("ohos_version", "")
        if ohos_version:
            build_packages = {}
            clean_packages = {}

        if not custom_clean and "linux" in get_systype() and ("clean" in targets):
            for p in clean_packages.get(arch, {}).get(framework, []):
                self.packages[p]["optional"] = False

            if clean_packages.get(arch, {}).get(framework, []):
                required_packages.update(clean_packages[arch][framework])

        if not custom_build and "linux" in get_systype() and framework in build_packages.get(arch, {}) and (
                not targets or "buildprog" in targets):
            for p in build_packages[arch][framework]:
                self.packages[p]["optional"] = False

            if build_packages[arch][framework]:
                required_packages.update(build_packages[arch][framework])

        for p in (set(self.packages) - required_packages):
            self.packages.pop(p, None)

        return super().configure_default_packages(options, targets)

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

    def is_embedded(self):
        return True

    def _add_build_artifact_name(self, board):
        mcu = board.manifest['build']['mcu']
        board.manifest["artifact_name"] = f'turbox_openHarmony.elf'
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

        # Regular operationsls
        if "linux" in get_systype() and board_id in ['bl602']:
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
