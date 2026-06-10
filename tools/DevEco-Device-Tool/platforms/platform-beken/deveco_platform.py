from platformio.managers.platform import PlatformBase
from platformio.util import get_systype


class BekenPlatform(PlatformBase):
    def __init__(self, manifest_path):
        super().__init__(manifest_path)

    def configure_default_packages(self, options, targets):
        build_packages = {"arm9": {"hb": ["gn", "ninja", "arm_noneeabi_gcc"]}}
        clean_packages = {"arm9": {"hb": ["gn"]}}

        config = self.board_config(options["board"])
        arch = config.get('build', {}).get('cpu', '')
        framework = (set(config.get('frameworks', {}).keys()) &
                     set(options.get("pioframework", []))).pop()

        required_packages = set()
        custom_build = options.get("custom_build_command")
        custom_clean = options.get("custom_clean_command")

        ohos_version = options.get("ohos_version", "")
        if ohos_version:
            build_packages = {}
            clean_packages = {}

        if not custom_clean and "clean" in targets and framework in clean_packages.get(arch, {}):
            for p in clean_packages[arch][framework]:
                self.packages[p]["optional"] = False

            if clean_packages[arch][framework]:
                required_packages.update(clean_packages[arch][framework])

        if not custom_build and (not targets or any(
                [f for f in ["buildprog"] if f in targets])):
            for p in build_packages.get(arch, {}).get(framework, []):
                self.packages[p]["optional"] = False

            if build_packages.get(arch, {}).get(framework, []):
                required_packages.update(build_packages[arch][framework])

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

    def _add_build_artifact_name(self, board): # pylint: disable=no-self-use
        board.manifest["artifact_name"] = 'bk7231_sdk_crc.bin'
        return board

    def tasks(self, board_id, project, env):
        tasks = []
        arg_project = ['--project-dir', project]
        arg_env = ['--environment', env]
        arg_verbose = ['--verbose'] if self.config.get(f'env:{env}', 'verbose_output', False) else []

        if "linux" in get_systype() and board_id == 'bk7231':
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

        return tasks
