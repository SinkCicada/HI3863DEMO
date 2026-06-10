import os
from platformio.managers.platform import PlatformBase
from platformio.project.options import ProjectOptions, ConfigEnvOption
from platformio.util import get_systype
from platformio import exception
from platformio.commands.debug.exception import DebugSupportError
import click


class VendorohPlatform(PlatformBase):
    def __init__(self, manifest_path):
        super().__init__(manifest_path)

        lldb_path = next(
            (x['__pkg_dir']
             for x in self.pm.get_installed() if x['name'] == 'tool_lldb'),
            '')
        if lldb_path:
            if "windows" in get_systype():
                lldb_path = os.path.join(lldb_path, 'liblldb.dll')
            else:
                lldb_path = os.path.join(lldb_path, 'lib', 'liblldb.so')

        ProjectOptions.update(
            {
                'env.debug_liblldb_path':
                    ConfigEnvOption(
                        group="debug",
                        name="debug_liblldb_path",
                        description="Custom path to liblldb overrides default",
                        type=click.Path(
                            exists=False, file_okay=True, dir_okay=False),
                        default=lldb_path
                    )
            }
        )


    def _get_required_packages(self, options, targets):
        build_packages = {
            "risc-v": {"ohos-sources": ["gcc_riscv32"]}
        }

        config = self.board_config(options["board"])
        arch = config.get('build', {}).get('cpu', '')
        framework = (set(config.get('frameworks', {}).keys()) &
                     set(options.get("pioframework", []))).pop()

        required_packages = set()

        custom_build = options.get("custom_build_command")

        if not custom_build and (not targets or "buildprog" in targets):
            for p in build_packages.get(arch, {}).get(framework, []):
                self.packages[p]["optional"] = False

            if build_packages.get(arch, {}).get(framework, []):
                required_packages.update(build_packages[arch][framework])

        return required_packages

    def configure_default_packages(self, options, targets):  # pylint: disable=too-many-statements

        debug_packages = {
            "risc-v": {"gdb": ["gcc_riscv32"]}
        }
        uploader_packages = {
                "risc-v": ["tool_burn"]
        }

        if "linux" in get_systype() or options['board'] in ['hi3861']:
            uploader_packages["risc-v"] = []

        debug_targets = set(["idedata"])

        config = self.board_config(options["board"])
        arch = config.get('build', {}).get('cpu', '')

        required_packages = self._get_required_packages(options, targets)

        if "upload" in targets or "erase" in targets:
            required_packages.update(uploader_packages[arch])

        if debug_targets & set(targets):
            board_config = self.board_config(options["board"])
            debug_client = options.get("debug_client")
            if not debug_client:
                debug_client = board_config.get("debug.client")

            # RISC-V debug tools available on Windows only
            if "windows" in get_systype():
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
        os_entry_point = 'main'
        if "tools" not in debug:
            debug['tools'] = {}

        link = "jlink"
        if debug.get("jlink_target") and link not in debug['tools']:
            jlink_target = debug.get("jlink_target")
            debug['tools'][link] = self._get_debug_jlink_tools(jlink_target, os_entry_point)

        board.manifest['debug'] = debug
        return board


    def _get_debug_jlink_tools(self, jlink_target, os_entry_point):
        debug_interface = "$DEBUG_INTERFACE"
        jlink_tools = {
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
                    "-device", jlink_target,
                    "-port", "$DEBUG_PORT",
                    "-speed", "$DEBUG_SPEED"
                ]},
            "client_tools": {
                "gdb": {
                    "init_break": f"tbreak {os_entry_point}"
                },
                "lldb": {
                    "init_break": f"breakpoint set --name {os_entry_point}"
                }
            }
        }
        return jlink_tools

    def tasks(self, board_id, project, env):  # pylint: disable=too-many-branches
        tasks = []
        arg_project = ['--project-dir', project]
        arg_env = ['--environment', env]
        arg_verbose = [
            '--verbose'] if self.config.get(f'env:{env}', 'verbose_output', False) else []
        arg_list = {'arg_project': arg_project, 'arg_env': arg_env, 'arg_verbose': arg_verbose}

        if board_id in ['5gnbv100', 'hi3861']:
            self._set_common_task(tasks, board_id, env, arg_list)

        return tasks

    def _set_common_task(self, tasks, board_id, env, arg_list):
        if "windows" in get_systype():
            tasks.append({'type': 'task',
                                'name': 'Clean',
                                'title': 'Clean output',
                                'id': f'deveco: clean - {env}',
                                'icon': 'clean',
                                'cmd': [self._hos(), 'run', '--target', 'clean'] +
                                        arg_list.get('arg_project') +
                                        arg_list.get('arg_env') + arg_list.get('arg_verbose'),
                                'exclusive': self._generate_exclusive(['build'], env),
                                'execution-type': 'process'})

            tasks.append({'type': 'task',
                            'name': 'Build',
                            'title': 'Build target binary',
                            'id': f'deveco: build - {env}',
                            'icon': 'build',
                            'cmd': [self._hos(), 'run'] + arg_list.get('arg_project') + 
                                        arg_list.get('arg_env') + arg_list.get('arg_verbose'),
                            'exclusive': self._generate_exclusive(['build'], env),
                            'execution-type': 'process'})

            tasks.append({'type': 'task',
                            'name': 'Rebuild',
                            'title': 'Rebuild target binary',
                            'id': f'deveco: rebuild - {env}',
                            'icon': 'rebuild',
                            'cmd': [self._hos(), 'run', '--target', 'clean', '--target',
                                    'buildprog'] + arg_list.get('arg_project') +
                                        arg_list.get('arg_env') + arg_list.get('arg_verbose'),
                            'exclusive': self._generate_exclusive(['build'], env),
                            'execution-type': 'process'})

            self._set_upload_analysis_task(tasks, env, arg_list, board_id)
            self._set_debug_task(tasks, board_id, env)

    def _set_upload_analysis_task(self, tasks, env, arg_list, board_id):
        tasks.append({'type': 'task',
                        'name': 'Upload',
                        'title': f'Upload to device',
                        'id': f'deveco: upload - {env}',
                        'icon': 'burn',
                        'cmd': [self._hos(), 'run', '--target', 'upload'
                                ] + arg_list.get('arg_project') + 
                                arg_list.get('arg_env') + arg_list.get('arg_verbose'),
                        'execution-type': 'process'})
                        
        if board_id in ["hi3861"]:
            encoding = self.config.get(f'env:{env}', 'monitor_encoding', 'UTF-8')
            tasks.append({'type': 'task',
                            'name': 'Monitor',
                            'title': 'Start device monitor',
                            'id': f'deveco: monitor - {env}',
                            'icon': 'monitor',
                            'cmd': [self._hos(), 'device', 'monitor', '--encoding', encoding] +
                                        arg_list.get('arg_project') + arg_list.get('arg_env'),
                            'execution-type': 'process'})

        tasks.append({'type': 'task',
                        'name': 'Stack Analysis',
                        'title': 'Stack Analysis',
                        'id': f'deveco: stack analysis - {env}',
                        'icon': 'stack-analysis',
                        'cmd': [self._hos(), 'run', '--target', 'stackAnalysis'
                                ] + arg_list.get('arg_project') + 
                                arg_list.get('arg_env') + arg_list.get('arg_verbose'),
                        'execution-type': 'process'})

        tasks.append({'type': 'task',
                        'name': 'Image Analysis',
                        'title': 'Image Analysis',
                        'id': f'deveco: image analysis - {env}',
                        'icon': 'image-analysis',
                        'cmd': [self._hos(), 'run', '--target', 'imageAnalysis'
                                ] + arg_list.get('arg_project') + 
                                arg_list.get('arg_env') + arg_list.get('arg_verbose'),
                        'execution-type': 'process'})


    def _set_debug_task(self, tasks, board_id, env):
        try:
            board_config = self.get_boards(board_id)
        except exception.UnknownBoard:
            board_config = {}
        run_gdbserver = {'type': 'task', 'id': f'deveco: run debug server - {env}',
                        'cmd': [self._hos(), 'debug', '--interface=server', f'--environment={env}',
                                '--client-port=${command:deveco-device-tool.getDebugRemotePort}'],
                        'execution-type': 'process',
                        'daemon': {
                            'starting-pattern': '^.*',
                            'started-pattern': '^.*'
                        }}
        debug_tool = self.config.get(f'env:{env}', 'debug_tool', '')
        if isinstance(board_config, VendorohPlatform):
            try:
                debug_tool = board_config.get_debug_tool_name(debug_tool)
            except DebugSupportError:
                debug_tool = ''

        if debug_tool == 'jlink':
            run_gdbserver['daemon'] = {
                'starting-pattern': '^.*Debug\\sServer\\sConnected*',
                'started-pattern': '^.*Listening\\son\\sTCP/IP\\sport.*'
            }
        elif debug_tool == 'openocd':
            run_gdbserver['daemon'] = {
                'starting-pattern': '^.*Debug\\sServer\\sConnected*',
                'started-pattern': '^.\
                    *Listening\\son\\sport\\s\\d+\\sfor\\sgdb\\sconnections.*'
            }
        if debug_tool:
            tasks.append(run_gdbserver)
