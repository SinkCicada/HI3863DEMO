import os
from os.path import (join, isdir, isfile)
from SCons.Script import (Import, ARGUMENTS)
from SCons import Errors
import hpm_adapter
import hb_adapter
import click
import shutil
from platformio.util import get_systype
from platformio import proc

Import("env")

builder_env = env  # noqa: F821  # pylint: disable=undefined-variable
platform = builder_env.PioPlatform()
board = builder_env.BoardConfig()
framework_settings = board.get("frameworks").get('hpm').get("build")
bundle = builder_env.GetProjectOption("hpm_project_base_package", '')
output_bin = board.get("upload").get("framework_partition", {}).get(bundle, {}).get("output_bin", {})


def _echo_stdout_line(line):
    click.secho(line, fg=None, nl=False)


def builder(target, source, env):  # pylint: disable=unused-argument
    if 'windows' in get_systype():
        raise Errors.BuildError(errstr='Can not build on windows')

    verbose = bool(int(ARGUMENTS.get("PIOVERBOSE", 0)))
    installed = [k for k, v in hpm_adapter.Hpm(log=verbose).list(target=env.subst("$PROJECT_DIR")).items()]
    if env.GetProjectOption('hpm_project_base_package') and \
            env.GetProjectOption('hpm_project_base_package') not in installed:
        print('Installing base package...')
        hpm_adapter.Hpm(stdout=None, stderr=None, log=verbose).install(target=env.subst("$PROJECT_DIR"),
                                                          name=env.GetProjectOption('hpm_project_base_package'))
    build_type = builder_env.GetBuildType()
    return 0 if hpm_adapter.Hpm(stdout=proc.skipWarningBufferedAsyncPipe(line_callback=_echo_stdout_line),
                                stderr=None, log=verbose).\
                            dist(env.subst("$PROJECT_DIR"), build_type == 'debug') else -1


builder_env.Append(BUILDERS=dict(HpmBuilder=builder_env.Builder(action=builder_env.Action(builder))))

builder_env.Replace(
    FRAMEWORK_BUILD_TARGET=framework_settings.get("target"),
)

builder_env.Replace(**{f"UPLOAD_IMAGE_{k.upper()}_BIN": v for k, v in output_bin.items()})

builder_env.Replace(BUILD_OUT_DIR=os.path.join("$PROJECT_DIR",
                                               "out",
                                               framework_settings.get("target")))

builder_env.Replace(BUILD_ELF_TARGET=os.path.join("$BUILD_OUT_DIR",
                                                  builder_env.subst("${PROGNAME}")),
                    PROG_PATH='$BUILD_ELF_TARGET')


program = builder_env.HpmBuilder(['$BUILD_ELF_TARGET'], None)
builder_env.Replace(PIOMAINPROG=program)


def Cleaner(env):
    gn_path = join(env.subst("$PROJECT_DIR"), "ohos_bundles", "@ohos", "gn")
    clang_path = join(env.subst("$PROJECT_DIR"), "ohos_bundles", "@ohos", "llvm", "llvm", "bin")
    builder_env.PrependENVPath("PATH", gn_path)
    builder_env.PrependENVPath("PATH", clang_path)
    hb = hb_adapter.Hb(env.subst("$PROJECT_DIR"), stdout=None, stderr=None)
    build_out_dir = env.subst("$BUILD_OUT_DIR")
    out_dir = join(env.subst("$PROJECT_DIR"), "out")
    ohos_config = join(env.subst("$PROJECT_DIR"), "ohos_config.json")
    if not isfile(ohos_config) or not hb.clean():
        if isdir(build_out_dir):
            shutil.rmtree(build_out_dir, ignore_errors=True)
            click.echo(f'Removed {build_out_dir}')
        elif isdir(out_dir):
            shutil.rmtree(out_dir, ignore_errors=True)
            click.echo(f'Removed {out_dir}')
    click.echo("Done clean")

builder_env.AddMethod(Cleaner)
