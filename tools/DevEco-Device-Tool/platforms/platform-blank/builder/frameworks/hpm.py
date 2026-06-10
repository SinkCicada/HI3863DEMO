import os
from SCons.Script import (Import, ARGUMENTS)
from SCons import Errors
import hpm_adapter
from platformio.util import get_systype

Import("env")

builder_env = env  # noqa: F821  # pylint: disable=undefined-variable
platform = builder_env.PioPlatform()
board = builder_env.BoardConfig()


def builder(target, source, env):  # pylint: disable=unused-argument
    if 'windows' in get_systype():
        raise Errors.BuildError(errstr='Can not build on windows')

    verbose = bool(int(ARGUMENTS.get("PIOVERBOSE", 0)))
    hpm = hpm_adapter.Hpm(stdout=None, stderr=None, log=verbose)
    #  there is no way to understand is it empty project or project is not exist using hpm-cli.
    #  `hpm list` command returns zero code in case of error and in case of empty project.
    #  So, currently we will check the bundle.jon file to understand the hpm project was inited.
    if not os.path.exists(os.path.join(env.subst("$PROJECT_DIR"), 'bundle.json')):
        # first run - need to init project
        if not env.GetProjectOption('hpm_project_template'):
            raise Exception('hpm_project_template is not defined for empty HPM project')

        hpm.init(dirname=env.subst("$PROJECT_DIR"), template=env.GetProjectOption('hpm_project_template'))
        if env.GetProjectOption('hpm_project_base_package'):
            hpm.install(target=env.subst("$PROJECT_DIR"), name=env.GetProjectOption('hpm_project_base_package'))

    build_type = builder_env.GetBuildType()
    return 0 if hpm.dist(env.subst("$PROJECT_DIR"), build_type == 'debug') else -1


builder_env.Append(BUILDERS=dict(HpmBuilder=builder_env.Builder(action=builder_env.Action(builder))))

out_dir = os.path.join("$PROJECT_DIR", "out")

builder_env.Replace(BUILD_OUT_DIR=out_dir)

builder_env.Replace(BUILD_BIN_TARGET=os.path.join("$BUILD_OUT_DIR",
                                                  builder_env.subst("${PROGNAME}.bin")),
                    BUILD_ELF_TARGET=os.path.join("$BUILD_OUT_DIR",
                                                  builder_env.subst("${PROGNAME}")),
                    PROG_PATH='$BUILD_ELF_TARGET')


program = builder_env.HpmBuilder(['$BUILD_ELF_TARGET'], None)
builder_env.Replace(PIOMAINPROG=program)
