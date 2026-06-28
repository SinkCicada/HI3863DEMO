#include "multi_service_hub.h"

#include <stdio.h>
#include <string.h>
#include <unistd.h>

#include "cmsis_os2.h"
#include "securec.h"

#include "bsp_dht11.h"
#include "bsp_wifi.h"
#include "door_ctrl.h"
#include "lwip/sockets.h"

#define WIFI_SSID "TEST-2.4GHz"
#define WIFI_PASSWORD "8888888867"
#define WIFI_RETRY_INTERVAL_S 2

#define HUB_SERVER_PORT 8000
#define HUB_SERVER_STACK_SIZE (1024 * 8)

#define PROTO_PACKET_SIZE 32
#define PROTO_HEADER_0 0xAA
#define PROTO_HEADER_1 0x55
#define PROTO_TAIL_0 0x55
#define PROTO_TAIL_1 0xAA
#define PROTO_CRC_OFFSET 2
#define PROTO_CONTENT_OFFSET 6
#define PROTO_CONTENT_SIZE 24

#define DOOR_ROOM_0 0
#define DOOR_COMPAT_ROOM 3
#define DOOR_CMD_REPORT_STATUS 0
#define DOOR_CMD_STATE 1
#define DOOR_REPORT_TARGET_STATE 1

#define SAMPLE_INTERVAL_S 2
#define TEMP_ALARM_THRESHOLD 30
#define HUMI_ALARM_THRESHOLD 80
#define DHT11_RECOVER_AFTER_DOOR_S 2

static osThreadId_t g_hub_server_task_id = NULL;
static char g_hub_ip[20] = "0.0.0.0";
static int g_dht11_recover_after_door = 0;
static unsigned char g_last_temp = 0;
static unsigned char g_last_humi = 0;
static const char *g_last_alarm = "NONE";

static unsigned int crc32_update(unsigned int crc, unsigned char data)
{
    unsigned int bit;

    crc ^= data;
    for (bit = 0; bit < 8; ++bit) {
        if ((crc & 1U) != 0) {
            crc = (crc >> 1) ^ 0xEDB88320U;
        } else {
            crc >>= 1;
        }
    }

    return crc;
}

static unsigned int crc32_calc(const unsigned char *data, unsigned int len)
{
    unsigned int index;
    unsigned int crc = 0xFFFFFFFFU;

    for (index = 0; index < len; ++index) {
        crc = crc32_update(crc, data[index]);
    }

    return crc ^ 0xFFFFFFFFU;
}

