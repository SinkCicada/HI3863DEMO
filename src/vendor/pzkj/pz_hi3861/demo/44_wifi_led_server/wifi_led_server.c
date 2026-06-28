#include "wifi_led_server.h"

#include <stdio.h>
#include <string.h>
#include <unistd.h>

#include "securec.h"

#include "bsp_wifi.h"
#include "led_ctrl.h"
#include "lwip/sockets.h"

#define WIFI_SSID "TEST-2.4GHz"
#define WIFI_PASSWORD "8888888867"
#define LED_CONTROL_PORT 8000

#define PROTO_PACKET_SIZE 32
#define PROTO_HEADER_0 0xAA
#define PROTO_HEADER_1 0x55
#define PROTO_TAIL_0 0x55
#define PROTO_TAIL_1 0xAA
#define PROTO_CONTENT_OFFSET 6
#define PROTO_CONTENT_SIZE 24
#define PROTO_CRC_OFFSET 2

#define CMD_REPORT_STATUS 0
#define CMD_BRIGHTNESS 1
#define CMD_HUMAN_DETECT 2

static wifi_led_server_status_t g_wifi_led_server_status = {
    0, 0, 0, 0, LED_CONTROL_PORT, 0, "0.0.0.0"
};

static void wifi_led_server_set_ip(const char *ip)
{
    if (ip == NULL || ip[0] == '\0') {
        strcpy_s(g_wifi_led_server_status.ip,
            sizeof(g_wifi_led_server_status.ip), "0.0.0.0");
        return;
    }

    strcpy_s(g_wifi_led_server_status.ip, sizeof(g_wifi_led_server_status.ip), ip);
}

static unsigned int crc32_update(unsigned int crc, unsigned char data)
{
    unsigned int bit;

    crc ^= data;
    for (bit = 0; bit < 8; ++bit) {
        if ((crc & 1) != 0) {
            crc = (crc >> 1) ^ 0xEDB88320;
        } else {
            crc >>= 1;
        }
    }

    return crc;
}

static unsigned int crc32_calc(const unsigned char *data, unsigned int len)
{
    unsigned int index;
    unsigned int crc = 0xFFFFFFFF;

    for (index = 0; index < len; ++index) {
        crc = crc32_update(crc, data[index]);
    }

    return crc ^ 0xFFFFFFFF;
}

static void write_u32_le(unsigned char *buf, unsigned int value)
{
    buf[0] = (unsigned char)(value & 0xFF);
    buf[1] = (unsigned char)((value >> 8) & 0xFF);
    buf[2] = (unsigned char)((value >> 16) & 0xFF);
    buf[3] = (unsigned char)((value >> 24) & 0xFF);
}

static unsigned int read_u32_le(const unsigned char *buf)
{
    return ((unsigned int)buf[0]) |
        ((unsigned int)buf[1] << 8) |
        ((unsigned int)buf[2] << 16) |
        ((unsigned int)buf[3] << 24);
}

static int protocol_check_packet(const unsigned char *packet)
{
    unsigned int expected_crc;
    unsigned int actual_crc;

    if (packet[0] != PROTO_HEADER_0 || packet[1] != PROTO_HEADER_1) {
        return -1;
    }

    if (packet[30] != PROTO_TAIL_0 || packet[31] != PROTO_TAIL_1) {
        return -2;
    }

    expected_crc = read_u32_le(&packet[PROTO_CRC_OFFSET]);
    actual_crc = crc32_calc(&packet[PROTO_CONTENT_OFFSET], PROTO_CONTENT_SIZE);
    if (expected_crc != actual_crc) {
        return -3;
    }

    return 0;
}

static void protocol_build_packet(unsigned char *packet, unsigned char cmd,
    unsigned char room, unsigned char value)
{
    unsigned int crc;

    memset(packet, 0, PROTO_PACKET_SIZE);
    packet[0] = PROTO_HEADER_0;
    packet[1] = PROTO_HEADER_1;
    packet[PROTO_CONTENT_OFFSET] = cmd;
    packet[PROTO_CONTENT_OFFSET + 1] = room;
    packet[PROTO_CONTENT_OFFSET + 2] = value;
    packet[30] = PROTO_TAIL_0;
    packet[31] = PROTO_TAIL_1;

    crc = crc32_calc(&packet[PROTO_CONTENT_OFFSET], PROTO_CONTENT_SIZE);
    write_u32_le(&packet[PROTO_CRC_OFFSET], crc);
}

static void send_status_packet(int client_fd, unsigned char cmd, unsigned char room)
{
    unsigned char packet[PROTO_PACKET_SIZE];
    unsigned char value;

    if (cmd == CMD_BRIGHTNESS) {
        value = led_ctrl_get_brightness(room);
    } else if (cmd == CMD_HUMAN_DETECT) {
        value = led_ctrl_get_human_detect(room);
    } else {
        return;
    }

    protocol_build_packet(packet, cmd, room, value);
    send(client_fd, packet, PROTO_PACKET_SIZE, 0);
    printf("[proto] report cmd=%u room=%u value=%u\r\n", cmd, room, value);
}

