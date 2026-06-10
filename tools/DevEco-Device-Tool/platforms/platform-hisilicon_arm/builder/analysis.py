from os.path import join, isfile, isdir, abspath, exists
import os
import re
import json
import click
from liteos_optimize_adapter import AnalyzerOptimize
from SCons.Script import (Import)
from SCons import Errors


def PerfAnalysis(environ, target, source, env):
    return analysis_cmd(environ, target, source, env, "perf")


def get_compiler_path(env):
    compiler_path = ''
    board_config = env.BoardConfig()
    if 'hpm' in env.get("PIOFRAMEWORK", []):
        llvm_clang_path = board_config.get('frameworks', {}).get('hpm', {}).get('llvm_clang_path', '')
        hpm_clang_dir = env.subst(join("$PROJECT_DIR", llvm_clang_path))
        compiler_path = hpm_clang_dir if exists(hpm_clang_dir) else env.subst("$ANALYSIS_COMPILER_PATH")

        if not compiler_path:
            raise Errors.BuildError(errstr=f"Package llvm is not found."
                                    f"Please, configure analysis_compiler_path")

    else:
        ohos_version = env.subst("$OHOS_VERSION")
        if ohos_version.startswith('3'):
            llvm_clang_path = board_config.get('frameworks', {}).get('hb', {}).get('llvm_clang_path', '')
            hb_clang_dir = env.subst(join("$PROJECT_DIR", llvm_clang_path))
            compiler_path = hb_clang_dir if exists(hb_clang_dir) else env.subst("$ANALYSIS_COMPILER_PATH")

            if not compiler_path:
                raise Errors.BuildError(errstr=f"Package llvm is not found."
                                        f"Please, configure analysis_compiler_path")
        else:
            product = env.subst("$BOARD_FRAMEWORKS_HB_BUILD_PRODUCT")
            if ohos_version and product:
                status_path = join(env.subst("$PROJECT_DIR"), '.deveco', 'status', f'{re.sub("[@/]", ".", product)}')
                if isfile(status_path):
                    tool_status = json.load(open(status_path, 'r'))
                    clang_tool = tool_status.get('tools', {}).get('compiler', {}).get('clang', {})
                    if clang_tool.get('valid', False):
                        compiler_path = clang_tool.get('dest', '')

            if not compiler_path:
                raise Errors.BuildError(errstr=f"Package llvm  is not found."
                                    f"Please, configure 'llvm' on 'toolchain' page")

    return compiler_path


def analysis_cmd(environ, target, source, env, action):
    # pylint: disable=unused-argument, too-many-locals, too-many-branches
    analyzer_file = 'perf.json'
    analyzer_path = join(env.subst("$PROJECT_DIR"), 'analyzerJson', analyzer_file)
    if isfile(analyzer_path):
        os.remove(analyzer_path)

    compiler_path = get_compiler_path(env)

    perf_path = abspath(env.subst("$ANALYSIS_PERF_PATH"))
    if not isfile(perf_path):
        raise Errors.BuildError(errstr=f"Perf data file not found: {perf_path}. "
                                f"Please, configure analysis_perf_path")
    elif not perf_path.endswith(".data"):
        raise Errors.BuildError(errstr=f"The Perf data file type not support: {perf_path}. "
                                f"Please, reconfigure analysis_perf_path")

    if not env.subst("$ANALYSIS_ELF_BIN") and not env.subst("$ANALYSIS_ELF_PATH"):
        raise Errors.BuildError(errstr=f"Please config option: analysis_elf_path in project settings")

    elf_path = abspath(env.subst("$ANALYSIS_ELF_PATH") or env.subst(join("$PROJECT_DIR", "$ANALYSIS_ELF_BIN")))
    if not isfile(elf_path):
        raise Errors.BuildError(errstr=f"Elf file not found: {elf_path}")

    rootfs_path = abspath(env.subst("$ANALYSIS_ROOTFS_PATH") or env.subst(join("$PROJECT_DIR", "$ANALYSIS_ROOTFS_DIR")))
    if not isdir(rootfs_path):
        raise Errors.BuildError(errstr=f"rootfs directory not found: {rootfs_path}")

    result = -1

    try:
        optimize = AnalyzerOptimize(elf_path=elf_path,
                                compiler_path=compiler_path,
                                perf_path=perf_path,
                                rootfs_path=rootfs_path)

        result = optimize.analysis(action)
    except Exception as ex:  # pylint: disable=broad-except
        click.secho(f"An error has been occured during {action} analysis", fg="red")
        result = -1

    return result


Import("env")

analysis_env = env  # noqa: F821  # pylint: disable=undefined-variable

analysis_env.AddMethod(PerfAnalysis)
