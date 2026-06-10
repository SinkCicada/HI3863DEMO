from itertools import zip_longest
import os
import argparse
import sys
from serial import Serial
from platformio.util import serialspawn
import pexpect


def _unbuffered_print(s):
    sys.stdout.write(s)
    sys.stdout.write(os.linesep)
    sys.stdout.flush()


def _serial_expect_send(args, serial_cli):
    result = 0
    for e, s in zip_longest(args.expect, args.send, fillvalue=None):
        if not args.verbose:
            _unbuffered_print("Expect: %s" % e)

        if e:
            try:
                serial_cli.expect(e)

            except pexpect.exceptions.TIMEOUT as e:
                sys.stderr.write(f"Timeout has occured while waiting for u-boot{os.linesep}")
                result = -1
                break

        if not args.verbose:
            _unbuffered_print("Send: %s" % s)

        if s is not None:
            serial_cli.sendline(s)

    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("-D", "--serial-device",
                        help="Serial device name", required=True)
    parser.add_argument("-b", "--baudrate",
                        help="Serial baudrate", default=115200)
    parser.add_argument("-s", "--send",
                        help="Send to serial", action="append")
    parser.add_argument("-e", "--expect",
                        help="Expect from serial", action="append")
    parser.add_argument("-v", "--verbose", action='store_true')

    args = parser.parse_args()

    if not args.verbose:
        sys.tracebacklimit = 0

    _unbuffered_print(f"Serial: '{args.serial_device}'")

    result = 0
    with Serial(args.serial_device, baudrate=args.baudrate) as serial_port:
        with serialspawn(serial_port) as serial_cli:
            if args.verbose:
                serial_cli.logfile = sys.stdout.buffer

            result = _serial_expect_send(args, serial_cli)

    sys.exit(result)


if __name__ == "__main__":
    main()
