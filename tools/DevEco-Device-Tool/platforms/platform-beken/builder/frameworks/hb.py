from os.path import join
from SCons.Script import (Import)
from SCons import Errors
from platformio.util import get_systype
import hb_adapter

Import("env")

builder_env = env  # noqa: F821
platform = builder_env.PioPlatform()
board = builder_env.BoardConfig()
build_product = board.get("frameworks.hb.build.product", "")
output_bin = board.get("upload", {}).get("framework_partition", {}).get(build_product, {}).get("output_bin", {})


def builder(target, source, env): # pylint: disable=unused-argument
    if 'windows' in get_systype():
        raise Errors.BuildError(errstr='Can not build on windows')

    hb = hb_adapter.Hb(env.subst("$PROJECT_DIR"), stdout=None, stderr=None)
    build_type = env.GetBuildType()

    hb.setting(root_path=env.subst("$PROJECT_DIR"))
    return 0 if hb.build(env.subst("$PROJECT_DIR"),
                        build_product,
                        build_type == 'debug',
                        True) else -1

try:
    product_name, company = build_product.split('@')
except ValueError as ex:
    raise Errors.BuildError(
            errstr=f"Please set 'board_frameworks.hb.build.product' in project options"
        )

builder_env.Append(BUILDERS=dict(HbBuilder=builder_env.Builder(
                        action=builder_env.Action(builder))))

builder_env.Replace(
    FRAMEWORK_BUILD_TARGET=join(board.get("frameworks").get("hb").get("build").get("board"), product_name),
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
    env.HbClean(build_product, env.subst("$BUILD_OUT_DIR"))

builder_env.AddMethod(Cleaner)
