#include "temp_humi_server.h"

#include <stdio.h>
#include <string.h>
#include <unistd.h>

#include "securec.h"

#include "bsp_dht11.h"
#include "bsp_wifi.h"
#include "lwip/sockets.h"

#define WIFI_SSID "TEST-2.4GHz"
#define WIFI_PASSWORD "8888888867"
#define TEMP_HUMI_SERVER_PORT 8000

#define SAMPLE_INTERVAL_S 2
#define WIFI_RETRY_INTERVAL_S 2
#define TEMP_ALARM_THRESHOLD 30
#define HUMI_ALARM_THRESHOLD 80

static temp_humi_server_status_t g_temp_humi_server_status = {
    0, 0, 0, 0, 0, TEMP_HUMI_SERVER_PORT, 0, 0, 0, "0.0.0.0", "NONE"
};

static void temp_humi_server_set_ip(const char *ip)
{
    if ((ip == NULL) || (ip[0] == '\0')) {
        (void)strcpy_s(g_temp_humi_server_status.ip,
            sizeof(g_temp_humi_server_status.ip), "0.0.0.0");
        return;
    }

    (void)strcpy_s(g_temp_humi_server_status.ip,
        sizeof(g_temp_humi_server_status.ip), ip);
}

static void temp_humi_server_set_alarm(const char *alarm)
{
    if ((alarm == NULL) || (alarm[0] == '\0')) {
        (void)strcpy_s(g_temp_humi_server_status.last_alarm,
            sizeof(g_temp_humi_server_status.last_alarm), "NONE");
        return;
    }

    (void)strcpy_s(g_temp_humi_server_status.last_alarm,
        sizeof(g_temp_humi_server_status.last_alarm), alarm);
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

    printf("%s", text);
    return 0;
}

static int send_status_text(int client_fd, const char *type, const char *alarm,
    unsigned char temp, unsigned char humi)
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
        WiFi_GetLocalIP());
    if (packet_len <= 0) {
        return -1;
    }

    return send_all_text(client_fd, send_buf);
}

static int send_boot_text(int client_fd)
{
    char send_buf[160];
    int packet_len;

    packet_len = sprintf_s(send_buf,
        sizeof(send_buf),
        "BOOT,ip=%s,port=%d,sample_s=%d\r\n",
        WiFi_GetLocalIP(),
        TEMP_HUMI_SERVER_PORT,
        SAMPLE_INTERVAL_S);
    if (packet_len <= 0) {
        return -1;
    }

    return send_all_text(client_fd, send_buf);
}

void temp_humi_server_get_status(temp_humi_server_status_t *status)
{
    if (status == NULL) {
        return;
    }

    (void)memcpy_s(status, sizeof(*status),
        &g_temp_humi_server_status, sizeof(g_temp_humi_server_status));
}