static void write_u32_le(unsigned char *buf, unsigned int value)
{
    buf[0] = (unsigned char)(value & 0xFFU);
    buf[1] = (unsigned char)((value >> 8) & 0xFFU);
    buf[2] = (unsigned char)((value >> 16) & 0xFFU);
    buf[3] = (unsigned char)((value >> 24) & 0xFFU);
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

    (void)memset_s(packet, PROTO_PACKET_SIZE, 0, PROTO_PACKET_SIZE);
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

static int recv_exact(int client_fd, unsigned char *buf, int already_received, int total_len)
{
    int received = already_received;

    while (received < total_len) {
        int ret = recv(client_fd, buf + received, total_len - received, 0);
        if (ret <= 0) {
            return ret;
        }
        received += ret;
    }

    return received;
}

static int send_full_packet(int client_fd, const unsigned char *packet)
{
    int total = 0;

    while (total < PROTO_PACKET_SIZE) {
        int ret = send(client_fd, packet + total, PROTO_PACKET_SIZE - total, 0);
        if (ret <= 0) {
            return -1;
        }
        total += ret;
    }

    return 0;
}

static int send_all_text(int client_fd, const char *text)
{
    int total = 0;
    int text_len;

    if (text == NULL) {
        return -1;
    }

    text_len = strlen(text);
    while (total < text_len) {
        int ret = send(client_fd, text + total, text_len - total, 0);
        if (ret <= 0) {
            return -1;
        }
        total += ret;
    }

    return 0;
}

static const char *detect_alarm_type(unsigned char temp, unsigned char humi)
{
    if ((temp >= TEMP_ALARM_THRESHOLD) && (humi >= HUMI_ALARM_THRESHOLD)) {
        return "TEMP_AND_HUMI_HIGH";
    }
    if (temp >= TEMP_ALARM_THRESHOLD) {
        return "TEMP_HIGH";
    }
    if (humi >= HUMI_ALARM_THRESHOLD) {
        return "HUMI_HIGH";
    }
    return "NONE";
}

static int send_temp_humi_text(int client_fd, const char *type,
    const char *alarm, unsigned char temp, unsigned char humi)
{
    char send_buf[160];
    int packet_len;

    packet_len = sprintf_s(send_buf,
        sizeof(send_buf),
        "%s,temp=%u,humi=%u,alarm=%s,ip=%s\r\n",
        type,
        temp,
        humi,
        alarm,
        g_hub_ip);
    if (packet_len <= 0) {
        return -1;
    }

    return send_all_text(client_fd, send_buf);
}

static int send_temp_humi_boot_text(int client_fd)
{
    char send_buf[160];
    int packet_len;

    packet_len = sprintf_s(send_buf,
        sizeof(send_buf),
        "BOOT,ip=%s,port=%d,proto=TEMP,sample_s=%d\r\n",
        g_hub_ip,
        HUB_SERVER_PORT,
        SAMPLE_INTERVAL_S);
    if (packet_len <= 0) {
        return -1;
    }

    return send_all_text(client_fd, send_buf);
}

static int send_door_status_packet(int client_fd, unsigned char room)
{
    unsigned char packet[PROTO_PACKET_SIZE];
    unsigned char state = (unsigned char)door_ctrl_get_state();
    unsigned int angle = door_ctrl_get_angle();

    protocol_build_packet(packet, DOOR_CMD_STATE, room, state);
    if (send_full_packet(client_fd, packet) != 0) {
        return -1;
    }

    printf("[door] report room=%u state=%u angle=%u\r\n", room, state, angle);
    return 0;
}

static int handle_door_packet(int client_fd, const unsigned char *packet)
{
    const unsigned char *content = &packet[PROTO_CONTENT_OFFSET];
    unsigned char cmd = content[0];
    unsigned char room = content[1];
    unsigned char value = content[2];
    int ret;

    if ((room != DOOR_ROOM_0) && (room != DOOR_COMPAT_ROOM)) {
        printf("[door] invalid room=%u\r\n", room);
        return -1;
    }

    if (cmd == DOOR_CMD_REPORT_STATUS) {
        if (value != DOOR_REPORT_TARGET_STATE) {
            printf("[door] invalid report target=%u\r\n", value);
            return -1;
        }
        return send_door_status_packet(client_fd, room);
    }

    if (cmd == DOOR_CMD_STATE) {
        ret = door_ctrl_set_open(value);
        if (ret != 0) {
            printf("[door] invalid state value=%u\r\n", value);
            return -1;
        }
        g_dht11_recover_after_door = 1;
        return send_door_status_packet(client_fd, room);
    }

    printf("[door] invalid cmd=%u\r\n", cmd);
    return -1;
}

static void recover_dht11_after_door_if_needed(void)
{
    if (!g_dht11_recover_after_door) {
        return;
    }

    printf("[temp] wait %d seconds after door servo activity\r\n",
        DHT11_RECOVER_AFTER_DOOR_S);
    sleep(DHT11_RECOVER_AFTER_DOOR_S);
    g_dht11_recover_after_door = 0;
}

static void handle_temp_stream(int client_fd)
{
    int ret;
    int sensor_ready = 0;
    int dht11_ready_reported = 0;
    unsigned int dht11_retry = 0;
    unsigned char temp = g_last_temp;
    unsigned char humi = g_last_humi;
    const char *alarm_type;

    printf("[temp] client connected\r\n");

    if (send_temp_humi_boot_text(client_fd) != 0) {
        printf("[temp] send boot text failed\r\n");
        return;
    }

    recover_dht11_after_door_if_needed();

    while (1) {
        if (!sensor_ready) {
            if (dht11_init() != 0) {
                ret = send_temp_humi_text(client_fd,
                    "ALARM,type=DHT11_INIT_FAIL", "DHT11_INIT_FAIL", 0, 0);
                if (ret != 0) {
                    printf("[temp] client disconnected while DHT11 init failed\r\n");
                    break;
                }

                dht11_retry++;
                printf("[temp] dht11 init failed, retry=%u\r\n", dht11_retry);
                sleep(1);
                continue;
            }

            sensor_ready = 1;
            if (!dht11_ready_reported) {
                ret = send_temp_humi_text(client_fd,
                    "STATUS,type=DHT11_READY", g_last_alarm, temp, humi);
                if (ret != 0) {
                    printf("[temp] client disconnected before DHT11 ready report\r\n");
                    break;
                }
                dht11_ready_reported = 1;
            }

            sleep(1);
            continue;
        }

        if (dht11_read_data(&temp, &humi) != 0) {
            sensor_ready = 0;
            dht11_ready_reported = 0;
            ret = send_temp_humi_text(client_fd,
                "ALARM,type=SENSOR_ERR", "SENSOR_ERR", 0, 0);
            if (ret != 0) {
                printf("[temp] client disconnected while sensor read failed\r\n");
                break;
            }

            printf("[temp] dht11 read failed\r\n");
            sleep(SAMPLE_INTERVAL_S);
            continue;
        }

        alarm_type = detect_alarm_type(temp, humi);
        g_last_temp = temp;
        g_last_humi = humi;
        g_last_alarm = alarm_type;

        ret = send_temp_humi_text(client_fd, "DATA", alarm_type, temp, humi);
        if (ret != 0) {
            printf("[temp] client disconnected\r\n");
            break;
        }

        if (strcmp(alarm_type, "NONE") != 0) {
            ret = send_temp_humi_text(client_fd, "ALARM", alarm_type, temp, humi);
            if (ret != 0) {
                printf("[temp] client disconnected while alarm reported\r\n");
                break;
            }
        }

        sleep(SAMPLE_INTERVAL_S);
    }
}

static int starts_with_temp_command(const unsigned char *buf, int len)
{
    if (len < 4) {
        return 0;
    }

    return (buf[0] == 'T' || buf[0] == 't') &&
        (buf[1] == 'E' || buf[1] == 'e') &&
        (buf[2] == 'M' || buf[2] == 'm') &&
        (buf[3] == 'P' || buf[3] == 'p');
}

static void handle_client(int client_fd)
{
    unsigned char buf[PROTO_PACKET_SIZE];
    int received;
    int ret;

    (void)memset_s(buf, sizeof(buf), 0, sizeof(buf));
    received = recv(client_fd, buf, sizeof(buf), 0);
    if (received <= 0) {
        printf("[hub] client disconnected before request\r\n");
        return;
    }

    if (buf[0] == PROTO_HEADER_0) {
        ret = recv_exact(client_fd, buf, received, PROTO_PACKET_SIZE);
        if (ret != PROTO_PACKET_SIZE) {
            printf("[hub] incomplete binary packet\r\n");
            return;
        }

        ret = protocol_check_packet(buf);
        if (ret != 0) {
            printf("[hub] invalid binary packet, code=%d\r\n", ret);
            return;
        }

        (void)handle_door_packet(client_fd, buf);
        return;
    }

    if (starts_with_temp_command(buf, received)) {
        handle_temp_stream(client_fd);
        return;
    }

    printf("[hub] unknown text command: %.*s\r\n", received, (char *)buf);
    (void)send_all_text(client_fd,
        "ERR,unknown_command,use TEMP text or 32-byte door binary packet\r\n");
}

static void hub_server_task(void *arg)
{
    int server_fd;
    int client_fd;
    int opt = 1;
    int ret;
    struct sockaddr_in server_addr;
    struct sockaddr_in client_addr;
    socklen_t client_addr_len;

    (void)arg;

    server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0) {
        printf("[hub] create socket failed\r\n");
        return;
    }

    (void)setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
    (void)memset_s(&server_addr, sizeof(server_addr), 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(HUB_SERVER_PORT);
    server_addr.sin_addr.s_addr = htonl(INADDR_ANY);

    ret = bind(server_fd, (struct sockaddr *)&server_addr, sizeof(server_addr));
    if (ret < 0) {
        printf("[hub] bind port %d failed\r\n", HUB_SERVER_PORT);
        close(server_fd);
        return;
    }

    ret = listen(server_fd, 1);
    if (ret < 0) {
        printf("[hub] listen failed\r\n");
        close(server_fd);
        return;
    }

    printf("[hub] server listening on %s:%d\r\n", g_hub_ip, HUB_SERVER_PORT);
    printf("[hub] protocol: door=binary32, temp=text command TEMP\r\n");

    while (1) {
        client_addr_len = sizeof(client_addr);
        client_fd = accept(server_fd, (struct sockaddr *)&client_addr, &client_addr_len);
        if (client_fd < 0) {
            printf("[hub] accept failed\r\n");
            sleep(1);
            continue;
        }

        handle_client(client_fd);
        close(client_fd);
    }
}

int multi_service_hub_start(void)
{
    int ret;
    osThreadAttr_t task_options = {0};

    door_ctrl_init();

    while (1) {
        printf("[hub] connecting to SSID: %s\r\n", WIFI_SSID);
        ret = WiFi_connectHotspots(WIFI_SSID, WIFI_PASSWORD);
        if (ret == WIFI_SUCCESS) {
            break;
        }

        printf("[hub] connect failed, code=%d, retry after %d seconds\r\n",
            ret, WIFI_RETRY_INTERVAL_S);
        sleep(WIFI_RETRY_INTERVAL_S);
    }

    (void)strcpy_s(g_hub_ip, sizeof(g_hub_ip), WiFi_GetLocalIP());
    printf("[hub] connected, local ip: %s\r\n", g_hub_ip);
    printf("[hub] one device, one IP, one port: %d\r\n", HUB_SERVER_PORT);
    printf("[hub] enabled: 45 temp/humi + 47 door servo; 44 LED removed\r\n");

    task_options.name = "hubSrv";
    task_options.stack_size = HUB_SERVER_STACK_SIZE;
    task_options.priority = osPriorityNormal;

    g_hub_server_task_id = osThreadNew((osThreadFunc_t)hub_server_task,
        NULL, &task_options);
    if (g_hub_server_task_id == NULL) {
        printf("[hub] create server task failed\r\n");
        return -1;
    }

    printf("[hub] create server task success, id=%d\r\n", g_hub_server_task_id);
    return 0;
}
