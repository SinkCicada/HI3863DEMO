from os.path import join
import click
from SCons.Script import (Import, ARGUMENTS)
from SCons import Errors
from platformio.util import get_systype
import hb_adapter

Import("env")

builder_env = env  # noqa: F821
platform = builder_env.PioPlatform()
board = builder_env.BoardConfig()
framework_settings = board.get("frameworks").get('hb').get("build")
build_product = builder_env.subst("$BOARD_FRAMEWORKS_HB_BUILD_PRODUCT")
if not build_product:
    build_product = board.get("frameworks.hb.build.product", "")


def builder(target, source, env):
    if 'windows' in get_systype():
        raise Errors.BuildError(errstr='Can not build on windows')

    hb = hb_adapter.Hb(env.subst("$PROJECT_DIR"), stdout=None, stderr=None)
    build_type = env.GetBuildType()

    # always set hb root_path as $PROJECT_DIR
    hb.setting(root_path=env.subst("$PROJECT_DIR"))
    return 0 if hb.build(env.subst("$PROJECT_DIR"),
                        build_product,
                        build_type == 'debug') else -1

try:
    product_name, company = build_product.split('@')
except ValueError as ex:
    # pylint: disable=raise-missing-from
    raise Errors.BuildError(
            errstr=f"Please set 'board_frameworks.hb.build.product' in project options"
        )

builder_env.Append(BUILDERS=dict(HbBuilder=builder_env.Builder(
                        action=builder_env.Action(builder))))

builder_env.Replace(
    FRAMEWORK_BUILD_TARGET=join(framework_settings.get("board"),
                                product_name),
)


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


def cleaner(env):
    hb = hb_adapter.Hb(env.subst("$PROJECT_DIR"), stdout=None, stderr=None)
    if not hb.clean():
        raise Errors.BuildError(errstr="Hb clean failed")
    click.echo("Done hb cleaning")


builder_env.AddMethod(cleaner)
