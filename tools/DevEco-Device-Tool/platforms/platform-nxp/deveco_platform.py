import os
from platformio.managers.platform import PlatformBase
from platformio.util import get_systype


class NxpPlatform(PlatformBase):
    def __init__(self, manifest_path):
        super().__init__(manifest_path)

    def configure_default_packages(self, options, targets):
        self.packages['arm_noneeabi_gcc']['optional'] = False
        return super().configure_default_packages(options, targets)

    def is_embedded(self):
        return True

    def get_boards(self, id_=None):
        result = PlatformBase.get_boards(self, id_)
        if not result:
            return result

        if id_:
            result = self._add_default_monitor(result)
            result = self._add_default_image_locations(result)
            result = self._add_build_artifact_name(result)
            return self._add_default_debug_tools(result)
        else:
            for key, _ in result.items():
                result[key] = self._add_default_monitor(result[key])
                result[key] = self._add_default_image_locations(result[key])
                result[key] = self._add_build_artifact_name(result[key])
                result[key] = self._add_default_debug_tools(result[key])

        return result

    def _add_build_artifact_name(self, board):  # pylint: disable=no-self-use
        board.manifest["artifact_name"] = 'liteos'
        return board

    def _add_default_monitor(self, board):  # pylint: disable=no-self-use
        if "monitor" not in board.manifest:
            board.manifest["monitor"] = {
                "speed": "115200",
                "raw": True,
                "eol": "LF"
            }
        return board

    def _add_default_image_locations(self, board):  # pylint: disable=no-self-use
        part_types = board.manifest.get('upload', {}).get('partition_types', {})
        for part in part_types:
            part_types.get(part).update({'bin': f'$IMAGE_{part.upper()}_BIN'})
        board.manifest['upload.partition_types'] = part_types
        return board

    def _add_default_debug_tools(self, board):
        debug = board.manifest.get("debug", {})
        entry_point = debug.get("entry_point", "0x80000000")

        if "tools" not in debug:
            debug['tools'] = {}

        openocd_target = debug.get("openocd_target")
        if openocd_target:
            link = "gdb"
            platform_dir = self.get_dir()
            init_launch_cmds = self._get_init_launch_cmds(entry_point)
            debug['tools'][link] = {
                "load_mode": "manual",
                "onboard": True,
                "server": {
                    "executable": "bin/openocd",
                    "package": "tool_openocd",
                    "arguments": [
                        "-s", os.path.join(platform_dir, "scripts", "openocd"),
                        "-s", os.path.join("$PACKAGE_DIR", "scripts"),
                        "-f", os.path.join("interface", "jlink.cfg"),
                        "-f", os.path.join("target", "%s.cfg" % openocd_target)
                    ]},
                "init_launch_cmds": init_launch_cmds,
                "init_break": "break OsMain"
            }
            link = "openocd"
            debug['tools'][link] = debug["tools"]["gdb"].copy()
            board.manifest['debug'] = debug
        return board

    def _get_init_launch_cmds(self, entry_point):
        init_launch_cmds =  [
            "define pio_reset_halt_target",
            "    monitor reset halt",
            "end",
            "define pio_reset_run_target",
            "    monitor reset run",
            "end",
            "define pre_init_target",
            "    target extended-remote $DEBUG_PORT",
            "    set remotetimeout unlimited",
            "    set filename-display absolute",
            "    monitor init",
            "    pio_reset_halt_target",
            "    monitor gdb_breakpoint_override hard",
            "    monitor cortex_a maskisr on",
            "    set $pc=%s" % entry_point,
            "    $INIT_BREAK",
            "end",
            "define restart_target",
            "    pio_reset_halt_target",
            "    monitor soft_reset_board",
            "    monitor sleep 4000",
            "    monitor exit",
            "    pre_init_target",
            "end",
            "define pio_restart_target",
            "    restart_target",
            "end",
            "define pio_init_target",
            "    pre_init_target",
            "    restart_target",
            "end",
            "pio_init_target"
        ]
        return init_launch_cmds

    def tasks(self, board_id, project, env):
        tasks = []
        arg_project = ['--project-dir', project]
        arg_env = ['--environment', env]
        arg_verbose = ['--verbose'] if self.config.get(f'env:{env}', 'verbose_output', False) else []
        encoding = self.config.get(f'env:{env}', 'monitor_encoding', 'UTF-8')

        # Regular operations
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
