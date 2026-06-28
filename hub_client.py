import argparse
import socket
import sys
import time
import zlib


HEADER = bytes([0xAA, 0x55])
TAIL = bytes([0x55, 0xAA])
PACKET_SIZE = 32
CONTENT_SIZE = 24

HUB_PORT = 8000

CMD_REPORT_STATUS = 0x00
DOOR_CMD_STATE = 0x01
DOOR_ROOM_0 = 0x00
DOOR_REPORT_TARGET_STATE = 0x01


def make_packet(cmd, room, value):
    content = bytearray(CONTENT_SIZE)
    content[0] = cmd
    content[1] = room
    content[2] = value
    crc = zlib.crc32(content) & 0xFFFFFFFF
    return HEADER + crc.to_bytes(4, "little") + bytes(content) + TAIL


def recv_exact(sock, size):
    chunks = []
    total = 0
    while total < size:
        chunk = sock.recv(size - total)
        if not chunk:
            raise ConnectionError("connection closed by remote host")
        chunks.append(chunk)
        total += len(chunk)
    return b"".join(chunks)


def parse_packet(packet):
    if len(packet) != PACKET_SIZE:
        raise ValueError("invalid packet size")
    if packet[0:2] != HEADER or packet[-2:] != TAIL:
        preview = packet.decode("utf-8", errors="replace").replace("\r", "\\r").replace("\n", "\\n")
        raise ValueError(
            "invalid header or tail; "
            f"raw_hex={packet.hex(' ')}; text_preview={preview!r}"
        )

    expected_crc = int.from_bytes(packet[2:6], "little")
    content = packet[6:30]
    actual_crc = zlib.crc32(content) & 0xFFFFFFFF
    if expected_crc != actual_crc:
        raise ValueError(
            "invalid crc32; "
            f"expected=0x{expected_crc:08x}, actual=0x{actual_crc:08x}, "
            f"raw_hex={packet.hex(' ')}"
        )

    return {
        "cmd": content[0],
        "room": content[1],
        "value": content[2],
        "raw_hex": packet.hex(" "),
    }


def send_binary_command(ip, port, cmd, room, value, timeout):
    packet = make_packet(cmd, room, value)
    with socket.create_connection((ip, port), timeout=timeout) as sock:
        sock.settimeout(timeout)
        sock.sendall(packet)
        return parse_packet(recv_exact(sock, PACKET_SIZE))


def describe_door_probe(ip, port, timeout):
    try:
        reply = send_binary_command(
            ip, port, CMD_REPORT_STATUS, DOOR_ROOM_0, DOOR_REPORT_TARGET_STATE, timeout
        )
        return f"binary ok: cmd=0x{reply['cmd']:02x}, room={reply['room']}, value={reply['value']}"
    except ValueError as exc:
        return f"connected, but reply is not door binary protocol: {exc}"
    except TimeoutError:
        return "connected, but no door reply before timeout"
    except OSError as exc:
        return f"not listening or unreachable: {exc}"
    except ConnectionError as exc:
        return f"connection closed: {exc}"


def describe_temp_probe(ip, port, timeout):
    try:
        with socket.create_connection((ip, port), timeout=timeout) as sock:
            sock.settimeout(timeout)
            sock.sendall(b"TEMP\n")
            data = sock.recv(128)
            if not data:
                return "connected, but no temp text received"
            preview = data.decode("utf-8", errors="replace").replace("\r", "\\r").replace("\n", "\\n")
            return f"text ok: {preview!r}"
    except TimeoutError:
        return "connected, but no temp text before timeout"
    except OSError as exc:
        return f"not listening or unreachable: {exc}"


def describe_ac_probe(ip, port, timeout):
    try:
        with socket.create_connection((ip, port), timeout=timeout) as sock:
            sock.settimeout(timeout)
            sock.sendall(b"AC QUERY\n")
            data = sock.recv(160)
            if not data:
                return "connected, but no ac text received"
            preview = data.decode("utf-8", errors="replace").replace("\r", "\\r").replace("\n", "\\n")
            return f"text ok: {preview!r}"
    except TimeoutError:
        return "connected, but no ac text before timeout"
    except OSError as exc:
        return f"not listening or unreachable: {exc}"


