import click
import os
import tarfile
import shutil
import zipfile
from urllib.request import urlopen
from SCons.Script import (Import)
from SCons import Errors
from platformio.util import read_url_json
from platformio.helpers import get_config_json_path


MAX_TOOL_SIZE = 100 * 1024**2


def download_srcfile(dst, req, name):
    try:
        flags = os.O_RDWR | os.O_CREAT | os.O_TRUNC
        with os.fdopen(os.open(dst, flags, 0o640), 'wb') as file:
            file.write(req.read())
            click.echo(f'Download {name} succeeded')
    except OSError as e:
        raise Errors.BuildError(errstr=f'{name} download failed!') from e


def download_tool(url, dst, name):
    try:
        req = urlopen(url, timeout=5)
    except OSError as e:
        raise Errors.BuildError(errstr=f'Download {name} timeout!') from e

    req_code = req.getcode()
    if req_code == 200:
        click.echo(f'Downloading {name} ...')
        download_size = req.headers['Content-Length']
        if int(download_size) > MAX_TOOL_SIZE:
            raise Errors.BuildError(errstr='The size of tool exceeds the limit.')
        download_srcfile(dst, req, name)
    else:
        raise Errors.BuildError(errstr=f'Downloading {name} failed with code: {req_code}!')


def untar(file_name):
    '''
    Function description: Decompress the tar or tar.gz file.
    '''

    head, tail = os.path.split(file_name)
    cur_path = os.path.join(head, tail.split('.')[0])
    if os.path.exists(cur_path):
        return
    try:
        with tarfile.open(file_name) as tar:
            tar.extractall(os.path.dirname(cur_path))
    except Exception as e:
        click.secho(f'The file {file_name} is damaged,please rebuild!', fg='yellow')
        if os.path.exists(file_name):
            os.remove(file_name)
        if os.path.exists(cur_path):
            shutil.rmtree(cur_path)    


def unzip(file_name):
    '''
    Function description: Decompress the zip file.
    '''

    max_size = 1 * 1024 * 1024 * 500
    cur_size = 0

    with zipfile.ZipFile(file_name) as zip_file:
        head, tail = os.path.split(file_name)
        file_name = os.path.join(head, tail.split('.')[0])

        if not os.path.isdir(file_name):
            os.mkdir(file_name)

        for names in zip_file.infolist():
            cur_size += names.file_size
            if cur_size > max_size:
                break
            zip_file.extract(names.filename, file_name)


def un_alltools(file_name):
    '''
    Function description: Decompress all compilation tools.
    '''
    if len(str(file_name)) > 120:
        print('Error!!!! The file path string is too long(120): ', file_name)
        return

    for word in file_name:
        if '.' in word:
            suffix = file_name.split('.')[-1]
            if suffix in ('gz', 'tar'):
                untar(file_name)
            elif suffix == 'zip':
                unzip(file_name)
            break


def config_toolchain(tool_path):
    del_list = [f for f in os.listdir(tool_path)]
    for f in del_list:
        file_path = os.path.join(tool_path, f)
        if os.path.isdir(file_path):
            shutil.rmtree(file_path)

    hssclient_tar_gz_path = os.path.join(tool_path, 'hssclient.tar.gz')
    un_alltools(hssclient_tar_gz_path)

    tool_burncli_tar_gz_path = os.path.join(tool_path, 'tool_burncli.tar.gz')
    un_alltools(tool_burncli_tar_gz_path)

    hw_openocd_tar_gz_path = os.path.join(tool_path, 'hw_openocd.tar.gz')
    un_alltools(hw_openocd_tar_gz_path)


def check_toolchain(tool_path):
    path = [os.path.join(tool_path, 'hw_openocd', 'bin', 'openocd.exe'),
            os.path.join(tool_path, 'hssclient',  'readelf_variables.exe'),
            os.path.join(tool_path, 'tool_burncli', 'burntoolcli.jar')
            ]
    if not all([os.path.exists(p) for p in path]):
        config_toolchain(tool_path)
    return

def DownloadTools(environ, target, source, env):
    chip_package_path = env.subst('$CHIP_PACKAGE_PATH')
    target_path = os.path.join(get_config_json_path(), 'compiler_tool_chain', 'Windows')
    ide_target_path = os.path.abspath(os.path.join(chip_package_path, '..', 'IDE'))
    os.makedirs(os.path.realpath(ide_target_path), exist_ok=True)
    os.makedirs(os.path.realpath(target_path), exist_ok=True)

    info_list = [{'list_key': 'gn_win_zip', 'package_name': 'gn-win.zip',
                  'tool_name': 'gn', 'target_path': target_path},
                 {'list_key': 'ninja_win_zip', 'package_name': 'ninja-win.zip',
                  'tool_name': 'ninja', 'target_path': target_path},
                 {'list_key': 'cc_riscv32_win_env_tar_gz', 'package_name': 'cc_riscv32_win_env.tar.gz',
                  'tool_name': 'cc_riscv32_win_env', 'target_path': target_path},
                 {'list_key': 'cc_riscv32_musl_win_tar_gz', 'package_name': 'cc_riscv32_musl_win.tar.gz',
                  'tool_name': 'cc_riscv32_musl_win', 'target_path': target_path},
                 {'list_key': 'cc_riscv32_musl_fp_win_tar_gz', 'package_name': 'cc_riscv32_musl_fp_win.tar.gz',
                  'tool_name': 'cc_riscv32_musl_fp_win', 'target_path': target_path},
                 {'list_key': 'hssclient_tar_gz', 'package_name': 'hssclient.tar.gz',
                  'tool_name': 'hssclient', 'target_path': ide_target_path},
                 {'list_key': 'hw_openocd_tar_gz', 'package_name': 'hw_openocd.tar.gz',
                  'tool_name': 'hw_openocd', 'target_path': ide_target_path},
                 {'list_key': 'tool_burncli_tar_gz', 'package_name': 'tool_burncli.tar.gz',
                  'tool_name': 'tool_burncli', 'target_path': ide_target_path}]

    url_list = read_url_json()
    for info in info_list:
        path = os.path.join(info['target_path'], info['package_name'])
        if not os.path.exists(path):
            download_tool(url_list.get(info['list_key']), path, info['tool_name'])

    check_toolchain(ide_target_path)


Import('env')
download_env = env  # pylint: disable=undefined-variable
download_env.AddMethod(DownloadTools)
