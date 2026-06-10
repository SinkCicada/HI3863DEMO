import argparse
import os
import stat
import sys
import subprocess
import json
import hashlib
import re
import shutil
import tarfile
import tempfile

HELP_LINK = 'https://developer.huawei.com/consumer/cn/forum/topic/0203380024404140371?fid=0103702273237520029'
MAX_TOOL_SIZE = 10 * 1024**3
SPLIT_LINE_LENGTH = 50


class DevEcoException(Exception):
    pass


def check_file_sha256(src_path, sha_path):
    if not os.path.isfile(src_path) or not os.path.isfile(sha_path):
        return False
    with open(src_path, 'rb') as src_file:
        sha256 = hashlib.sha256()
        sha256.update(src_file.read())
        cal_value = sha256.hexdigest()
    with open(sha_path, 'r') as sha_file:
        hsh_value = sha_file.readline().strip()
    return cal_value == hsh_value


def check_upload_file_sha256(src_path, hsh_value):
    if not os.path.isfile(src_path):
        return False
    with open(src_path, 'rb') as src_file:
        sha256 = hashlib.sha256()
        sha256.update(src_file.read())
        cal_value = sha256.hexdigest()
    return cal_value == hsh_value


def download_tool(url, dst, tgt_dir=None):
    import requests
    try:
        res = requests.get(url, stream=True, timeout=(5, 9))
    except OSError as e:
        raise DevEcoException(f'Download {url} timeout!') from e

    if res.status_code == 200:
        print(f'Downloading {url} ...')
    else:
        raise DevEcoException(f'Downloading {url} failed with code: {res.status_code}!')

    total_size = int(res.headers['content-length'])
    download_size = 0
    download_percent = 0

    try:
        flags = os.O_RDWR | os.O_CREAT | os.O_TRUNC
        with os.fdopen(os.open(dst, flags, 0o640), "wb") as f:
            download_srcfile(res, f, download_size, download_percent, total_size)
            print('Download complete!')
    except PermissionError as e:
        raise DevEcoException(f'Permission denied: failed to write directory: {os.path.dirname(dst)}\n') from e
    except OSError as e:
        raise DevEcoException(f'{url} download failed, please install it manually!') from e


def download_srcfile(res, f, download_size, download_percent, total_size):
    if total_size == 0:
        raise DevEcoException("Can't divide by zero!")
    for chunk in res.iter_content(chunk_size=1024):
        if chunk:
            f.write(chunk)
            if download_size > MAX_TOOL_SIZE:
                raise DevEcoException('The size of tool exceeds the limit.')
            download_size += len(chunk)
            download_percent = round(
                float(download_size / total_size * 100), 2)
            print('Progress: %s%%\r' % download_percent, end=' ')


def install_requests():
    cp = subprocess.run([sys.executable, '-m', 'pip', 'show', 'requests'],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=10)
    if cp.returncode != 0:
        subprocess.run([sys.executable, '-m', 'pip', 'install', '--user', 'requests'],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=10)


def upload_tools_handle(tool, upload_tools, error_messages, upload_invalid_tools):
    if upload_tools.get(tool, {}).get('custom'):
        error_messages.append(
            f"\033[1;31m[Error] {tool} custom path is Invalid \033[0m")
    elif upload_tools.get(tool, {}).get('url') and upload_tools.get(tool, {}).get('store'):
        upload_tools.get(tool).update({'name': tool})
        upload_invalid_tools.append(upload_tools.get(tool))
    else:
        error_messages.append(
            f"\033[1;34m[Info] {tool} is not supported install, Please manually configure \033[0m")


def download_deb_packages(tool_status):
    # download deb packages
    deb_tools = tool_status.get('tools', {}).get('deb', {})
    deb_invalid_tools = [
        f'{tool}{deb_tools.get(tool, {}).get("version", "")}' \
            for tool in deb_tools if not deb_tools.get(tool, {}).get('valid')
    ]
    for tool in deb_invalid_tools:
        print('=' * SPLIT_LINE_LENGTH  + f'\nDownload deb package: {tool}\n' + '-' * SPLIT_LINE_LENGTH)
        cp = subprocess.run(['sudo', 'apt', 'install', tool, '-y'])
        print(f'exit code: {cp.returncode}')
        print('-' * SPLIT_LINE_LENGTH)


