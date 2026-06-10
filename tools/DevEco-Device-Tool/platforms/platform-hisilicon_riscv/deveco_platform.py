import os
from platformio.managers.platform import PlatformBase
from platformio.project.options import ProjectOptions, ConfigEnvOption
from platformio.util import get_systype
import click


class HisiliconRiscvPlatform(PlatformBase):
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

    def _get_build_clean_packages(self, options):
        build_packages = {
            "risc-v": {"ohos-sources": ["gn", "ninja", "gcc_riscv32"],
                       "hb": ["gn", "ninja", "gcc_riscv32"],
                       "hpm": []
                       }
        }

        if options["board"] == "wf_h861_rta1":
            build_packages["risc-v"]["hb"] = ["gn", "ninja", "hcc_riscv32"]

        clean_packages = {"risc-v": {"hb": ["gn"], "ohos-sources": [], "hpm": []}}

        return build_packages, clean_packages

    def _get_debug_uploader_packages(self, options):
        debug_packages = {
            "risc-v": {"gdb": ["gcc_riscv32"],
                       "lldb": []}
        }

        upload_protocol = options.get("upload_protocol", "")
        uploader_packages = {
            "risc-v": ["tool_openjdk_jre"]
        }
        if upload_protocol == "burn-serial":
            uploader_packages = {
                "risc-v": ["tool_burn"]
            }
        elif upload_protocol == "openocd-serial":
            uploader_packages = {
                "risc-v": []
            }

        if "linux" in get_systype():
            uploader_packages["risc-v"] = ["tool_openjdk_jre"]

        return debug_packages, uploader_packages

    def _get_required_packages(self, options, targets):
        build_packages, clean_packages = self._get_build_clean_packages(options)

        config = self.board_config(options["board"])
        mcu = config.get('build', {}).get('mcu', '')
        if "windows" in get_systype() and mcu == 'Hi3861':
            build_packages["risc-v"]["hpm"].append("tool_msys")
            build_packages["risc-v"]["ohos-sources"].append("tool_msys")
            build_packages["risc-v"]["hb"].append("tool_msys")

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
                [f for f in ["buildprog", "build_ota", "menuconfig"] if f in targets])):
            for p in build_packages.get(arch, {}).get(framework, []):
                self.packages[p]["optional"] = False

            if build_packages.get(arch, {}).get(framework, []):
                required_packages.update(build_packages[arch][framework])
                
        return required_packages

    def configure_default_packages(self, options, targets):  # pylint: disable=too-many-statements

        debug_packages, uploader_packages = self._get_debug_uploader_packages(options)

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
        mcu = board.get('build', {}).get('mcu', '')
        if mcu == 'Hi3861':
            board.manifest["artifact_name"] = 'Hi3861_wifiiot_app.out'
        else:
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
        entry_point = debug.get("entry_point", "0x42000000")
        mcu = board.get('build', {}).get('mcu', '')
        os_entry_point = 'app_main' if mcu == 'Hi3861' else 'main'
        if "tools" not in debug:
            debug['tools'] = {}

        openocd_target = debug.get("openocd_target")

        openocd_targets = ["hi3861", "hi3061h", "hi3061l", "hi3065h"]
        if openocd_target in openocd_targets:
            link = "openocd"
            debug['tools'][link] = self._get_debug_openocd_tools(openocd_target, entry_point, os_entry_point)

        link = "jlink"
        if debug.get("jlink_target") and link not in debug['tools']:
            jlink_target = debug.get("jlink_target")
            debug['tools'][link] = self._get_debug_jlink_tools(jlink_target, os_entry_point)

        board.manifest['debug'] = debug
        return board

    def _get_debug_openocd_tools(self, openocd_target, entry_point, os_entry_point):
        platform_dir = self.get_dir()
        debug_interface = "$DEBUG_INTERFACE"
        openocd_tools = {
            "load_mode": "manual",
            "onboard": True,
            "port": "3333",
            "server": {
                "executable": "bin/openocd.exe",
                "package": "hw_openocd",
                "arguments": [
                    "-s", os.path.join(platform_dir, "scripts", "openocd"),
                    "-f", os.path.join("interface",
                                        "hi-ft2232d-ftdi-%s.cfg" % debug_interface),
                    "-f", os.path.join("target", "%s-%s.cfg" %
                                        (openocd_target, debug_interface))
                ]},
            "client_tools": {
                "gdb": {
                    "init_launch_cmds": [
                        "define pre_init_target",
                        "    target extended-remote :$DEBUG_PORT",
                        "    monitor gdb_breakpoint_override hard",
                        "    set $pc=%s" % entry_point,
                        "    $INIT_BREAK",
                        "end",
                        "define pio_restart_target",
                        "    pre_init_target",
                        "end",
                        "define pio_init_target",
                        "    pre_init_target",
                        "end",
                        "pio_init_target"
                    ],
                    "init_break": f"hb {os_entry_point}"
                }
            }
        }
        return openocd_tools

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

        if board_id in ['wf_h861_rta1']:
            self._set_wf_h861_rta1_task(tasks, env, arg_list)
            self._set_upload_task(tasks, env, arg_list)

        else:
            tasks = super().tasks(board_id, project, env)
            ohos_version = self.config.get(f'env', 'ohos_version', '')
            if "windows" in get_systype() and any([
                board_id in ['bearpi_hm_nano'], 
                board_id in ['hi3861'] and ohos_version
            ]):
                tasks = [
                    task for task in tasks if "name" not in task or task["name"] not in ["Clean", "Build", "Rebuild"]]

            self._set_hi3861_analysis_task(tasks, env, board_id, arg_list)

        return tasks


    def _set_wf_h861_rta1_task(self, tasks, env, arg_list):
        if "linux" in get_systype():
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

            tasks.append({'type': 'task',
                            'name': 'Menu Config',
                            'title': 'Menu Config',
                            'id': f'deveco: config - {env}',
                            'icon': 'menu',
                            'cmd': [self._hos(), 'run', '--target',
                                    'menuconfig'] + arg_list.get('arg_project') + 
                                        arg_list.get('arg_env') + arg_list.get('arg_verbose'),
                            'exclusive': self._generate_exclusive(['build'], env),
                            'execution-type': 'process'})

            tasks.append({'type': 'task',
                            'name': 'Build OTA',
                            'title': 'Build OTA',
                            'id': f'deveco: build_ota - {env}',
                            'icon': 'build',
                            'cmd': [self._hos(), 'run', '--target',
                                    'build_ota'] + arg_list.get('arg_project') + 
                                        arg_list.get('arg_env') + arg_list.get('arg_verbose'),
                            'exclusive': self._generate_exclusive(['build'], env),
                            'execution-type': 'process'})

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

    def _set_hi3861_analysis_task(self, tasks, env, board_id, arg_list):
        group_len = [i for i, v in enumerate(tasks) if v['type'] == 'group']

        if group_len:
            task_len = group_len[0]
        else:
            task_len = len(tasks)

        board_config = self.get_boards(board_id)
        if board_config.get("build", {}).get("mcu", "") == "Hi3861":
            tasks.insert(task_len, {'type': 'task',
                                    'name': 'Stack Analysis',
                                    'title': 'Stack Analysis',
                                    'id': f'deveco: stack analysis - {env}',
                                    'icon': 'stack-analysis',
                                    'cmd': [self._hos(), 'run', '--target', 'stackAnalysis'
                                            ] + arg_list.get('arg_project') + 
                                                arg_list.get('arg_env') + arg_list.get('arg_verbose'),
                                    'execution-type': 'process'})

            tasks.insert(task_len + 1, {'type': 'task',
                                        'name': 'Image Analysis',
                                        'title': 'Image Analysis',
                                        'id': f'deveco: image analysis - {env}',
                                        'icon': 'image-analysis',
                                        'cmd': [self._hos(), 'run', '--target', 'imageAnalysis'
                                                ] + arg_list.get('arg_project') + 
                                                    arg_list.get('arg_env') + arg_list.get('arg_verbose'),
                                        'execution-type': 'process'})

        if board_id in ['hi3861']:
            tasks.insert(task_len + 2, {'type': 'task',
                                        'name': 'Profiling',
                                        'title': 'Profiling',
                                        'id': f'deveco: profiling - {env}',
                                        'icon': 'profiling',
                                        'cmd': [''],
                                        'execution-type': 'process'})
