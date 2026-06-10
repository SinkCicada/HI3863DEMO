import os
from platformio.managers.platform import PlatformBase
from platformio.project.options import ProjectOptions, ConfigEnvOption
from platformio.util import get_systype
import click


class HisiliconArmPlatform(PlatformBase):
    def __init__(self, manifest_path):
        super().__init__(manifest_path)

        lldb_path = next((x['__pkg_dir'] for x in self.pm.get_installed() if x['name'] == 'tool_lldb'), '')
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
                        type=click.Path(exists=False, file_okay=True, dir_okay=False),
                        default=lldb_path
                    )
            }
        )

    def _get_clean_build_packages(self, options):

        clean_packages = {
            "cortex-a7": {"hb": ["gn", "llvm"],
                          "ohos-sources": [],
                          "hpm": []
                         }
        }
        build_packages = {
            "cortex-a7": {"ohos-sources": ["gn", "ninja", "hc_gen", "llvm"],
                          "hb": ["gn", "ninja", "hc_gen", "llvm", "tool_openjdk_jre"],
                          "hpm": []
                          }
        }

        if options["board"] == "hi3516dv300":
            build_packages["cortex-a7"]["hpm"] = ["tool_openjdk_jre"]

        return clean_packages, build_packages

    def _get_debug_uploader_packages(self):
        debug_packages = {
            "cortex-a7": {"gdb": ["arm_noneeabi_gcc"],
                          "lldb": ["llvm"]}
        }

        uploader_packages = {
            "cortex-a7": ["tool_openjdk_jre"]}

        return debug_packages, uploader_packages

    def _get_required_packages(self, options, targets):
        clean_packages, build_packages = self._get_clean_build_packages(options)

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
        
        if not custom_clean and "linux" in get_systype() \
            and "clean" in targets and framework in clean_packages.get(arch, {}):
            for p in clean_packages[arch][framework]:
                self.packages[p]["optional"] = False

            if clean_packages[arch][framework]:
                required_packages.update(clean_packages[arch][framework])

        if not custom_build and "linux" in get_systype() and (not targets or "buildprog" in targets):
            for p in build_packages.get(arch, {}).get(framework, []):
                self.packages[p]["optional"] = False

            if build_packages.get(arch, {}).get(framework, []):
                required_packages.update(build_packages[arch][framework])
        
        return required_packages

    def configure_default_packages(self, options, targets):

        debug_packages, uploader_packages = self._get_debug_uploader_packages()

        config = self.board_config(options["board"])
        arch = config.get('build', {}).get('cpu', '')

        debug_targets = set(["idedata"])

        required_packages = self._get_required_packages(options, targets)

        if "upload" in targets or "erase" in targets:
            required_packages.update(uploader_packages[arch])

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
            if id_ == 'hi3516dv300':
                result = self._add_specific_options(result)

            result = self._add_build_artifact_name(result)
            result = self._add_default_monitor(result)
            result = self._add_default_image_locations(result)
            return self._add_default_debug_tools(result)
        else:
            for key, _ in result.items():
                if result[key].manifest.get('name', '') == 'Hi3516DV300':
                    result[key] = self._add_specific_options(result[key])

                result[key] = self._add_build_artifact_name(result[key])
                result[key] = self._add_default_monitor(result[key])
                result[key] = self._add_default_debug_tools(result[key])
                result[key] = self._add_default_image_locations(result[key])

        return result

    def _add_specific_options(self, board):  # pylint: disable=no-self-use
        uboot = {
            "prompt": "hisilicon\\s*#",
            "config": {
                "uboot_config_boot": {
                    "name": "Boot OS",
                    "cmds": [
                        "(autoboot:\\s+\\d+|${UBOOTCHAT_UBOOT_PROMPT})",
                        " ",
                        "${UBOOTCHAT_UBOOT_PROMPT}",
                        "setenv bootcmd \"mmc read 0x0 0x80000000 0x800 0x4800;go 0x80000000;\";",
                        "${UBOOTCHAT_UBOOT_PROMPT}",
                        "setenv bootargs \"console=ttyAMA0,115200n8 root=emmc fstype=vfat rw rootaddr=10M rootsize=30M\";",
                        "${UBOOTCHAT_UBOOT_PROMPT}",
                        "setenv bootdelay 3",
                        "${UBOOTCHAT_UBOOT_PROMPT}",
                        "saveenv",
                        "Writing\\sto\\sMMC\\(0\\)\\.\\.\\.\\s*OK\\s*\\r?\\n.*${UBOOTCHAT_UBOOT_PROMPT}",
                        "reset"
                    ]
                },
                "uboot_config_debug": {
                    "name": "Debug",
                    "cmds": [
                        "(autoboot:\\s+\\d+|${UBOOTCHAT_UBOOT_PROMPT})",
                        " ",
                        "${UBOOTCHAT_UBOOT_PROMPT}",
                        "setenv bootcmd \"mmc read 0x0 0x80000000 0x800 0x4800;mw 0x112f0030 0x430 1;\";",
                        "${UBOOTCHAT_UBOOT_PROMPT}",
                        "setenv bootargs \"console=ttyAMA0,115200n8 root=emmc fstype=vfat rw rootaddr=10M rootsize=30M\";",
                        "${UBOOTCHAT_UBOOT_PROMPT}",
                        "setenv bootdelay 3",
                        "${UBOOTCHAT_UBOOT_PROMPT}",
                        "saveenv",
                        "Writing\\sto\\sMMC\\(0\\)\\.\\.\\.\\s*OK\\s*\\r?\\n.*${UBOOTCHAT_UBOOT_PROMPT}",
                        "reset"
                    ]
                }
            }
        }

        board.manifest["platform"] = 'hisilicon_arm'
        board.manifest['uboot'] = uboot
        return board

    def _add_build_artifact_name(self, board):  # pylint: disable=no-self-use
        board.manifest["artifact_name"] = 'OHOS_Image'
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
        cortex_a7_images = {
            "fastboot": "${UPLOAD_IMAGE_FASTBOOT_BIN}",
            "kernel": "${UPLOAD_IMAGE_KERNEL_BIN}",
            "rootfs": "${UPLOAD_IMAGE_ROOTFS_BIN}",
            "userfs": "${UPLOAD_IMAGE_USERFS_BIN}"
        }
        part_types = {k: v
                      for k, v in board.manifest.get('upload', {}).get('partition_types', {}).items()
                      if "bin" not in v}
        for part in part_types:
            if part in cortex_a7_images:
                part_types.get(part).update({'bin': cortex_a7_images[part]})
            else:
                part_types.get(part).update({'bin': ''})
        board.manifest['upload.partition_types'] = part_types
        return board

    def _add_default_debug_tools(self, board):
        debug = board.manifest.get("debug", {})
        entry_point = debug.get("entry_point", "0x42000000")

        if "tools" not in debug:
            debug['tools'] = {}

        openocd_target = debug.get("openocd_target")
        platform_dir = self.get_dir()
        if openocd_target:
            link = "openocd"
            debug['tools'][link] = {
                "load_mode": "manual",
                "onboard": True,
                "port": "3333",
                "server": {
                    "executable": "bin/openocd",
                    "package": "tool_openocd",
                    "arguments": [
                        "-s", os.path.join(platform_dir, "scripts", "openocd"),
                        "-s", os.path.join("$PACKAGE_DIR", "scripts"),
                        "-f", os.path.join("interface", "jlink.cfg"),
                        "-f", os.path.join("target", "%s.cfg" % openocd_target),
                        "-c", "gdb_port $DEBUG_PORT"
                    ]}
            }
            self._set_debug_client_tools(debug['tools'][link], entry_point)

            if debug.get('broken_jtag', False):
                debug['tools'][link]['server'].update(
                    {
                        "softreset_arguments": [
                            "-s", os.path.join(platform_dir, "scripts", "openocd"),
                            "-s", os.path.join("$PACKAGE_DIR", "scripts"),
                            "-f", os.path.join("interface", "jlink.cfg"),
                            "-f", os.path.join("target", "%s.cfg" % openocd_target),
                            "-c", "gdb_port disabled; tcl_port disabled;telnet_port disabled",
                            "-c", "init",
                            "-c", "reset halt",
                            "-c", "soft_reset_board",
                            "-c", "shutdown"
                        ]})
                debug['tools'][link]['server']['arguments'].extend(["-c", "sleep 4000"])

        board.manifest['debug'] = debug
        return board

    def _set_debug_client_tools(self, debug_link, entry_point):
        os_entry_point = 'OsMain'
        init_launch_cmds = self._get_init_launch_cmds(entry_point)
        init_attach_cmds = self._get_init_attach_cmds(entry_point)
        client_tools = {
            "gdb": {
                "init_launch_cmds": init_launch_cmds,
                "init_attach_cmds": init_attach_cmds,
                "init_break": f"break {os_entry_point}"
            },
            "lldb": {
                "extend_server_args": [
                    "-c", "init",
                    "-c", "reset halt",
                    "-c", "cortex_a maskisr on",
                    "-c", "reg pc %s" % entry_point
                ],
                "init_break": f"breakpoint set --name {os_entry_point}"
            }
        }
        debug_link["client_tools"] = client_tools

    def _get_init_launch_cmds(self, entry_point):
        init_launch_cmds = [
            "define pio_reset_halt_target",
            "    monitor reset halt",
            "end",
            "define pio_reset_run_target",
            "    monitor reset run",
            "end",
            "define pre_init_target",
            "    target extended-remote :$DEBUG_PORT",
            "    set remotetimeout unlimited",
            "    set filename-display absolute",
            "    monitor init",
            "    pio_reset_halt_target",
            "    monitor cortex_a maskisr on",
            "    set $pc=%s" % entry_point,
            "    $INIT_BREAK",
            "end",
            "define restart_target",
            "    pio_reset_halt_target",
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

    def _get_init_attach_cmds(self, entry_point):
        init_attach_cmds = [
            "define pio_reset_halt_target",
            "    monitor reset halt",
            "end",
            "define pio_reset_run_target",
            "    monitor reset run",
            "end",
            "define pre_init_target",
            "    target extended-remote :$DEBUG_PORT",
            "    set remotetimeout unlimited",
            "    set filename-display absolute",
            "    monitor init",
            "    monitor halt",
            "    monitor cortex_a maskisr on",
            "    set $pc=%s" % entry_point,
            "    $INIT_BREAK", "end",
            "define restart_target",
            "    pio_reset_halt_target",
            "    monitor sleep 4000",
            "    monitor exit",
            "    pre_init_target",
            "end",
            "define pio_restart_target",
            "    restart_target",
            "end",
            "define pio_init_target",
            "    pre_init_target",
            "end",
            "pio_init_target"
        ]
        return init_attach_cmds

    def tasks(self, board_id, project, env):
        tasks = []
        arg_project = ['--project-dir', project]
        arg_env = ['--environment', env]
        arg_verbose = ['--verbose'] if self.config.get(f'env:{env}', 'verbose_output', False) else []

        tasks = super().tasks(board_id, project, env)
        if "windows" in get_systype():
            tasks = [task for task in tasks if "name" not in task or task["name"] not in ["Clean", "Build", "Rebuild"]]

        group_len = len([v for v in tasks if v['type'] == 'group'])
        task_len = len(tasks) - group_len - 1

        tasks.insert(task_len, {'type': 'task',
                        'name': 'Menu Config',
                        'title': 'Menu Config',
                        'id': f'deveco: config - {env}',
                        'icon': 'menu',
                        'cmd': [self._hos(), 'run', '--target', 'menuconfig'
                                ] + arg_project + arg_env + arg_verbose,
                        'exclusive': self._generate_exclusive(['build'], env),
                        'execution-type': 'process'})

        tasks.insert(task_len + 1, {'type': 'task',
                        'name': 'Perf Analysis',
                        'title': 'Perf Analysis',
                        'id': f'deveco: perf analysis - {env}',
                        'icon': 'perf-analysis',
                        'cmd': [self._hos(), 'run', '--target', 'perfAnalysis'
                                ] + arg_project + arg_env + arg_verbose,
                        'execution-type': 'process'})
        
        tasks.insert(task_len + 2, {'type': 'task',
                        'name': 'Trace Analysis',
                        'title': 'Trace Analysis',
                        'id': f'deveco: trace analysis - {env}',
                        'icon': 'trace-analysis',
                        'cmd': [''],
                        'execution-type': 'process'})

        return tasks
