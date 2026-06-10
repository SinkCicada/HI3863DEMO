import os
from os.path import join
from SCons.Script import (Import, ARGUMENTS)
from SCons import Errors
import hpm_adapter
import click
from platformio.util import get_systype
from platformio import proc

Import("env")

builder_env = env  # noqa: F821  # pylint: disable=undefined-variable
platform = builder_env.PioPlatform()
board = builder_env.BoardConfig()
framework_settings = board.get("frameworks").get('hpm').get("build")
bundle = builder_env.GetProjectOption("hpm_project_base_package", '')


def _echo_stdout_line(line):
    click.secho(line, fg=None, nl=False)


def builder(target, source, env):  # pylint: disable=unused-argument
    if 'windows' in get_systype():
        raise Errors.BuildError(errstr='Can not build on windows')

    verbose = bool(int(ARGUMENTS.get("PIOVERBOSE", 0)))
    build_type = builder_env.GetBuildType()
    return 0 if hpm_adapter.Hpm(stdout=proc.skipWarningBufferedAsyncPipe(line_callback=_echo_stdout_line),
                                stderr=None, log=verbose).\
                            dist(env.subst("$PROJECT_DIR"), build_type == 'debug') else -1


builder_env.Append(BUILDERS=dict(HpmBuilder=builder_env.Builder(action=builder_env.Action(builder))))

builder_env.Replace(
    FRAMEWORK_BUILD_TARGET=framework_settings.get("target"),
)

builder_env.Replace(BUILD_OUT_DIR=os.path.join("$PROJECT_DIR",
                                               "out",
                                               framework_settings.get("target")))

builder_env.Replace(BUILD_ELF_TARGET=os.path.join("$BUILD_OUT_DIR",
                                                  builder_env.subst("${PROGNAME}")),
                    PROG_PATH='$BUILD_ELF_TARGET')


program = builder_env.HpmBuilder(['$BUILD_ELF_TARGET'], None)
builder_env.Replace(PIOMAINPROG=program)