def download_pip_packages(tool_status):
    # download pip packages
    pip_tools = tool_status.get('tools', {}).get('pip', {})
    pip_invalid_tools = [
        f'{tool}{pip_tools.get(tool, {}).get("version", "")}' \
            for tool in pip_tools if not pip_tools.get(tool, {}).get('valid')
    ]
    for tool in pip_invalid_tools:
        print('=' * SPLIT_LINE_LENGTH + f'\nDownload pip package: {tool}\n' + '-' * SPLIT_LINE_LENGTH)
        cp = subprocess.run([sys.executable, '-m', 'pip', 'install', '--user', tool])
        print(f'exit code: {cp.returncode}')
        print('-' * SPLIT_LINE_LENGTH)


def show_download_header(tool):
    print(f'\033[34mDownloading: {tool.get("name")}\033[0m')


def download_prebuilt(tool, dest_file, dest_sha_file, storage_path):
    show_download_header(tool)
    download_tool(tool.get('url'), dest_file)
    download_tool(tool.get('url') + '.sha256', dest_sha_file)
    res = check_file_sha256(dest_file, dest_sha_file)
    print(f'Check Sha256 Ok?  {"Yes" if res else "No"} \n')
    print(f"Install: {tool.get('install_command')}")
    command_line = tool.get('install_command', '')
    ret_code = 0
    for cmd in command_line.split('&&'):
        cmd_parts = [x for x in cmd.split(' ') if x]
        cp = subprocess.run(cmd_parts, cwd=storage_path)
        ret_code = cp.returncode
        if ret_code != 0:
            break
    print(f'exit code: {ret_code}')


def chmod_recursively(path):
    # The executable and modifiable permission of the file in the path is originally correct.
    # This function is tightened to meet security requirements.
    for root, dirs, files in os.walk(path):
        for f in files:
            name = os.path.join(root, f)
            if not os.path.islink(name):
                permission_group = {
                    'd_stat': 0o550,
                    'f_stat': 0o640,
                }
                st = permission_group.get('d_stat') if os.stat(name).st_mode & stat.S_IEXEC \
                    else permission_group.get('f_stat')
                os.chmod(name, st)
        for d in dirs:
            dp = os.path.join(root, d)
            os.chmod(dp, 0o550)
            chmod_recursively(dp)
    os.chmod(path, 0o550)


def remove_storage_dir(storage_path):
    if os.path.isdir(storage_path):
        shutil.rmtree(storage_path, ignore_errors=True)


def remove_temp_files(*args):
    for file_path in args:
        if os.path.isfile(file_path):
            os.remove(file_path)


def download_build_packages(pre_invalid_tools, error_messages):
    for tool in pre_invalid_tools:
        if not tool.get('url'):
            error_messages.append(
                f"\033[1;31m[Error] Failed to download {tool.get('name', 'tool')}. "
                f"Please manually download and configure the path. \033[0m")
            continue
        print('=' * SPLIT_LINE_LENGTH + '\n')
        storage_path = tool.get('store')
        dest_file = os.path.join(storage_path, os.path.basename(tool.get('url')))
        dest_sha_file = dest_file + '.sha256'
        if not os.path.isdir(storage_path):
            os.makedirs(storage_path)
        try:
            download_prebuilt(tool, dest_file, dest_sha_file, storage_path)
            remove_temp_files(dest_file, dest_sha_file)
            chmod_recursively(storage_path)
        except DevEcoException as e:
            print(f'\033[31m{e}\033[0m')
            remove_storage_dir(storage_path)
        except Exception:
            print(f'Failed to download: {tool.get("url")}')
            remove_storage_dir(storage_path)

        print('-' * SPLIT_LINE_LENGTH)


