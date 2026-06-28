#include <stdio.h>
#include <unistd.h>

#include "cmsis_os2.h"
#include "ohos_init.h"

#include "led_ctrl.h"
#include "wifi_led_server.h"

static osThreadId_t g_wifi_server_task_id = NULL;
static osThreadId_t g_status_task_id = NULL;

static void wifi_server_task(void)
{
    wifi_led_server_start();
}

static void status_task(void)
{
    wifi_led_server_status_t status;

    while (1) {
        wifi_led_server_get_status(&status);
        printf("[status] room0_brightness=%u, room1_brightness=%u, room2_brightness=%u, human0=%u, human1=%u, human2=%u, wifi_connecting=%d, wifi_connected=%d, ip=%s, tcp_listening=%d, client_connected=%d, port=%d, last_error=%d\r\n",
            led_ctrl_get_brightness(0),
            led_ctrl_get_brightness(1),
            led_ctrl_get_brightness(2),
            led_ctrl_get_human_detect(0),
            led_ctrl_get_human_detect(1),
            led_ctrl_get_human_detect(2),
            status.wifi_connecting,
            status.wifi_connected,
            status.ip,
            status.tcp_listening,
            status.tcp_client_connected,
            status.server_port,
            status.last_error);
        sleep(5);
    }
}

static void wifi_led_server_demo(void)
{
    osThreadAttr_t task_options = {0};
    osThreadAttr_t status_task_options = {0};

    printf("PZKJ Hi3861 Wi-Fi LED server protocol demo\r\n");

    led_ctrl_init();
    printf("[boot] rooms 0/1/2 default brightness=0, human_detect=0\r\n");

    task_options.name = "wifiLedSrv";
    task_options.stack_size = 1024 * 10;
    task_options.priority = osPriorityNormal;

    g_wifi_server_task_id = osThreadNew((osThreadFunc_t)wifi_server_task, NULL, &task_options);
    if (g_wifi_server_task_id != NULL) {
        printf("Create wifi server task success, id=%d\r\n", g_wifi_server_task_id);
    } else {
        printf("Create wifi server task failed\r\n");
    }

    status_task_options.name = "wifiLedStat";
    status_task_options.stack_size = 1024 * 4;
    status_task_options.priority = osPriorityBelowNormal;

    g_status_task_id = osThreadNew((osThreadFunc_t)status_task, NULL, &status_task_options);
    if (g_status_task_id != NULL) {
        printf("Create status task success, id=%d\r\n", g_status_task_id);
    } else {
        printf("Create status task failed\r\n");
    }
}

SYS_RUN(wifi_led_server_demo);
