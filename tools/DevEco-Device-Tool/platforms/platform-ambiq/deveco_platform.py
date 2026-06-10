from platformio.managers.platform import PlatformBase
from platformio.util import get_systype
from platformio import  exception
from platformio.commands.debug.exception import (
    DebugSupportError,
)


class AmbiqPlatform(PlatformBase):
    def __init__(self, manifest_path):
        super().__init__(manifest_path)

    def configure_default_packages(self, options, targets):
        debug_packages = {
            "cortex-m4": {"gdb": ["arm_noneeabi_gcc"]}
        }
        build_packages = {
            "cortex-m4": {"hb": ["gn", "ninja", "arm_noneeabi_gcc"]}
        }
        clean_packages = {
            "cortex-m4": {"hb": ["gn"]}
        }
        config = self.board_config(options["board"])
        arch = config.get('build', {}).get('cpu', '')
        framework = (set(config.get('frameworks', {}).keys()) &
                     set(options.get("pioframework", []))).pop()

        required_packages = set()
        debug_targets = set(["idedata"])
        custom_build = options.get("custom_build_command")
        custom_clean = options.get("custom_clean_command")
        custom_make = options.get("custom_make_command")

        ohos_version = options.get("ohos_version", "")
        if ohos_version:
            build_packages = {}
            clean_packages = {}

        if not any([custom_build, custom_make, custom_clean]) \
            and "clean" in targets and framework in clean_packages.get(arch, {}):
            for p in clean_packages[arch][framework]:
                self.packages[p]["optional"] = False
            if clean_packages[arch][framework]:
                required_packages.update(clean_packages[arch][framework])

        if not any([custom_build, custom_make, custom_clean]) \
            and (not targets or any(
                [f for f in ["buildprog"] if f in targets])):
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
        board.manifest["artifact_name"] = 'target.elf'
        return board

    def _add_default_monitor(self, board):  # pylint: disable=no-self-use
        if "monitor" not in board.manifest:
            board.manifest["monitor"] = {
                "speed": "115200",
                "raw": True,
                "eol": "LF"
            }
        return board

    def _add_default_debug_tools(self, board):
        debug = board.manifest.get("debug", {})
        if "tools" not in debug:
            debug['tools'] = {}

        debug_interface = "$DEBUG_INTERFACE"
        link = "jlink"
        if debug.get("jlink_target") and link not in debug['tools']:
            debug['tools'][link] = {
                "load_mode": "manual",
                "onboard": True,
                "port": "3333",
                "server": {
                    "ready_pattern": "Waiting for GDB",
                    "executable": ("JLinkGDBServerCL.exe"
                                   if "windows" in get_systype()
                                   else "JLinkGDBServer"),
                    "arguments": [
                        "-singlerun",
                        "-if", debug_interface,
                        "-select", "USB",
                        "-device", debug.get("jlink_target"),
                        "-port", "$DEBUG_PORT",
                        "-speed", "$DEBUG_SPEED"
                    ]}
            }
            self._set_debug_client_tools(debug['tools'][link])

        board.manifest['debug'] = debug
        return board

    def _set_debug_client_tools(self, debug_link):
        os_entry_point = 'main'
        client_tools = {
            "gdb": {
                "init_launch_cmds": [
                    "define pio_reset_halt_target",
                    "   monitor halt",
                    "   monitor reset",
                    "end",
                    "define pio_reset_run_target",
                    "   monitor clrbp",
                    "   monitor reset",
                    "   monitor go",
                    "end",
                    "target extended-remote :$DEBUG_PORT",
                    "pio_reset_halt_target",
                    "$LOAD_CMDS",
                    "monitor reset",
                    "$INIT_BREAK",
                ],
                "init_attach_cmds": [
                    "define pio_reset_halt_target",
                    "   monitor halt",
                    "   monitor reset",
                    "end",
                    "define pio_reset_run_target",
                    "   monitor clrbp",
                    "   monitor reset",
                    "   monitor go",
                    "end",
                    "target extended-remote :$DEBUG_PORT",
                    "monitor halt",
                    "$INIT_BREAK",
                ],
                "init_break": f"tbreak {os_entry_point}"
            },
            "lldb": {
                "init_break": f"breakpoint set --name {os_entry_point}"
            }
        }
        debug_link["client_tools"] = client_tools

    def tasks(self, board_id, project, env):
        tasks = []
        arg_project = ['--project-dir', project]
        arg_env = ['--environment', env]
        arg_verbose = [
            '--verbose'] if self.config.get(f'env:{env}', 'verbose_output', False) else []

        tasks.append({'type': 'task',
                        'name': 'Clean',
                        'title': 'Clean output',
                        'id': f'deveco: clean - {env}',
                        'icon': 'clean',
                        'cmd': [self._hos(), 'run', '--target', 'clean'] + arg_project + arg_env + arg_verbose,
                        'exclusive': self._generate_exclusive(['build'], env),
                        'execution-type': 'process'})

        if self.config.get(f'env:{env}', 'custom_make_command', None):
            tasks.append({'type': 'task',
                        'name': 'Make',
                        'title': 'Make target binary',
                        'id': f'deveco: make - {env}',
                        'icon': 'make',
                        'cmd': [self._hos(), 'run', '--target', 'make'] + arg_project + arg_env + arg_verbose,
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
        self._set_debug_task(tasks, board_id, env)

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
                            arg_list.get('arg_project') +
                            arg_list.get('arg_env'),
                        'execution-type': 'process'})

    def _set_debug_task(self, tasks, board_id, env):
        try:
            board_config = self.get_boards(board_id)
        except exception.UnknownBoard:
            board_config = {}

        run_debug_server = {'type': 'task',
                            'id': f'deveco: run debug server - {env}',
                            'cmd': [self._hos(), 'debug', '--interface=server', f'--environment={env}',
                                    '--client-port=${command:deveco-device-tool.getDebugRemotePort}'],
                            'execution-type': 'process',
                            'daemon': {
                                'starting-pattern': '^.*',
                                'started-pattern': '^.*'
                            }}

        debug_tool = self.config.get(f'env:{env}', 'debug_tool', '')
        if isinstance(board_config, AmbiqPlatform):
            try:
                debug_tool = board_config.get_debug_tool_name(debug_tool)
            except DebugSupportError:
                debug_tool = ''

        if debug_tool == 'jlink':
            run_debug_server['daemon'] = {
                'starting-pattern': '^.*Debug\\sServer\\sConnected*',
                'started-pattern': '^.*Listening\\son\\sTCP/IP\\sport.*'
            }
        elif debug_tool == 'openocd':
            run_debug_server['daemon'] = {
                'starting-pattern': '^.*Debug\\sServer\\sConnected*',
                'started-pattern': '^.*Listening\\son\\sport\\s\\d+\\sfor\\sgdb\\sconnections.*'
            }
        if debug_tool:
            tasks.append(run_debug_server)