def download_build_prebuilt_packages(tool_status, error_messages):
    # download prebuilt packages
    prebuilt_tools = tool_status.get('tools', {}).get('prebuilt', {})
    prebuilt_invalid_tools = []
    for tool in prebuilt_tools:
        if not prebuilt_tools.get(tool, {}).get('valid') and \
        prebuilt_tools.get(tool, {}).get('store'):
            prebuilt_tools.get(tool, {}).update({'name': tool})
            prebuilt_invalid_tools.append(prebuilt_tools.get(tool))

    compiler_tools = tool_status.get('tools', {}).get('compiler', {})
    compiler_invalid_tools = []
    for tool in compiler_tools:
        if not compiler_tools.get(tool, {}).get('valid') and \
        not compiler_tools.get(tool, {}).get('custom') and \
        compiler_tools.get(tool, {}).get('store') and \
        tool not in prebuilt_tools.keys():
            compiler_tools.get(tool, {}).update({'name': tool})
            compiler_invalid_tools.append(compiler_tools.get(tool))

    pre_invalid_tools = prebuilt_invalid_tools + compiler_invalid_tools
    if pre_invalid_tools:
        install_requests()

    download_build_packages(pre_invalid_tools, error_messages)


def read_hpm_tool_info(user_setting_path):
    try:
        return json.load(open(os.path.join(user_setting_path, 'hpm_tools.json'), 'r'))
    except (json.JSONDecodeError, FileNotFoundError):
        return {}


def write_hpm_tool_info(user_setting_path, info):
    flags = os.O_RDWR | os.O_CREAT | os.O_TRUNC
    with os.fdopen(os.open(os.path.join(user_setting_path, 'hpm_tools.json'), flags, 0o640), "w") as fp:
        json.dump(info, fp, indent=4)


def handle_temp_tool(bundle, info, cache_dir):
    name_parts = bundle.split('/')
    package = os.path.join(cache_dir, 'ohos_bundles', name_parts[0], name_parts[1])
    bundle_data = json.load(open(os.path.join(package, 'bundle.json'), 'r'))
    tags = bundle_data.get('tags', [])
    if 'compile' in tags:
        des_package = os.path.join(info.get('user_dir'), 'tool_chains', 'compilers', name_parts[1])
    elif 'burn' in tags:
        des_package = os.path.join(info.get('user_dir'), 'upload_tools', 'tools_zip', name_parts[1])
    else:
        des_package = os.path.join(info.get('user_dir'), 'tool_chains', 'common', name_parts[1])
    if os.path.exists(des_package):
        shutil.rmtree(des_package, ignore_errors=True)
    shutil.copytree(package, des_package)
    info.update(dict(valid=True, tags=bundle_data.get('tags', []),
        environment_path=bundle_data.get('exportPath', []), store=des_package))
    del info['name']
    tool_info = read_hpm_tool_info(os.path.realpath(info.get('user_dir')))
    tool_info.update({bundle: info})
    write_hpm_tool_info(os.path.realpath(info.get('user_dir')), tool_info)


def hpm_install_bundles(hpm_invalid_tools):
    for info in hpm_invalid_tools:
        hpm_bundle_name = f'{info.get("name")}@{info.get("version", "")}'
        try:
            print('=' * SPLIT_LINE_LENGTH + f'\nDownload hpm bundle: {hpm_bundle_name}\n' + '-' * SPLIT_LINE_LENGTH)
            cache_dir = tempfile.mkdtemp()
            cp = subprocess.run(['hpm', 'init', '-t', 'simple'], cwd=cache_dir)
            cp = subprocess.run(['hpm', 'install', hpm_bundle_name], cwd=cache_dir)
            if cp.returncode == 0:
                handle_temp_tool(info.get('name'), info, cache_dir)
            print(f'exit code: {cp.returncode}')
        except KeyboardInterrupt:
            print('\nCancel by user')
        except FileNotFoundError:
            print('\033[1;31m"hpm" not found\033[0m')
        finally:
            shutil.rmtree(cache_dir, ignore_errors=True)
            print('-' * SPLIT_LINE_LENGTH)


def download_hpm_tool_packages(tool_status):
    hpm_invalid_tools = []
    for tool, info in tool_status.get('tools', {}).get('hpm', {}).items():
        if not info.get('valid'):
            info.update({'name': tool})
            hpm_invalid_tools.append(info)
    hpm_install_bundles(hpm_invalid_tools)


