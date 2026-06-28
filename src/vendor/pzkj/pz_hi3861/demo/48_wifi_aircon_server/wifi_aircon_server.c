#include "wifi_aircon_server.h"

#include <stdio.h>
#include <string.h>
#include <unistd.h>

#include "aircon_ctrl.h"
#include "bsp_wifi.h"
#include "lwip/sockets.h"
#include "securec.h"

#define WIFI_SSID "TEST-2.4GHz"
#define WIFI_PASSWORD "8888888867"
#define WIFI_RETRY_INTERVAL_S 2

#define AIRCON_TCP_PORT 8000
#define AIRCON_CMD_BUF_SIZE 64

static wifi_aircon_server_status_t g_wifi_aircon_server_status = {
    0, 0, 0, 0, 0, AIRCON_STATE_UNKNOWN, AIRCON_TCP_PORT, 0, 0, "NONE", "0.0.0.0"
};

static unsigned char ascii_upper(unsigned char ch)
{
    if (ch >= 'a' && ch <= 'z') {
        ch = (unsigned char)(ch - ('a' - 'A'));
    }
    return ch;
}

static const char *aircon_state_to_text(unsigned char state)
{
    if (state == AIRCON_STATE_ON) {
        return "ON";
    }
    if (state == AIRCON_STATE_OFF) {
        return "OFF";
    }
    return "UNKNOWN";
}

static void wifi_aircon_server_sync_status(void)
{
    g_wifi_aircon_server_status.uart_baud = aircon_ctrl_get_baud();
    g_wifi_aircon_server_status.uart_ready =
        (unsigned char)(g_wifi_aircon_server_status.uart_baud != 0);
    g_wifi_aircon_server_status.ac_state = aircon_ctrl_get_state();
}

static void wifi_aircon_server_set_ip(const char *ip)
{
    if (ip == HI_NULL || ip[0] == '\0') {
        (void)strcpy_s(g_wifi_aircon_server_status.ip,
            sizeof(g_wifi_aircon_server_status.ip), "0.0.0.0");
        return;
    }

    (void)strcpy_s(g_wifi_aircon_server_status.ip,
        sizeof(g_wifi_aircon_server_status.ip), ip);
}

