import socket
import sys
import zlib

HEADER = bytes([0xAA, 0x55])
TAIL = bytes([0x55, 0xAA])
PACKET_SIZE = 32
DEFAULT_PORT = 8000

ROOM_DOOR_0 = 0x00

CMD_REPORT_STATUS = 0x00
CMD_DOOR_STATE = 0x01
REPORT_TARGET_DOOR_STATE = 0x01


def make_packet(cmd, room, value):
    content = bytearray(24)
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


def send_packet(ip, packet, port=DEFAULT_PORT):
    with socket.create_connection((ip, port), timeout=5) as sock:
        sock.sendall(packet)
        return recv_exact(sock, PACKET_SIZE)


def parse_reply(packet):
    if len(packet) != PACKET_SIZE:
        raise ValueError("invalid packet size")
    if packet[0:2] != HEADER or packet[-2:] != TAIL:
        raise ValueError("invalid header or tail")
    return {
        "cmd": packet[6],
        "room": packet[7],
        "value": packet[8],
        "crc32_le": packet[2:6].hex(" "),
        "raw_hex": packet.hex(" "),
    }


def print_usage():
    print("Usage:")
    print("  python door_client.py open 192.168.1.62")
    print("  python door_client.py close 192.168.1.62")
    print("  python door_client.py query 192.168.1.62")
    print("  python door_client.py open 192.168.1.62 8002")


def main():
    if len(sys.argv) not in (3, 4):
        print_usage()
        return 1

    action = sys.argv[1].lower()
    ip = sys.argv[2]
    port = int(sys.argv[3]) if len(sys.argv) == 4 else DEFAULT_PORT

    if action == "open":
        packet = make_packet(CMD_DOOR_STATE, ROOM_DOOR_0, 0x01)
    elif action == "close":
        packet = make_packet(CMD_DOOR_STATE, ROOM_DOOR_0, 0x00)
    elif action == "query":
        packet = make_packet(CMD_REPORT_STATUS, ROOM_DOOR_0, REPORT_TARGET_DOOR_STATE)
    else:
        print_usage()
        return 1

    reply = send_packet(ip, packet, port)
    parsed = parse_reply(reply)

    print("reply:", parsed["raw_hex"])
    print("cmd  :", hex(parsed["cmd"]))
    print("room :", parsed["room"])
    print("value:", parsed["value"])
    print("state:", parsed["value"], "(0=closed, 1=open)")
    print("port :", port)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
