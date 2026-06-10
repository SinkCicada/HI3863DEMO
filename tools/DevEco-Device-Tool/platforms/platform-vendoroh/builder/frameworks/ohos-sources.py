import os
from os.path import join
import subprocess
from SCons.Script import Import
from SCons import Errors
from platformio.util import get_systype

Import("env")

builder_env = env  # noqa: F821  # pylint: disable=undefined-variable

platform = builder_env.PioPlatform()
board = builder_env.BoardConfig()
framework_settings = board.get("frameworks").get('ohos-sources').get("build")
output_bin = board.get("frameworks").get("ohos-sources").get("output_bin", {})


def message(target, source, env):  # pylint: disable=unused-argument
    if "linux" in get_systype():
        return "warning: can't build on linux"
    fullcmd = [os.path.join(env.subst("$PROJECT_DIR"), "scons.cmd")]
    cwd = env.subst("$PROJECT_DIR")
    return 'cd ' + cwd + ' && ' + ' '.join(fullcmd)


def builder(target, source, env):  # pylint: disable=unused-argument,unreachable
    if "linux" in get_systype():
        raise Errors.BuildError(errstr='Can not build on linux')
    fullcmd = [os.path.join(env.subst("$PROJECT_DIR"), "scons.cmd")]
    cp = subprocess.run(fullcmd, cwd=env.subst("$PROJECT_DIR"))
    return cp.returncode


def Cleaner(env):
    fullcmd = [os.path.join(env.subst("$PROJECT_DIR"), "scons.cmd")] + ["target=all", "-c"]
    cp = subprocess.run(fullcmd, cwd=env.subst("$PROJECT_DIR"))
    return cp.returncode


builder_env.AddMethod(Cleaner)

builder_env.Append(BUILDERS=dict(RepoBuilder=builder_env.Builder(
    action=builder_env.Action(builder, message))))

builder_env.Replace(
    FRAMEWORK_BUILD_TARGET=framework_settings.get("target"),
)

builder_env.Replace(**{f"UPLOAD_IMAGE_{k.upper()}_BIN": v for k, v in output_bin.items()})

builder_env.Replace(BUILD_OUT_DIR=join("$PROJECT_DIR", framework_settings.get("target")))

builder_env.Replace(
    BUILD_ELF_TARGET=join("$BUILD_OUT_DIR", builder_env.subst("${PROGNAME}")),
    PROG_PATH='$BUILD_ELF_TARGET',
)

program = builder_env.RepoBuilder(['$BUILD_ELF_TARGET'], None)
builder_env.Replace(PIOMAINPROG=program)