static int handle_protocol_packet(int client_fd, const unsigned char *packet)
{
    const unsigned char *content = &packet[PROTO_CONTENT_OFFSET];
    unsigned char cmd = content[0];
    unsigned char room = content[1];
    unsigned char value = content[2];
    int ret;

    if (!led_ctrl_room_is_valid(room)) {
        printf("[proto] invalid room=%u\r\n", room);
        return -1;
    }

    if (cmd == CMD_REPORT_STATUS) {
        send_status_packet(client_fd, value, room);
        return 0;
    }

    if (cmd == CMD_BRIGHTNESS) {
        ret = led_ctrl_set_brightness(room, value);
        if (ret == 0) {
            send_status_packet(client_fd, CMD_BRIGHTNESS, room);
        }
        return ret;
    }

    if (cmd == CMD_HUMAN_DETECT) {
        ret = led_ctrl_set_human_detect(room, value);
        if (ret == 0) {
            send_status_packet(client_fd, CMD_HUMAN_DETECT, room);
        }
        return ret;
    }

    printf("[proto] invalid cmd=%u\r\n", cmd);
    return -1;
}

static int recv_full_packet(int client_fd, unsigned char *packet)
{
    int received = 0;

    while (received < PROTO_PACKET_SIZE) {
        int ret = recv(client_fd, packet + received, PROTO_PACKET_SIZE - received, 0);
        if (ret <= 0) {
            return ret;
        }
        received += ret;
    }

    return received;
}

void wifi_led_server_get_status(wifi_led_server_status_t *status)
{
    if (status == NULL) {
        return;
    }

    memcpy(status, &g_wifi_led_server_status, sizeof(*status));
}

int wifi_led_server_start(void)
{
    int server_fd;
    int client_fd;
    int opt = 1;
    int ret;
    struct sockaddr_in server_addr;
    struct sockaddr_in client_addr;
    socklen_t client_addr_len = sizeof(client_addr);
    unsigned char packet[PROTO_PACKET_SIZE];

    g_wifi_led_server_status.wifi_connecting = 1;
    g_wifi_led_server_status.wifi_connected = 0;
    g_wifi_led_server_status.tcp_listening = 0;
    g_wifi_led_server_status.tcp_client_connected = 0;
    g_wifi_led_server_status.last_error = 0;
    g_wifi_led_server_status.server_port = LED_CONTROL_PORT;
    wifi_led_server_set_ip("0.0.0.0");

    printf("[wifi] connecting to SSID: %s\r\n", WIFI_SSID);
    ret = WiFi_connectHotspots(WIFI_SSID, WIFI_PASSWORD);
    if (ret != WIFI_SUCCESS) {
        g_wifi_led_server_status.wifi_connecting = 0;
        g_wifi_led_server_status.last_error = ret;
        printf("[wifi] connect failed, code=%d\r\n", ret);
        return ret;
    }

    g_wifi_led_server_status.wifi_connecting = 0;
    g_wifi_led_server_status.wifi_connected = 1;
    wifi_led_server_set_ip(WiFi_GetLocalIP());
    printf("[wifi] connected, local ip: %s\r\n", WiFi_GetLocalIP());

    server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0) {
        g_wifi_led_server_status.last_error = -1;
        printf("[tcp] create socket failed\r\n");
        return -1;
    }

    setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(LED_CONTROL_PORT);
    server_addr.sin_addr.s_addr = htonl(INADDR_ANY);

    ret = bind(server_fd, (struct sockaddr *)&server_addr, sizeof(server_addr));
    if (ret < 0) {
        g_wifi_led_server_status.last_error = -2;
        printf("[tcp] bind port %d failed\r\n", LED_CONTROL_PORT);
        close(server_fd);
        return -1;
    }

    ret = listen(server_fd, 4);
    if (ret < 0) {
        g_wifi_led_server_status.last_error = -3;
        printf("[tcp] listen failed\r\n");
        close(server_fd);
        return -1;
    }

    g_wifi_led_server_status.tcp_listening = 1;
    printf("[tcp] server listening on %s:%d\r\n", WiFi_GetLocalIP(), LED_CONTROL_PORT);
    printf("[proto] packet=32 header=AA55 crc=content24 little-endian tail=55AA\r\n");

    while (1) {
        client_fd = accept(server_fd, (struct sockaddr *)&client_addr, &client_addr_len);
        if (client_fd < 0) {
            g_wifi_led_server_status.last_error = -4;
            printf("[tcp] accept failed\r\n");
            sleep(1);
            continue;
        }

        g_wifi_led_server_status.tcp_client_connected = 1;
        printf("[tcp] client connected\r\n");
        while (1) {
            ret = recv_full_packet(client_fd, packet);
            if (ret <= 0) {
                printf("[tcp] client disconnected\r\n");
                break;
            }

            ret = protocol_check_packet(packet);
            if (ret != 0) {
                printf("[proto] invalid packet, code=%d\r\n", ret);
                continue;
            }

            handle_protocol_packet(client_fd, packet);
        }

        g_wifi_led_server_status.tcp_client_connected = 0;
        close(client_fd);
    }

    return 0;
}
