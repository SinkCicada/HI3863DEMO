import os
from platformio.managers.platform import PlatformBase
from platformio.util import get_systype
from platformio.helpers import (get_executable_path)


class VendorhmPlatform(PlatformBase):
    def __init__(self, manifest_path):
        super().__init__(manifest_path)

    def _handle_uploader_packages(self, arch, targets, required_packages):
        uploader_packages = {
            "risc-v": ["tool_openjdk_jre"],
        }
        if "linux" in get_systype():
            uploader_packages["risc-v"] = []

        if "upload" in targets or "erase" in targets:
            required_packages.update(uploader_packages[arch])

    def _handle_debug_packages(self, arch, targets, options, required_packages):
        debug_packages = {
            "risc-v": {"gdb": ["gcc_riscv32", "hw_openocd"]},
        }
        debug_targets = set(["idedata"])
        if debug_targets & set(targets):
            board_config = self.board_config(options["board"])
            debug_client = options.get("debug_client")
            if not debug_client:
                debug_client = board_config.get("debug.client")

            # RISC-V debug tools available on Windows only
            if "windows" in get_systype():
                required_packages.update(debug_packages[arch][debug_client])

    def configure_default_packages(self, options, targets):  # pylint: disable=too-many-branches
        arch = self.board_config(options["board"]).get('build', {}).get('cpu', '')
        framework = (set(["hpm"]) & set(options.get("pioframework", []))).pop()
        required_packages = set()

        self._handle_uploader_packages(arch, targets, required_packages)
        self._handle_debug_packages(arch, targets, options, required_packages)
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
        entry_point_address = debug.get("entry_point_address")
        os_entry_point = 'main'
        if "tools" not in debug:
            debug['tools'] = {}

        openocd_target = debug.get("openocd_target")
        openocd_targets = ["3065HRPIRZ", "3065HRPICZ", "3061HRPIKZ"]
        debug_interface = "$DEBUG_INTERFACE"
        if openocd_target in openocd_targets:
            link = "openocd(HiSpark-Link/FT2232H Debugger)"
            debug['tools'][link] = self._get_debug_openocd_HiSpark_Link_tools(openocd_target, os_entry_point, entry_point_address)

            link = "openocd(HiSpark-Trace)"
            debug['tools'][link] = self._get_debug_openocd_HiSpark_Trace_tools(openocd_target, os_entry_point, entry_point_address)

        link = "jlink"
        if debug.get("jlink_target") and link not in debug['tools']:
            jlink_target = debug.get("jlink_target")
            debug['tools'][link] = self._get_debug_jlink_tools(jlink_target, os_entry_point, entry_point_address)

        board.manifest['debug'] = debug
        return board

    def _get_openocd_client_tools(self, os_entry_point, entry_point_address):
        client_tools = {
            "gdb": {
                "init_launch_cmds": [
                    "define pio_reset_halt_target",
                    "monitor reset halt",
                    "set var $pc=%s" % entry_point_address,
                    "end",

                    "define pio_reset_run_target",
                    "monitor reset",
                    "end",

                    "target extended-remote :$DEBUG_PORT",
                    "monitor init",
                    "$LOAD_CMDS",
                    "pio_reset_halt_target",
                    "$INIT_BREAK",

                    "define pio_restart_target",
                    "pio_reset_halt_target"
                ],
                "init_attach_cmds": [
                    "define pio_reset_halt_target",
                    "monitor reset halt",
                    "set var $pc=%s" % entry_point_address,
                    "end",

                    "define pio_reset_run_target",
                    "monitor reset",
                    "end",

                    "target extended-remote :$DEBUG_PORT",
                    "monitor init",
                    "monitor halt",
                    "$INIT_BREAK",

                    "define pio_restart_target",
                    "pio_reset_halt_target"
                ],
                "init_break": f"tbreak {os_entry_point}"
            }
        }

        return client_tools

    def _get_jlink_client_tools(self, os_entry_point, entry_point_address):
        client_tools = {
            "gdb": {
                "init_launch_cmds": [
                    "define pio_reset_halt_target",
                    "monitor halt",
                    "monitor reset",
                    "set var $pc=%s" % entry_point_address,
                    "end",

                    "define pio_reset_run_target",
                    "monitor clrbp",
                    "monitor reset",
                    "monitor go",
                    "end",

                    "target extended-remote :$DEBUG_PORT",
                    "monitor clrbp",
                    "pio_reset_halt_target",
                     "$LOAD_CMDS",
                    "$INIT_BREAK",

                    "define pio_restart_target",
                    "pio_reset_halt_target"
                ],
                "init_attach_cmds": [
                    "define pio_reset_halt_target",
                    "monitor halt",
                    "monitor reset",
                    "set var $pc=%s" % entry_point_address,
                    "end",

                    "define pio_reset_run_target",
                    "monitor clrbp",
                    "monitor reset",
                    "monitor go",
                    "end",

                    "target extended-remote :$DEBUG_PORT",
                    "monitor clrbp",
                    "monitor halt",
                    "$INIT_BREAK",

                    "define pio_restart_target",
                    "pio_reset_halt_target"
                ],
                "init_break": f"tbreak {os_entry_point}"
            }
        }

        return client_tools

    def _get_debug_openocd_HiSpark_Link_tools(self, openocd_target, os_entry_point, entry_point_address):
        platform_dir = self.get_dir()
        client_tools = self._get_openocd_client_tools(os_entry_point, entry_point_address)
        debug_interface = "$DEBUG_INTERFACE"
        openocd_tools = {
            "load_mode": "manual",
            "onboard": True,
            "port": "3333",
            "server": {
                "executable": "bin/openocd.exe",
                "package": "hw_openocd",
                "arguments": [
                    "-c", "adapter speed $DEBUG_SPEED",
                    "-s", os.path.join(platform_dir, "scripts", "openocd"),
                    "-f", os.path.join("interface",
                                        "ft2232h-ftdi-%s.cfg" % debug_interface),
                    "-f", os.path.join("target", "%s-%s.cfg" %
                                        (openocd_target, debug_interface)),
                ]},
            "client_tools": client_tools
        }
        return openocd_tools

    def _get_debug_openocd_HiSpark_Trace_tools(self, openocd_target, os_entry_point, entry_point_address):
        platform_dir = self.get_dir()
        client_tools = self._get_openocd_client_tools(os_entry_point, entry_point_address)
        debug_interface = "$DEBUG_INTERFACE"
        openocd_tools = {
            "load_mode": "manual",
            "onboard": True,
            "port": "3333",
            "server": {
                "executable": "bin/openocd.exe",
                "package": "hw_openocd",
                "arguments": [
                    "-c", "adapter speed $DEBUG_SPEED",
                    "-s", os.path.join(platform_dir, "scripts", "openocd"),
                    "-f", os.path.join("interface", "cmsis-dap.cfg"),
                    "-f", os.path.join("target", "%s-%s.cfg" %
                                        (openocd_target, debug_interface)),
                ]},
            "client_tools": client_tools
        }
        return openocd_tools        

    def _get_debug_jlink_tools(self, jlink_target, os_entry_point, entry_point_address):
        debug_interface = "$DEBUG_INTERFACE"
        client_tools = self._get_jlink_client_tools(os_entry_point, entry_point_address)
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
            "client_tools": client_tools
        }
        return jlink_tools

    @staticmethod
    def _hos():
        return get_executable_path()

    def tasks(self, board_id, project, env):
        tasks = []
        arg_project = ['--project-dir', project]
        arg_env = ['--environment', env]
        arg_verbose = [
            '--verbose'] if self.config.get(f'env:{env}', 'verbose_output', False) else []

        tasks = super().tasks(board_id, project, env)

        group_len = len([v for v in tasks if v['type'] == 'group'])
        task_len = len(tasks) - group_len - 1

        tasks.insert(task_len, {'type': 'task',
                                'name': 'Stack Analysis',
                                'title': 'Stack Analysis',
                                'id': f'deveco: stack analysis - {env}',
                                'icon': 'stack-analysis',
                                'cmd': [self._hos(), 'run', '--target', 'stackAnalysis'
                                        ] + arg_project + arg_env + arg_verbose,
                                'execution-type': 'process'})

        tasks.insert(task_len + 1, {'type': 'task',
                                    'name': 'Image Analysis',
                                    'title': 'Image Analysis',
                                    'id': f'deveco: image analysis - {env}',
                                    'icon': 'image-analysis',
                                    'cmd': [self._hos(), 'run', '--target', 'imageAnalysis'
                                            ] + arg_project + arg_env + arg_verbose,
                                    'execution-type': 'process'})

        tasks.insert(task_len + 2, {'type': 'task',
                      'name': 'Chip Config',
                      'title': 'Chip Config',
                      'id': f'deveco: chip config - {env}',
                      'icon': 'chip',
                      'cmd': [self._hos(), 'run', '--target', 'chipconfig'],
                      'execution-type': 'process'})

        tasks.insert(task_len + 3, {'type': 'task',
                      'name': 'Variable Trace',
                      'title': 'Variable Trace',
                      'id': f'deveco: variable trace - {env}',
                      'icon': 'variableTrace',
                      'cmd': [self._hos(), 'variabletrace', 'start', '-e', env],
                      'execution-type': 'process'})

        return tasks