static int send_all_text(int client_fd, const char *text)
{
    int total = 0;
    int text_len;

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

static int send_result_text(int client_fd, const char *result,
    const char *action, int error_code)
{
    char send_buf[192];
    int len;

    wifi_aircon_server_sync_status();
    len = sprintf_s(send_buf, sizeof(send_buf),
        "%s,type=AC,action=%s,state=%s,baud=%u,ip=%s,port=%u,error=%d\r\n",
        result,
        action,
        aircon_state_to_text(g_wifi_aircon_server_status.ac_state),
        g_wifi_aircon_server_status.uart_baud,
        g_wifi_aircon_server_status.ip,
        g_wifi_aircon_server_status.server_port,
        error_code);
    if (len <= 0) {
        return -1;
    }

    return send_all_text(client_fd, send_buf);
}

static const char *result_text_from_ret(int ret)
{
    if (ret == AIRCON_CTRL_RET_OK) {
        return "OK";
    }
    if (ret == AIRCON_CTRL_RET_SENT_NO_ACK) {
        return "WARN";
    }
    return "ERR";
}

static const char *skip_space(const char *text)
{
    while (*text == ' ' || *text == '\t') {
        ++text;
    }
    return text;
}

static void normalize_command(char *text)
{
    unsigned int i;

    for (i = 0; text[i] != '\0'; ++i) {
        if (text[i] == '\r' || text[i] == '\n') {
            text[i] = '\0';
            break;
        }
        text[i] = (char)ascii_upper((unsigned char)text[i]);
    }
}

static int handle_aircon_command(int client_fd, char *cmd_buf)
{
    const char *action;
    int ret;

    normalize_command(cmd_buf);
    action = skip_space(cmd_buf);
    if (action[0] == 'A' && action[1] == 'C' &&
        (action[2] == ' ' || action[2] == '\t')) {
        action = skip_space(action + 2);
    }

    if (strcmp(action, "ON") == 0) {
        (void)strcpy_s(g_wifi_aircon_server_status.last_action,
            sizeof(g_wifi_aircon_server_status.last_action), "ON");
        ret = aircon_ctrl_power_on();
        g_wifi_aircon_server_status.last_error = ret;
        printf("[ac-net] action=ON ret=%d\r\n", ret);
        return send_result_text(client_fd, result_text_from_ret(ret), "ON", ret);
    }

    if (strcmp(action, "OFF") == 0) {
        (void)strcpy_s(g_wifi_aircon_server_status.last_action,
            sizeof(g_wifi_aircon_server_status.last_action), "OFF");
        ret = aircon_ctrl_power_off();
        g_wifi_aircon_server_status.last_error = ret;
        printf("[ac-net] action=OFF ret=%d\r\n", ret);
        return send_result_text(client_fd, result_text_from_ret(ret), "OFF", ret);
    }

    if (strcmp(action, "QUERY") == 0 || strcmp(action, "STATUS") == 0) {
        (void)strcpy_s(g_wifi_aircon_server_status.last_action,
            sizeof(g_wifi_aircon_server_status.last_action), "QUERY");
        g_wifi_aircon_server_status.last_error = 0;
        return send_result_text(client_fd, "OK", "QUERY", 0);
    }

    g_wifi_aircon_server_status.last_error = -2;
    return send_all_text(client_fd,
        "ERR,type=AC,action=UNKNOWN,use: AC ON | AC OFF | AC QUERY\r\n");
}

void wifi_aircon_server_get_status(wifi_aircon_server_status_t *status)
{
    if (status == HI_NULL) {
        return;
    }

    wifi_aircon_server_sync_status();
    (void)memcpy_s(status, sizeof(*status),
        &g_wifi_aircon_server_status, sizeof(g_wifi_aircon_server_status));
}

int wifi_aircon_server_start(void)
{
    int server_fd;
    int client_fd;
    int opt = 1;
    int ret;
    int cmd_len;
    struct sockaddr_in server_addr;
    struct sockaddr_in client_addr;
    socklen_t client_addr_len;
    char cmd_buf[AIRCON_CMD_BUF_SIZE];

    (void)strcpy_s(g_wifi_aircon_server_status.last_action,
        sizeof(g_wifi_aircon_server_status.last_action), "BOOT");
    g_wifi_aircon_server_status.server_port = AIRCON_TCP_PORT;
    wifi_aircon_server_set_ip("0.0.0.0");

    ret = aircon_ctrl_init();
    if (ret != 0) {
        g_wifi_aircon_server_status.last_error = -10;
        return ret;
    }
    wifi_aircon_server_sync_status();

    while (1) {
        g_wifi_aircon_server_status.wifi_connecting = 1;
        printf("[ac-net] connecting to SSID: %s\r\n", WIFI_SSID);
        ret = WiFi_connectHotspots(WIFI_SSID, WIFI_PASSWORD);
        if (ret == WIFI_SUCCESS) {
            break;
        }

        g_wifi_aircon_server_status.last_error = ret;
        g_wifi_aircon_server_status.wifi_connecting = 0;
        printf("[ac-net] connect failed, code=%d, retry in %d s\r\n",
            ret, WIFI_RETRY_INTERVAL_S);
        sleep(WIFI_RETRY_INTERVAL_S);
    }

    g_wifi_aircon_server_status.wifi_connecting = 0;
    g_wifi_aircon_server_status.wifi_connected = 1;
    wifi_aircon_server_set_ip(WiFi_GetLocalIP());
    printf("[ac-net] connected, local ip: %s\r\n", g_wifi_aircon_server_status.ip);

    server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0) {
        g_wifi_aircon_server_status.last_error = -11;
        printf("[ac-net] create socket failed\r\n");
        return -1;
    }

    (void)setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
    (void)memset_s(&server_addr, sizeof(server_addr), 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(AIRCON_TCP_PORT);
    server_addr.sin_addr.s_addr = htonl(INADDR_ANY);

    ret = bind(server_fd, (struct sockaddr *)&server_addr, sizeof(server_addr));
    if (ret < 0) {
        g_wifi_aircon_server_status.last_error = -12;
        printf("[ac-net] bind port %u failed\r\n", AIRCON_TCP_PORT);
        close(server_fd);
        return -1;
    }

    ret = listen(server_fd, 2);
    if (ret < 0) {
        g_wifi_aircon_server_status.last_error = -13;
        printf("[ac-net] listen failed\r\n");
        close(server_fd);
        return -1;
    }

    g_wifi_aircon_server_status.tcp_listening = 1;
    printf("[ac-net] server listening on %s:%u\r\n",
        g_wifi_aircon_server_status.ip, AIRCON_TCP_PORT);
    printf("[ac-net] commands: AC ON | AC OFF | AC QUERY\r\n");
    printf("[ac-uart] wiring: GPIO0->module RX, GPIO1->module TX, GND shared\r\n");

    while (1) {
        client_addr_len = sizeof(client_addr);
        client_fd = accept(server_fd, (struct sockaddr *)&client_addr, &client_addr_len);
        if (client_fd < 0) {
            g_wifi_aircon_server_status.last_error = -14;
            printf("[ac-net] accept failed\r\n");
            sleep(1);
            continue;
        }

        g_wifi_aircon_server_status.tcp_client_connected = 1;
        printf("[ac-net] client accepted\r\n");
        (void)memset_s(cmd_buf, sizeof(cmd_buf), 0, sizeof(cmd_buf));
        cmd_len = recv(client_fd, cmd_buf, sizeof(cmd_buf) - 1, 0);
        if (cmd_len > 0) {
            cmd_buf[cmd_len] = '\0';
            printf("[ac-net] recv: %s\r\n", cmd_buf);
            (void)handle_aircon_command(client_fd, cmd_buf);
        } else {
            printf("[ac-net] client disconnected before command\r\n");
        }

        g_wifi_aircon_server_status.tcp_client_connected = 0;
        close(client_fd);
    }
}
