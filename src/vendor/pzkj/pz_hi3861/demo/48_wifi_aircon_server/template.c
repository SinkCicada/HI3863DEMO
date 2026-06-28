#include <stdio.h>
#include <unistd.h>

#include "cmsis_os2.h"
#include "ohos_init.h"

#include "wifi_aircon_server.h"

static osThreadId_t g_aircon_server_task_id = NULL;
static osThreadId_t g_aircon_status_task_id = NULL;

static void aircon_server_task(void)
{
    (void)wifi_aircon_server_start();
}

static void aircon_status_task(void)
{
    wifi_aircon_server_status_t status;

    while (1) {
        wifi_aircon_server_get_status(&status);
        printf("[ac-status] wifi_connecting=%u wifi_connected=%u tcp_listening=%u "
            "client_connected=%u state=%u baud=%u last_action=%s ip=%s port=%u last_error=%d\r\n",
            status.wifi_connecting,
            status.wifi_connected,
            status.tcp_listening,
            status.tcp_client_connected,
            status.ac_state,
            status.uart_baud,
            status.last_action,
            status.ip,
            status.server_port,
            status.last_error);
        sleep(5);
    }
}

static void wifi_aircon_demo(void)
{
    osThreadAttr_t server_task_options = {0};
    osThreadAttr_t status_task_options = {0};

    printf("PZKJ Hi3861 Wi-Fi aircon control demo\r\n");
    printf("AC power on/off use direct raw IR code over UART1\r\n");

    server_task_options.name = "airconSrv";
    server_task_options.stack_size = 1024 * 10;
    server_task_options.priority = osPriorityNormal;

    g_aircon_server_task_id = osThreadNew((osThreadFunc_t)aircon_server_task,
        NULL, &server_task_options);
    if (g_aircon_server_task_id != NULL) {
        printf("Create aircon server task success, id=%d\r\n", g_aircon_server_task_id);
    } else {
        printf("Create aircon server task failed\r\n");
    }

    status_task_options.name = "airconStat";
    status_task_options.stack_size = 1024 * 4;
    status_task_options.priority = osPriorityBelowNormal;

    g_aircon_status_task_id = osThreadNew((osThreadFunc_t)aircon_status_task,
        NULL, &status_task_options);
    if (g_aircon_status_task_id != NULL) {
        printf("Create aircon status task success, id=%d\r\n", g_aircon_status_task_id);
    } else {
        printf("Create aircon status task failed\r\n");
    }
}

SYS_RUN(wifi_aircon_demo);