int temp_humi_server_start(void)
{
    int server_fd;
    int client_fd;
    int opt = 1;
    int ret;
    int sensor_ready;
    int dht11_ready_reported;
    unsigned int dht11_retry = 0;
    unsigned char temp = 0;
    unsigned char humi = 0;
    const char *alarm_type;
    struct sockaddr_in server_addr;
    struct sockaddr_in client_addr;
    socklen_t client_addr_len;

    g_temp_humi_server_status.wifi_connecting = 1;
    g_temp_humi_server_status.wifi_connected = 0;
    g_temp_humi_server_status.tcp_listening = 0;
    g_temp_humi_server_status.tcp_client_connected = 0;
    g_temp_humi_server_status.dht11_ready = 0;
    g_temp_humi_server_status.last_error = 0;
    g_temp_humi_server_status.last_temp = 0;
    g_temp_humi_server_status.last_humi = 0;
    g_temp_humi_server_status.server_port = TEMP_HUMI_SERVER_PORT;
    temp_humi_server_set_ip("0.0.0.0");
    temp_humi_server_set_alarm("NONE");

    while (1) {
        printf("[wifi] connecting to SSID: %s\r\n", WIFI_SSID);
        ret = WiFi_connectHotspots(WIFI_SSID, WIFI_PASSWORD);
        if (ret == WIFI_SUCCESS) {
            break;
        }

        g_temp_humi_server_status.wifi_connecting = 1;
        g_temp_humi_server_status.wifi_connected = 0;
        g_temp_humi_server_status.last_error = ret;
        temp_humi_server_set_ip("0.0.0.0");
        printf("[wifi] connect failed, code=%d, retry after %d seconds\r\n",
            ret, WIFI_RETRY_INTERVAL_S);
        sleep(WIFI_RETRY_INTERVAL_S);
    }

    g_temp_humi_server_status.wifi_connecting = 0;
    g_temp_humi_server_status.wifi_connected = 1;
    temp_humi_server_set_ip(WiFi_GetLocalIP());
    printf("[wifi] connected, local ip: %s\r\n", WiFi_GetLocalIP());

    server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0) {
        g_temp_humi_server_status.last_error = -1;
        printf("[tcp] create socket failed\r\n");
        return -1;
    }

    (void)setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    (void)memset_s(&server_addr, sizeof(server_addr), 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(TEMP_HUMI_SERVER_PORT);
    server_addr.sin_addr.s_addr = htonl(INADDR_ANY);

    ret = bind(server_fd, (struct sockaddr *)&server_addr, sizeof(server_addr));
    if (ret < 0) {
        g_temp_humi_server_status.last_error = -2;
        printf("[tcp] bind port %d failed\r\n", TEMP_HUMI_SERVER_PORT);
        close(server_fd);
        return -1;
    }

    ret = listen(server_fd, 2);
    if (ret < 0) {
        g_temp_humi_server_status.last_error = -3;
        printf("[tcp] listen failed\r\n");
        close(server_fd);
        return -1;
    }

    g_temp_humi_server_status.tcp_listening = 1;
    printf("[tcp] server listening on %s:%d\r\n",
        WiFi_GetLocalIP(), TEMP_HUMI_SERVER_PORT);
    printf("[tcp] connect and wait for DATA / ALARM text lines.\r\n");

    while (1) {
        client_addr_len = sizeof(client_addr);
        client_fd = accept(server_fd, (struct sockaddr *)&client_addr, &client_addr_len);
        if (client_fd < 0) {
            g_temp_humi_server_status.last_error = -4;
            printf("[tcp] accept failed\r\n");
            sleep(1);
            continue;
        }

        g_temp_humi_server_status.tcp_client_connected = 1;
        g_temp_humi_server_status.last_error = 0;
        sensor_ready = 0;
        dht11_ready_reported = 0;
        printf("[tcp] client connected\r\n");

        if (send_boot_text(client_fd) != 0) {
            printf("[tcp] send boot text failed\r\n");
            close(client_fd);
            g_temp_humi_server_status.tcp_client_connected = 0;
            continue;
        }

        while (1) {
            if (!sensor_ready) {
                if (dht11_init() != 0) {
                    g_temp_humi_server_status.dht11_ready = 0;
                    g_temp_humi_server_status.last_error = -5;
                    temp_humi_server_set_alarm("DHT11_INIT_FAIL");

                    ret = send_status_text(client_fd,
                        "ALARM,type=DHT11_INIT_FAIL",
                        g_temp_humi_server_status.last_alarm,
                        0,
                        0);
                    if (ret != 0) {
                        printf("[tcp] client disconnected while DHT11 init failed\r\n");
                        break;
                    }

                    dht11_retry++;
                    printf("[dht11] init failed, retry=%u\r\n", dht11_retry);
                    sleep(1);
                    continue;
                }

                sensor_ready = 1;
                g_temp_humi_server_status.dht11_ready = 1;
                if (!dht11_ready_reported) {
                    temp_humi_server_set_alarm("NONE");
                    ret = send_status_text(client_fd,
                        "STATUS,type=DHT11_READY",
                        g_temp_humi_server_status.last_alarm,
                        g_temp_humi_server_status.last_temp,
                        g_temp_humi_server_status.last_humi);
                    if (ret != 0) {
                        printf("[tcp] client disconnected before DHT11 ready report\r\n");
                        break;
                    }
                    dht11_ready_reported = 1;
                }

                /*
                 * Match the standalone DHT11 demo's rhythm: initialize once,
                 * then wait briefly before starting periodic reads.
                 */
                sleep(1);
                continue;
            }

            if (dht11_read_data(&temp, &humi) != 0) {
                sensor_ready = 0;
                dht11_ready_reported = 0;
                g_temp_humi_server_status.dht11_ready = 0;
                g_temp_humi_server_status.last_error = -6;
                temp_humi_server_set_alarm("SENSOR_ERR");
                ret = send_status_text(client_fd,
                    "ALARM,type=SENSOR_ERR",
                    g_temp_humi_server_status.last_alarm,
                    0,
                    0);
                if (ret != 0) {
                    printf("[tcp] client disconnected while sensor read failed\r\n");
                    break;
                }

                printf("[dht11] read failed\r\n");
                sleep(SAMPLE_INTERVAL_S);
                continue;
            }

            g_temp_humi_server_status.last_error = 0;
            g_temp_humi_server_status.last_temp = temp;
            g_temp_humi_server_status.last_humi = humi;
            alarm_type = detect_alarm_type(temp, humi);
            temp_humi_server_set_alarm(alarm_type);

            ret = send_status_text(client_fd,
                "DATA",
                g_temp_humi_server_status.last_alarm,
                temp,
                humi);
            if (ret != 0) {
                printf("[tcp] client disconnected\r\n");
                break;
            }

            if (strcmp(alarm_type, "NONE") != 0) {
                ret = send_status_text(client_fd,
                    "ALARM",
                    g_temp_humi_server_status.last_alarm,
                    temp,
                    humi);
                if (ret != 0) {
                    printf("[tcp] client disconnected while alarm reported\r\n");
                    break;
                }
            }

            sleep(SAMPLE_INTERVAL_S);
        }

        g_temp_humi_server_status.tcp_client_connected = 0;
        close(client_fd);
    }

    return 0;
}
