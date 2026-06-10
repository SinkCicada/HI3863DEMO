import os
from os.path import join
from SCons.Script import (Import, ARGUMENTS)
from SCons import Errors
import hpm_adapter
from platformio.util import get_systype

Import("env")

builder_env = env  # noqa: F821  # pylint: disable=undefined-variable
platform = builder_env.PioPlatform()
board = builder_env.BoardConfig()
framework_settings = board.get("frameworks").get('hpm').get("build")
cpu = board.get("build").get("cpu")
output_bin = board.get("frameworks").get("hpm").get("output_bin")
analysis_bin = board.get("frameworks").get("hpm").get("analysis_bin", "")
mcu = board.get("build").get("mcu")


def builder(target, source, env):  # pylint: disable=unused-argument
    if 'windows' in get_systype() and cpu != 'risc-v':
        raise Errors.BuildError(errstr='Can not build on windows')

    verbose = bool(int(ARGUMENTS.get("PIOVERBOSE", 0)))
    installed = [k for k, v in hpm_adapter.Hpm(log=verbose).list(target=env.subst("$PROJECT_DIR")).items()]
    if env.GetProjectOption('hpm_project_base_package') and \
            env.GetProjectOption('hpm_project_base_package') not in installed:
        print('Installing base package...')
        hpm_adapter.Hpm(stdout=None, stderr=None, log=verbose).install(target=env.subst("$PROJECT_DIR"),
                                                          name=env.GetProjectOption('hpm_project_base_package'))
    build_type = builder_env.GetBuildType()
    return 0 if hpm_adapter.Hpm(stdout=None, stderr=None, log=verbose).\
                            dist(env.subst("$PROJECT_DIR"), build_type == 'debug') else -1


builder_env.Append(BUILDERS=dict(HpmBuilder=builder_env.Builder(action=builder_env.Action(builder))))

builder_env.Replace(
    FRAMEWORK_BUILD_TARGET=framework_settings.get("target"),
)

builder_env.Replace(**{f"UPLOAD_IMAGE_{k.upper()}_BIN": v for k, v in output_bin.items()})

if analysis_bin:
    builder_env.Replace(**{f"ANALYSIS_{k.upper()}_BIN": v for k, v in analysis_bin.items()})

builder_env.Replace(BUILD_OUT_DIR=os.path.join("$PROJECT_DIR", "out", "bin"))

builder_env.Replace(BUILD_ELF_TARGET=os.path.join("$BUILD_OUT_DIR", builder_env.subst("${PROGNAME}")),
                    PROG_PATH='$BUILD_ELF_TARGET')


program = builder_env.HpmBuilder(['$BUILD_ELF_TARGET'], None)
builder_env.Replace(PIOMAINPROG=program)


def Cleaner(env):
    verbose = bool(int(ARGUMENTS.get("PIOVERBOSE", 0)))
    if not hpm_adapter.Hpm(stdout=None, stderr=None, log=verbose).run(env.subst("$PROJECT_DIR"), "clean"):
        raise Errors.BuildError(errstr="hpm run clean failed") 
    print("Done hpm run clean")

builder_env.AddMethod(Cleaner)
