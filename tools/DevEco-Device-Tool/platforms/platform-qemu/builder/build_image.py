import os
import click
from SCons.Script import (Import, ARGUMENTS)
import platformio.util


def BuildImage(environ, target, source, env):
    verbose = bool(int(ARGUMENTS.get("PIOVERBOSE", 0)))
    framework = environ.get("PIOFRAMEWORK")[0]
    board = environ.BoardConfig()
    default_bin = board.get('frameworks', {}).get(framework, {}).get('output_bin')
    image_path = os.path.join(environ.subst("$BUILD_OUT_DIR"), 'qemu-image.img')
    click.secho(f'Create image {image_path}')

    partitions = []
    root_address = 0
    for _, partition in board.get("upload_partitions", {}).items():
        bin_file = partition.get("partition_bin", default_bin.get(partition['partition_type']))
        partition.update({'partition_bin': bin_file})
        partitions.append(partition)
        if partition['partition_type'] == 'rootfs':
            root_address = partition['partition_addr']

    if not partitions:
        click.secho("Please config 'upload_partitions' option in project file", fg="red")
        return 2

    image = bytearray([0xFF] * int(board.get('memory').get('nand').get('size'), 0))
    for partition in partitions:
        if partition['partition_type'] == 'bootargs' and partition['partition_bin'] is None:
            partition_bin = \
                b'bootargs=root=cfi-flash fstype=jffs2 rootaddr=' + \
                root_address.encode('utf-8') + \
                b' rootsize=' + \
                partition['partition_length'].encode('utf-8') + \
                b'\0'
        elif os.path.isfile(partition['partition_bin']):
            partition_bin = open(partition['partition_bin'], 'rb').read()
        else:
            click.secho(f"File {partition['partition_bin']} is not found for '{partition['partition_type']}'",
                        fg="red")
            return 2

        if verbose:
            click.secho(f'- Add partition {partition["partition_type"]} offset {partition["partition_addr"]}'
                        f' length {platformio.util.humanize_file_size(len(partition_bin))}'
                        f' max length {platformio.util.humanize_file_size(int(partition["partition_length"], 0))}')

        if len(partition_bin) > int(partition['partition_length'], 0):
            click.secho(f"File {partition['partition_bin']} is not fit to partition size", fg="red")
            return 2

        offset = int(partition['partition_addr'], 0)
        for idx, b in enumerate(partition_bin):
            image[offset + idx] = b

    flags = os.O_RDWR | os.O_CREAT | os.O_EXCL
    os.fdopen(os.open(image_path, flags, 0o640), 'wb').write(image)
    click.secho(f'File {image_path} created with size {platformio.util.humanize_file_size(len(image))}')
    return 0


Import("env")
build_image_env = env  # noqa: F821  # pylint: disable=undefined-variable
build_image_env.AddMethod(BuildImage)
