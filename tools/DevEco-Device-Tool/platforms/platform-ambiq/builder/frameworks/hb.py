from os.path import join
from SCons.Script import (Import)
from SCons import Errors
import hb_adapter
import click

Import("env")

builder_env = env  # pylint: disable=undefined-variable
platform = builder_env.PioPlatform()
board = builder_env.BoardConfig()
framework_settings = board.get("frameworks").get("hb").get("build")
output_bin = board.get("frameworks").get("hb").get("output_bin")
build_product = board.get("frameworks.hb.build.product", "")


def builder(target, source, env):  # pylint: disable=unused-argument
    hb = hb_adapter.Hb(env.subst("$PROJECT_DIR"), stdout=None, stderr=None)
    build_type = env.GetBuildType()

    hb.setting(root_path=env.subst("$PROJECT_DIR"))
    return 0 if hb.build(env.subst("$PROJECT_DIR"),
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

builder_env.Replace(
    BUILD_OUT_DIR=join("$PROJECT_DIR", "out", 
                        builder_env.subst("${FRAMEWORK_BUILD_TARGET}"))
)

builder_env.Replace(
    BUILD_ELF_TARGET=join("$BUILD_OUT_DIR", builder_env.subst("${PROGNAME}")),
    PROG_PATH='$BUILD_ELF_TARGET',
)

program = builder_env.HbBuilder(['$BUILD_ELF_TARGET'], None)
builder_env.Replace(PIOMAINPROG=program)


def Cleaner(env):
    if (env.subst("$MAKE_CMD_CUSTOM") or env.subst("$BUILD_CMD_CUSTOM")) \
        and not env.subst("$CLEAN_CMD_CUSTOM"):
        click.secho("Please configure custom_clean_command in project settings", fg="yellow")
        raise Errors.BuildError(errstr="")

    env.HbClean(build_product, env.subst("$BUILD_OUT_DIR"))

builder_env.AddMethod(Cleaner)
