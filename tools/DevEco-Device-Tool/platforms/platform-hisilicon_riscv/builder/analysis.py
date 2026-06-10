from os.path import join, isfile, abspath, exists
import os
import re
import json
import click
import hpm_adapter
from liteos_optimize_adapter import AnalyzerOptimize
from SCons.Script import (Import)
from SCons import Errors


def StackAnalysis(environ, target, source, env):
    return analysis_cmd(environ, target, source, env, "stack")


def ImageAnalysis(environ, target, source, env):
    return analysis_cmd(environ, target, source, env, "build")


def get_compiler_path(env):
    compiler_path = ''
    ohos_version = env.subst("$OHOS_VERSION")
    product = env.subst("$BOARD_FRAMEWORKS_HB_BUILD_PRODUCT")
    if ohos_version and product:
        status_path = join(env.subst("$PROJECT_DIR"), '.deveco', 'status', f'{re.sub("[@/]", ".", product)}')
        if isfile(status_path):
            tool_status = json.load(open(status_path, 'r'))
            riscv32_tool = tool_status.get('tools', {}).get('compiler', {}).get('riscv32-unknown-elf-gcc', {})
            if riscv32_tool.get('valid', False):
                compiler_path = riscv32_tool.get('dest', '')

    if not compiler_path:
        raise Errors.BuildError(errstr=f"Package gcc_riscv32  is not found."
                            f"Please, configure 'gcc_riscv32' on 'toolchain' page")
    return compiler_path


def get_elf_map_paths(env, action):
    if not env.subst("$ANALYSIS_ELF_BIN") and not env.subst("$ANALYSIS_ELF_PATH"):
        raise Errors.BuildError(errstr=f"Please config option: analysis_elf_path in project settings")

    elf_path = abspath(env.subst("$ANALYSIS_ELF_PATH") or env.subst(join("$PROJECT_DIR", "$ANALYSIS_ELF_BIN")))
    if not isfile(elf_path):
        raise Errors.BuildError(errstr=f"Elf file not found: {elf_path}")

    map_path = None
    if action == "build":
        if not env.subst("$ANALYSIS_MAP_PATH") and not env.subst("$ANALYSIS_MAP_BIN"):
            raise Errors.BuildError(errstr=f"Please config option: analysis_map_path in project settings")

        map_path = abspath(env.subst("$ANALYSIS_MAP_PATH") or env.subst(join("$PROJECT_DIR", "$ANALYSIS_MAP_BIN")))
        if not isfile(map_path):
            raise Errors.BuildError(errstr=f"Map file not found: {map_path}")
    return (elf_path, map_path)


def analysis_cmd(environ, target, source, env, action):
    # pylint: disable=unused-argument, too-many-locals, too-many-branches
    board_config = env.BoardConfig()
    compiler_path = ''
    analyzer_file = 'funcstack.json' if action == "stack" else 'memoryDetails.json'
    analyzer_path = join(env.subst("$PROJECT_DIR"), 'analyzerJson', analyzer_file)
    if isfile(analyzer_path):
        os.remove(analyzer_path)

    if 'hpm' in env.get("PIOFRAMEWORK", []):
        gcc_riscv32_path = board_config.get('frameworks', {}).get('hpm', {}).get('gcc_riscv32_path', '')
        hpm_gcc_dir = env.subst(join("$PROJECT_DIR", gcc_riscv32_path))

        if not exists(hpm_gcc_dir):
            hpm = hpm_adapter.Hpm(stdout=None, stderr=None)
            if 'HPM_GCC_INSTALL' in hpm.config:
                hpm_gcc_dir = join(hpm.config['HPM_GCC_INSTALL'], "gcc_riscv32", "bin")

        compiler_path = hpm_gcc_dir if exists(hpm_gcc_dir) else env.subst("$ANALYSIS_COMPILER_PATH")

        if not compiler_path:
            raise Errors.BuildError(errstr=f"Package gcc_riscv32 is not found."
                                    f"Please, configure analysis_compiler_path")
    elif 'ohos-sources' in env.get("PIOFRAMEWORK", []):
        compiler_path = env.subst("$ANALYSIS_COMPILER_PATH")
        if not compiler_path:
            raise Errors.BuildError(errstr=f"Package gcc_riscv32 is not found."
                                    f"Please, configure analysis_compiler_path")
    else:
        compiler_path = get_compiler_path(env)

    elf_path, map_path = get_elf_map_paths(env, action)

    stack_mode = env.subst("$ANALYSIS_MODE")
    stack_rec_stats = env.subst("$ANALYSIS_REC_STATS")

    result = -1

    try:
        optimize = AnalyzerOptimize(elf_path=elf_path,
                                compiler_path=compiler_path,
                                map_path=map_path,
                                stack_mode=stack_mode,
                                stack_rec_stats=stack_rec_stats)

        result = optimize.analysis(action)
    except Exception as ex:  # pylint: disable=broad-except
        click.secho(f"An error has been occured during {action} analysis", fg="red")
        result = -1

    return result

Import("env")

analysis_env = env  # noqa: F821  # pylint: disable=undefined-variable

analysis_env.AddMethod(StackAnalysis)
analysis_env.AddMethod(ImageAnalysis)
