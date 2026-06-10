import os
from os.path import join
from SCons.Script import Import
from SCons import Errors
from platformio.util import get_systype

Import("env")

builder_env = env  # noqa: F821 # pylint: disable=undefined-variable

platform = builder_env.PioPlatform()
board = builder_env.BoardConfig()


def message(target, source, env):  # pylint: disable=unused-argument
    # pylint: disable=unreachable
    if 'windows' in get_systype():
        return "warning: can't build on windows"

    raise Errors.BuildError(errstr="Default build command is not supported for platform:"
                        f"{board.get('platforms', [])}"
                        f" Please set 'custom_build_command' in project options")


def builder(target, source, env):  # pylint: disable=unused-argument
    # pylint: disable=unreachable
    if 'windows' in get_systype():
        raise Errors.BuildError(errstr='Can not build on windows')

    raise Errors.BuildError(errstr="Default build command is not supported for platform:"
                        f"{board.get('platforms', [])}"
                        f" Please set 'custom_build_command' in project options")


builder_env.Append(BUILDERS=dict(RepoBuilder=builder_env.Builder(
    action=builder_env.Action(builder, message))))

out_dir = os.path.join("$PROJECT_DIR", "out")

builder_env.Replace(BUILD_OUT_DIR=out_dir)


builder_env.Replace(
    BUILD_BIN_TARGET=os.path.join("$BUILD_OUT_DIR", builder_env.subst("${PROGNAME}.bin")),
    BUILD_ELF_TARGET=join("$BUILD_OUT_DIR", builder_env.subst("${PROGNAME}")),
    PROG_PATH='$BUILD_ELF_TARGET',
)

program = builder_env.RepoBuilder(['$BUILD_ELF_TARGET'], None)
builder_env.Replace(PIOMAINPROG=program)