def scan_command(args):
    print(f"scan target: {args.ip}")
    print(f"{args.port} DOOR: {describe_door_probe(args.ip, args.port, args.timeout)}")
    print(f"{args.port} TEMP: {describe_temp_probe(args.ip, args.port, args.timeout)}")
    print(f"{args.port} AC  : {describe_ac_probe(args.ip, args.port, args.timeout)}")


def door_command(args):
    if args.action == "open":
        reply = send_binary_command(
            args.ip, args.port, DOOR_CMD_STATE, DOOR_ROOM_0, 1, args.timeout
        )
    elif args.action == "close":
        reply = send_binary_command(
            args.ip, args.port, DOOR_CMD_STATE, DOOR_ROOM_0, 0, args.timeout
        )
    else:
        reply = send_binary_command(
            args.ip,
            args.port,
            CMD_REPORT_STATUS,
            DOOR_ROOM_0,
            DOOR_REPORT_TARGET_STATE,
            args.timeout,
        )

    print_packet_reply(reply)
    print(f"door state: {'open' if reply['value'] else 'closed'}")


def temp_command(args):
    with socket.create_connection((args.ip, args.port), timeout=args.timeout) as sock:
        sock.settimeout(None)
        sock.sendall(b"TEMP\n")
        stream = sock.makefile("r", encoding="utf-8", newline="\n")
        print(f"connected to hub temp/humi stream {args.ip}:{args.port}")
        print("press Ctrl+C to stop")
        count = 0
        while args.count == 0 or count < args.count:
            line = stream.readline()
            if not line:
                print("server disconnected")
                break
            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {line.strip()}")
            count += 1


def ac_command(args):
    command = f"AC {args.action.upper()}\n".encode("utf-8")
    with socket.create_connection((args.ip, args.port), timeout=args.timeout) as sock:
        sock.settimeout(args.timeout)
        sock.sendall(command)
        data = sock.recv(256)
        if not data:
            raise ConnectionError("server closed connection without reply")
        print(data.decode("utf-8", errors="replace").strip())


def print_packet_reply(reply):
    print(f"reply: {reply['raw_hex']}")
    print(f"cmd  : 0x{reply['cmd']:02x}")
    print(f"room : {reply['room']}")
    print(f"value: {reply['value']}")


def build_parser():
    parser = argparse.ArgumentParser(
        description="Wi-Fi TCP client for one-port temp/door hub."
    )
    parser.add_argument("ip", help="Hi3861 IP from monitor log")
    parser.add_argument("--port", type=int, default=HUB_PORT, help="hub TCP port")
    parser.add_argument("--timeout", type=float, default=5.0)

    subparsers = parser.add_subparsers(dest="service", required=True)

    door = subparsers.add_parser("door", help="control door on hub port")
    door_sub = door.add_subparsers(dest="action", required=True)
    door_sub.add_parser("open", help="open door")
    door_sub.add_parser("close", help="close door")
    door_sub.add_parser("query", help="query door state")

    temp = subparsers.add_parser("temp", help="read temp/humi stream on hub port")
    temp.add_argument(
        "--count",
        type=int,
        default=0,
        help="number of lines to read, 0 means forever",
    )

    ac = subparsers.add_parser("ac", help="control aircon on hub port")
    ac.add_argument("action", choices=["on", "off", "query"])

    subparsers.add_parser("scan", help="probe door binary and temp text protocols")

    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    try:
        if args.service == "door":
            door_command(args)
        elif args.service == "temp":
            temp_command(args)
        elif args.service == "ac":
            ac_command(args)
        elif args.service == "scan":
            scan_command(args)
        else:
            parser.error("unknown service")
    except KeyboardInterrupt:
        return 130
    except (OSError, ValueError, ConnectionError) as exc:
        print(f"failed: {exc}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
