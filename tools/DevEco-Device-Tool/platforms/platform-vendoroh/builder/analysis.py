from os.path import join, isfile, abspath
import os
import click
from liteos_optimize_adapter import AnalyzerOptimize
from SCons.Script import (Import)
from SCons import Errors


def StackAnalysis(environ, target, source, env):
    return analysis_cmd(environ, target, source, env, "stack")


def ImageAnalysis(environ, target, source, env):
    return analysis_cmd(environ, target, source, env, "build")


def analysis_cmd(environ, target, source, env, action):
    # pylint: disable=unused-argument, too-many-locals, too-many-branches
    analyzer_file = 'funcstack.json' if action == "stack" else 'memoryDetails.json'
    analyzer_path = join(env.subst("$PROJECT_DIR"), 'analyzerJson', analyzer_file)
    if isfile(analyzer_path):
        os.remove(analyzer_path)

    compiler_path = env.subst("$ANALYSIS_COMPILER_PATH")
    if not compiler_path and env.subst("$COMPILER_BIN_PATH"):
        compiler_path = os.path.join(env.subst("$COMPILER_BIN_PATH"), "hcc_riscv32_win", "bin")
    if not os.path.exists(compiler_path):
        raise Errors.BuildError(errstr=f"Package gcc_riscv32 is not found."
                                f"Please, configure analysis_compiler_path")

    elf_path = abspath(env.subst("$ANALYSIS_ELF_PATH") or env.subst(join("$PROJECT_DIR", "$ANALYSIS_ELF_BIN")))
    if not isfile(elf_path):
        raise Errors.BuildError(errstr=f"Elf file not found: {elf_path}")

    map_path = None
    if action == "build":
        map_path = abspath(env.subst("$ANALYSIS_MAP_PATH") or env.subst(join("$PROJECT_DIR", "$ANALYSIS_MAP_BIN")))
        if not isfile(map_path):
            raise Errors.BuildError(errstr=f"Map file not found: {map_path}")

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
