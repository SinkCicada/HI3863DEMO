import os
from os.path import join, isabs
import subprocess
from SCons.Script import (Import, ARGUMENTS)
from SCons import Errors
from platformio.util import get_systype
import hb_adapter
import click
from shutil import rmtree

Import("env")

builder_env = env  # noqa: F821
platform = builder_env.PioPlatform()
board = builder_env.BoardConfig()
framework_settings = board.get("frameworks", {}).get("hb", {}).get("build", {})
output_bin = board.get("frameworks", {}).get("hb", {}).get("output_bin", {})
analysis_bin = board.get("frameworks", {}).get("hb", {}).get("analysis_bin", {})
build_product = board.get("frameworks.hb.build.product", "")
src_dir = os.path.join(builder_env.subst("$PROJECT_DIR"), 'src')

if board.get("name") in ['Hi3861']:
    framework_partition = board.get("upload", {}).get("framework_partition", {})
    output_bin = framework_partition.get(build_product, {}).get("output_bin", {}) or \
        framework_partition.get("hb", {}).get("output_bin", {})
    analysis_bin = framework_partition.get(build_product, {}).get("analysis_bin", {}) or \
        framework_partition.get("hb", {}).get("analysis_bin", {})

def builder(target, source, env):
    hb = hb_adapter.Hb(src_dir, stdout=None, stderr=None)
    build_type = env.GetBuildType()
    compiler_bin_path = env.subst("$COMPILER_BIN_PATH")

    if compiler_bin_path:
        if not isabs(compiler_bin_path):
            compiler_bin_path = join(env.subst("$PROJECT_DIR"), compiler_bin_path)
    else:
        click.secho("error:please set compiler bin path!", color = "red")
        return -1

    git_shell_path = os.path.join(compiler_bin_path, "thirdparty", "Git", "bin")
    python_path = os.path.join(compiler_bin_path, "thirdparty", "python38")
    python_scripts_path = os.path.join(compiler_bin_path, "thirdparty", "python38", "scripts")
    tool_chain_path = os.path.join(compiler_bin_path, "hcc_riscv32_win", "bin")
    os.environ['PATH'] =  os.pathsep.join([git_shell_path,python_path, python_scripts_path, tool_chain_path])

    cmd = [join(python_path, 'python.exe'), join(compiler_bin_path, 'env_set.py')]
    subprocess.run(cmd, cwd = compiler_bin_path)

    hb.setting(root_path=src_dir)
    return 0 if hb.build(src_dir,
                        build_product,
                        build_type == 'debug') else -1

try:
    product_name, company = build_product.split('@')
except ValueError as ex:
    raise Errors.BuildError(
            errstr=f"Please set 'board_frameworks.hb.build.product' in project options"
        )

builder_env.Append(BUILDERS=dict(HbBuilder=builder_env.Builder(
                        action=builder_env.Action(builder))))

builder_env.Replace(
    FRAMEWORK_BUILD_TARGET=join(framework_settings.get("board"),
                                product_name),
)

builder_env.Replace(**{f"UPLOAD_IMAGE_{k.upper()}_BIN": v for k, v in output_bin.items()})

if analysis_bin:
    builder_env.Replace(**{f"ANALYSIS_{k.upper()}_BIN": v for k, v in analysis_bin.items()})

builder_env.Replace(
    BUILD_OUT_DIR=join(src_dir, "out", 
                        builder_env.subst("${FRAMEWORK_BUILD_TARGET}"))
)

builder_env.Replace(
    BUILD_ELF_TARGET=join("$BUILD_OUT_DIR", builder_env.subst("${PROGNAME}")),
    PROG_PATH='$BUILD_ELF_TARGET',
)

program = builder_env.HbBuilder(['$BUILD_ELF_TARGET'], None)
builder_env.Replace(PIOMAINPROG=program)


def Cleaner(env):
    if os.path.isfile("./src/ohos_config.json"):
        hb = hb_adapter.Hb(src_dir, stdout=None, stderr=None)
        hb.clean()
        click.echo("removing ohos_config.json...")
        os.remove("./src/ohos_config.json")
    if os.path.isdir("./src/out"):
        click.echo("removing out...")
        rmtree("./src/out")
    click.echo("Done hb cleaning")

builder_env.AddMethod(Cleaner)
