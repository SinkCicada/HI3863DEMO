from platformio.managers.platform import PlatformBase
from platformio.util import get_systype


class QemuPlatform(PlatformBase):

    def configure_default_packages(self, options, targets):
        debug_packages = {
            "cortex-a7": {"gdb": ["arm_noneeabi_gcc"],
                          "lldb": ["llvm"]}
        }
        build_packages = {
            "cortex-a7": {"hb": ["gn", "ninja", "llvm", "hc_gen"]}
        }

        config = self.board_config(options["board"])
        arch = self.board_config(options["board"]).get('build', {}).get('cpu', '')
        framework = (set(config.get('frameworks', {}).keys()) & set(options.get("pioframework", []))).pop()

        required_packages = set()
        debug_targets = {"idedata"}

        ohos_version = options.get("ohos_version", "")
        if ohos_version:
            build_packages = {}

        if "linux" in get_systype() and not debug_targets & set(targets):
            for p in build_packages.get(arch, {}).get(framework, []):
                self.packages[p]["optional"] = False

            if build_packages.get(arch, {}).get(framework, []):
                required_packages.update(build_packages[arch][framework])

        if debug_targets & set(targets):
            board_config = self.board_config(options["board"])
            debug_client = options.get("debug_client")
            if not debug_client:
                debug_client = board_config.get("debug.client")

            required_packages.update(debug_packages[arch][debug_client])

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
            result = self._add_build_artifact_name(result)
            result = self._add_default_monitor(result)
            return self._add_default_debug_tools(result)
        else:
            for key, _ in result.items():
                result[key] = self._add_build_artifact_name(result[key])
                result[key] = self._add_default_monitor(result[key])
                result[key] = self._add_default_debug_tools(result[key])

        return result

    def _add_build_artifact_name(self, board):  # pylint: disable=no-self-use
        board.manifest["artifact_name"] = 'OHOS_Image'
        return board

    def _add_default_monitor(self, board):  # pylint: disable=no-self-use
        if "monitor" not in board.manifest:
            board.manifest["monitor"] = {
                "port": "socket://:1234",
                "speed": "115200",
                "raw": True,
                "eol": "LF"
            }
        return board

    def _add_default_debug_tools(self, board):  # pylint: disable=no-self-use
        debug = board.manifest.get("debug", {})
        if "tools" not in debug:
            debug['tools'] = {}

        debug['tools']['qemu'] = {
            "port": '1234',
            'server': {
                'package': 'tool_qemu_arm',
                'executable': 'qemu-system-arm',
                'arguments': {
                    'default': [
                        "-M", "virt,gic-version=2,secure=on",
                        "-cpu", "cortex-a7",
                        "-smp", "cpus=1",
                        "-nographic",
                        "-m", "1G",
                        "-drive",
                        "if=pflash,format=raw,file=$PROJECT_DIR/flash.img",
                        '-S', '-gdb',
                        'tcp::$DEBUG_PORT'
                    ],
                    'no-debug': [
                        "-M", "virt,gic-version=2,secure",
                        "-cpu", "cortex-a7",
                        "-smp", "cpus=1",
                        "-nographic",
                        "-m", "1G",
                        "-drive",
                        "if=pflash,format=raw,file=$BUILD_OUT_DIR/qemu-image.img",
                        '-serial', 'tcp::$MONITOR_PORT,server,nodelay'
                    ]
                },
            },
            "load_mode": "manual",
            "client_tools": {
                "gdb": {
                    "init_break": "break main",
                    "init_launch_cmds": [],
                    "exit_cmds": ["monitor quit"]
                },
                "lldb": {
                    "init_break": "breakpoint set --name OsMain",
                    "exit_cmds": ["monitor quit"]
                }
            }
        }

        board.manifest['debug'] = debug
        return board

    def tasks(self, board_id, project, env):
        tasks = []
        board = self.get_boards(board_id)
        qemu_images = board.manifest.get("frameworks").get("hb").get("qemu_image")

        arg_project = ['--project-dir', project]
        arg_env = ['--environment', env]
        arg_verbose = ['--verbose'] if self.config.get(f'env:{env}', 'verbose_output', False) else []
        arg_images = []

        for image in qemu_images:
            arg_images += ["--image", image]
        arg_port = ['--client-port', '${command:deveco-device-tool.getDebugLocalPort}']
        arg_gdb = ['--gdb-port', '${command:deveco-device-tool.getDebugRemotePort}']
        tasks.append({'type': 'task',
                      'name': 'Build',
                      'title': 'Build target binary',
                      'id': f'deveco: build - {env}',
                      'icon': 'build',
                      'cmd': [self._hos(), 'run'] + arg_project + arg_env + arg_verbose,
                      'execution-type': 'process'})

        tasks.append({'type': 'task',
                      'name': 'Run',
                      'title': 'Run in QEMU',
                      'id': f'deveco: runQemu - {env}',
                      'icon': 'run',
                      'cmd': [self._hos(), 'qemu', 'run'] + arg_project + arg_images,
                      'execution-type': 'process'})

        tasks.append({'type': 'task',
                      'title': 'Debug in QEMU',
                      'id': f'deveco: debugQemu - {env}',
                      'icon': 'run',
                      'cmd': [self._hos(), 'qemu', 'run'] + arg_project + arg_images + arg_env + arg_port + arg_gdb,
                      'execution-type': 'process',
                      'daemon': {
                          'starting-pattern': '^.*Transferring\\sfiles...',
                          'started-pattern': '^.*Starting\\sQEMU\\smain\\sloop.*'
                      }})

        return tasks
