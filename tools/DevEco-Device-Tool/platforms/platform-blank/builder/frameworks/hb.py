import os
import json
import click
from os.path import (join, isfile, realpath)
from SCons.Script import (Import)
from SCons import Errors
import hb_adapter

Import("env")

builder_env = env  # pylint: disable=undefined-variable
platform = builder_env.PioPlatform()
build_product = builder_env.BoardConfig().get("frameworks.hb.build.product", "")


def need_patch(env, product_name, vendor):
    patch_file = join(env.subst("$PROJECT_DIR"), 'vendor', vendor, product_name, 'patch.yml')
    ohos_config_file = join(env.subst("$PROJECT_DIR"), 'ohos_config.json')
    if isfile(patch_file):
        if isfile(ohos_config_file):
            try:
                content = json.load(open(ohos_config_file, 'r'))
            except json.JSONDecodeError:
                return True
            patch_cache = content.get('patch_cache')
            if not patch_cache or realpath(patch_cache) != realpath(patch_file):
                return True
        else:
            return True
    return False


def builder(target, source, env):  # pylint: disable=unused-argument
    hb = hb_adapter.Hb(env.subst("$PROJECT_DIR"), stdout=None, stderr=None)
    build_type = env.GetBuildType()
    try:
        product_name, vendor = build_product.split('@')
    except ValueError as ex:
        raise Errors.BuildError(
                errstr=f"Please set 'board_frameworks.hb.build.product' in project options"
            )
    # always set hb root_path as $PROJECT_DIR
    hb.setting(root_path=env.subst("$PROJECT_DIR"))
    return 0 if hb.build(env.subst("$PROJECT_DIR"),
                        build_product,
                        build_type == 'debug',
                        patch=need_patch(env, product_name, vendor)) else -1


builder_env.Append(BUILDERS=dict(HbBuilder=builder_env.Builder(
                        action=builder_env.Action(builder))))

out_dir = os.path.join("$PROJECT_DIR", "out")

builder_env.Replace(BUILD_OUT_DIR=out_dir)

builder_env.Replace(
    BUILD_BIN_TARGET=os.path.join("$BUILD_OUT_DIR", builder_env.subst("${PROGNAME}.bin")),
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