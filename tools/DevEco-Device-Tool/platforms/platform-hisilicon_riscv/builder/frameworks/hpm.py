import os
from os.path import (join, dirname, isdir, isfile)
import click
import shutil
from SCons.Script import (Import, ARGUMENTS)
from SCons import Errors
import hpm_adapter
import hb_adapter

Import("env")

builder_env = env  # noqa: F821  # pylint: disable=undefined-variable
platform = builder_env.PioPlatform()
board = builder_env.BoardConfig()
framework_settings = board.get("frameworks").get('hpm').get("build")
output_bin = board.get("frameworks").get("hpm").get("output_bin", {})
analysis_bin = board.get("frameworks").get("hpm").get("analysis_bin", {})
if board.get("name") in ['BearPi-HM Nano', 'Hi3861']:
    bundle = builder_env.GetProjectOption("hpm_project_base_package", '')
    bundle_partition = board.get("upload").get("framework_partition").get(bundle, {})
    output_bin = bundle_partition.get("output_bin", {}) or output_bin
    analysis_bin = bundle_partition.get("analysis_bin", {}) or analysis_bin

mcu = board.get("build", {}).get("mcu", "")


def builder(target, source, env):  # pylint: disable=unused-argument
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

target_dir = dirname(output_bin.get(list(output_bin)[0], 'out')) \
    if output_bin else framework_settings.get("target")

builder_env.Replace(
    FRAMEWORK_BUILD_TARGET=target_dir,
)

builder_env.Replace(**{f"UPLOAD_IMAGE_{k.upper()}_BIN": v for k, v in output_bin.items()})

if analysis_bin:
    builder_env.Replace(**{f"ANALYSIS_{k.upper()}_BIN": v for k, v in analysis_bin.items()})

builder_env.Replace(BUILD_OUT_DIR=os.path.join("$PROJECT_DIR", target_dir))

builder_env.Replace(BUILD_ELF_TARGET=os.path.join("$BUILD_OUT_DIR",
                                                  builder_env.subst("${PROGNAME}")),
                    PROG_PATH='$BUILD_ELF_TARGET')


program = builder_env.HpmBuilder(['$BUILD_ELF_TARGET'], None)
builder_env.Replace(PIOMAINPROG=program)


def Cleaner(env):
    support_hpm_clean = ["Hi3061H", "Hi3061L", "Hi3065H"]
    if mcu in support_hpm_clean:
        verbose = bool(int(ARGUMENTS.get("PIOVERBOSE", 0)))
        if not hpm_adapter.Hpm(stdout=None, stderr=None, log=verbose).run(env.subst("$PROJECT_DIR"), "clean"):
            raise Errors.BuildError(errstr="hpm run clean failed") 
        click.echo("Done hpm run clean")
    else:
        gn_path = join(env.subst("$PROJECT_DIR"), "ohos_bundles", "@ohos", "gn")
        builder_env.PrependENVPath("PATH", gn_path)
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
