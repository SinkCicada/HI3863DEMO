import argparse
import socket
import sys


DEFAULT_PORT = 8000


def send_command(ip, port, command, timeout):
    with socket.create_connection((ip, port), timeout=timeout) as sock:
        sock.settimeout(timeout)
        sock.sendall((command + "\n").encode("utf-8"))
        data = sock.recv(256)
        if not data:
            raise ConnectionError("server closed connection without reply")
        return data.decode("utf-8", errors="replace").strip()


def build_parser():
    parser = argparse.ArgumentParser(
        description="TCP client for 48_wifi_aircon_server."
    )
    parser.add_argument("ip", help="Hi3861 IP address")
    parser.add_argument("action", choices=["on", "off", "query"])
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--timeout", type=float, default=5.0)
    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    command = f"AC {args.action.upper()}"
    try:
        reply = send_command(args.ip, args.port, command, args.timeout)
    except (OSError, ConnectionError) as exc:
        print(f"failed: {exc}", file=sys.stderr)
        return 1

    print(f"command: {command}")
    print(f"reply  : {reply}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
