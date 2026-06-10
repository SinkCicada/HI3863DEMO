import os
import threading
import time
import math
import click
from os.path import (isfile, abspath)
from serial import Serial
from xmodem import XMODEM
import pexpect
from platformio.util import serialspawn
from SCons.Script import (Import, ARGUMENTS)
from SCons import Errors

TOOL_CHIP_CMD = {
    "115200": b'\x21\x0a\x00\x97\x4b\x31\x00\x00\x00\x00\xc2\x01\x00',
    "921600": b'\x21\x0a\x00\x5d\x50\x31\x00\x00\x00\x00\x10\x0e\x00',
    "1000000": b'\x21\x0a\x00\x5e\x3d\x31\x00\x00\x00\x40\x42\x0f\x00',
    "2000000": b'\x21\x0a\x00\xef\x2a\x31\x00\x00\x00\x80\x84\x1e\x00'
}


class WriteEscThread(threading.Thread):
    def __init__(self, ser):
        threading.Thread.__init__(self)
        self.Flag = True
        self.Serial = ser

    def run(self):
        while(self.Flag):
            self.Serial.write(b'\x1b')
            time.sleep(0.01)

    def setFlag(self, parm):
        self.Flag = parm


def sendByXmodem(ser, bin_path):
    statinfo_bin = os.stat(bin_path)
    statinfo_size = math.ceil(statinfo_bin.st_size/128)

    def getc(size, timeout=1):
        return ser.read(size)

    def putc(data, timeout=1):
        ser.write(data)

    def sendCallback(total_packets, success_count, error_count):
        if total_packets % int(statinfo_size / 10) == 0 or total_packets == statinfo_size:
            try:
                upload_size = int(total_packets / statinfo_size * 100)
            except ZeroDivisionError:
                print("You can't divide by 0!")
            click.echo(f'\r#############{upload_size}%')

    modem = XMODEM(getc, putc)
    stream = open(bin_path, 'rb')

    status = modem.send(stream, callback=sendCallback)
    return status


def get_upload_partition(parts, env):
    partitions = [v for _, v in parts.items() if v['partition_type'] == 'app']

    if len(partitions) == 0:
        raise Errors.BuildError(errstr="Please config partition_type:app to burn.")

    partition = partitions[0]

    if not partition.get('partition_bin', ''):
        raise Errors.BuildError(errstr=f"Partition {partition['partition_type']} file not found."
                                "Please config partition_bin for it")

    partition.update({
        'partition_bin':
        abspath(env.subst(partition['partition_bin']))
    })
    if not isfile(partition["partition_bin"]):
        raise Errors.BuildError(errstr=f"Partition {partition['partition_type']} file not found:"
                                f"{partition['partition_bin']}")

    return partition  


def into_burn_mode(serial_port, cmd_baudrate):
    write_thread = WriteEscThread(serial_port)
    write_thread.start()

    with serialspawn(serial_port) as serial_cli:
        try:
            serial_cli.expect("C")
        except pexpect.exceptions.TIMEOUT as e:
            click.echo(f"Timeout has occured while"
                        f"waiting to enter the burning mode.{os.linesep}")
            raise RuntimeError() from e
        finally:
            write_thread.setFlag(False)
            write_thread.join()

        serial_cli.sendline(cmd_baudrate)

        try:
            serial_cli.expect(b'\x06')
        except pexpect.exceptions.TIMEOUT as e:
            click.echo(f"Timeout has occured while"
                            f"waiting for expected ACK.{os.linesep}")
            raise RuntimeError() from e


def XModemUpload(environ, target, source, env):
    board_config = env.BoardConfig()
    port = env.subst("$UPLOAD_PORT")
    parts = board_config.get("upload_partitions", {})
    speed = env.subst("$UPLOAD_SPEED")

    if not port:
        raise Errors.BuildError(errstr="Please config upload_port.")

    partition = get_upload_partition(parts, env)

    cmd_baudrate = TOOL_CHIP_CMD.get(str(speed))
    if cmd_baudrate is None:
        raise Errors.BuildError(errstr=f"The baudrate only support(115200,921600,1000000,2000000),"
                                f"Please reconfigure upload_speed.")

    result = -1
    try:
        with Serial(port, baudrate=115200) as serial_port:
            into_burn_mode(serial_port, cmd_baudrate)

        with Serial(port, baudrate=speed) as serial_upload:
            click.echo("Start upload")
            res = sendByXmodem(serial_upload, partition["partition_bin"])
            result = 0 if res else -1

    except Exception as ex:  # pylint: disable=broad-except
        raise Errors.BuildError(errstr=f"Failed to upload")

    return result

Import("env")

burn_env = env  # noqa: F821

burn_env.AddMethod(XModemUpload)