def download_upload_packages(upload_invalid_tools, error_messages):
    for tool in upload_invalid_tools:
        if not tool.get('url') and not tool.get('hpm_name'):
            error_messages.append(
                f"\033[1;31m[Error] Failed to download {tool.get('zip_name', 'tool')}. "
                f"Please manually download and configure the path. \033[0m")
            continue
        print('=' * SPLIT_LINE_LENGTH + '\n')
        storage_path = tool.get('store')
        try:
            if os.path.isdir(storage_path):
                os.chmod(storage_path, 0o777)
                shutil.rmtree(storage_path, ignore_errors=True)
            if not os.path.exists(storage_path):
                os.makedirs(storage_path)

            show_download_header(tool)
            if tool.get('url'):
                print(tool.get('url'))
                dest_file = os.path.join(storage_path, os.path.basename(tool.get('url')))
                download_tool(tool.get('url'), dest_file)
                res = check_upload_file_sha256(dest_file, tool.get('sha256', ''))
                print(f'Check Sha256 Ok?  {"Yes" if res else "No"} \n')
            else:
                print('hpm d {}'.format(tool.get('hpm_name')))
                hpmCmd = ['hpm', 'd', tool.get('hpm_name')]
                cp = subprocess.run(hpmCmd, cwd=storage_path)
                print(f'download exit code: {cp.returncode}')
                dest_file = os.path.join(storage_path, tool.get('hpm_dest'))
            tarfile.open(dest_file, "r:gz").extractall(storage_path)
            remove_temp_files(dest_file)
            chmod_recursively(storage_path)
        except DevEcoException as e:
            print(f'\033[31m{e}\033[0m')
            remove_storage_dir(storage_path)
        except Exception:
            print(f'Failed to download: {tool.get("url") or tool.get("hpm_name")}')
            remove_storage_dir(storage_path)

        print('-' * SPLIT_LINE_LENGTH)


def download_upload_prebuilt_packages(tool_status, error_messages):
    upload_tools = tool_status.get('tools', {}).get('upload', {})
    upload_invalid_tools = []
    for tool in upload_tools:
        if not upload_tools.get(tool, {}).get('valid'):
            upload_tools_handle(tool, upload_tools, error_messages, upload_invalid_tools)

    if upload_invalid_tools:
        install_requests()

    download_upload_packages(upload_invalid_tools, error_messages)


def write_pid_file(path):
    with os.fdopen(os.open(os.path.join(path, 'pid'), os.O_RDWR | os.O_CREAT | os.O_TRUNC, 0o640), 'w') as pid_file:
        pid_file.write(str(os.getpid()))


def main():
    error_messages = []
    parser = argparse.ArgumentParser(description='Download dependent tool packages.')
    parser.add_argument('-d', '--project', help='project root directory')
    parser.add_argument('product', help='selected project')

    args = parser.parse_args()
    cache_file = os.path.join(args.project if args.project else os.getcwd(),
        '.deveco', 'status', f'{re.sub("[@/]", ".", args.product)}')

    if not os.path.isfile(cache_file):
        print(f'Failed to download dependent tools for product: {args.product}.')
        print(f'Can not find status result file: {cache_file}')
        return

    write_pid_file(os.path.dirname(cache_file))

    tool_status = json.load(open(cache_file, 'r'))
    if tool_status.get('all_valid'):
        print(f'Nothing to do because all dependent tools are valid for product: {args.product}. Quit.')
        return

    # download build tools
    if not tool_status.get('build_valid'):
        download_deb_packages(tool_status)
        download_pip_packages(tool_status)
        download_build_prebuilt_packages(tool_status, error_messages)

    # download upload tools
    if not tool_status.get('upload_valid'):
        download_upload_prebuilt_packages(tool_status, error_messages)

    # download hpm tools
    if not tool_status.get('hpm_valid'):
        download_hpm_tool_packages(tool_status)

    for message in error_messages:
        print(message)
    print(f'\n\n\033[34mIf you have network problems, you can refer to link: \n{HELP_LINK} \033[0m\n\n')


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Stop installing')
