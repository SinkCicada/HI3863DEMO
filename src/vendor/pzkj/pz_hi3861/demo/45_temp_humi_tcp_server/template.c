#include <stdio.h>
#include <unistd.h>

#include "cmsis_os2.h"
#include "ohos_init.h"

#include "bsp_led.h"
#include "temp_humi_server.h"

static osThreadId_t g_temp_humi_server_task_id = NULL;
static osThreadId_t g_status_task_id = NULL;
static osThreadId_t g_indicator_task_id = NULL;

static void temp_humi_server_task(void)
{
    temp_humi_server_start();
}

static void status_task(void)
{
    temp_humi_server_status_t status;

    while (1) {
        temp_humi_server_get_status(&status);
        printf("[status] wifi_connecting=%d, wifi_connected=%d, tcp_listening=%d, client_connected=%d, dht11_ready=%d, temp=%u, humi=%u, alarm=%s, ip=%s, port=%d, last_error=%d\r\n",
            status.wifi_connecting,
            status.wifi_connected,
            status.tcp_listening,
            status.tcp_client_connected,
            status.dht11_ready,
            status.last_temp,
            status.last_humi,
            status.last_alarm,
            status.ip,
            status.server_port,
            status.last_error);
        sleep(5);
    }
}

static void indicator_task(void)
{
    temp_humi_server_status_t status;

    led_init();

    while (1) {
        temp_humi_server_get_status(&status);

        if (!status.wifi_connected) {
            LED(1);
            usleep(120 * 1000);
            LED(0);
            usleep(120 * 1000);
            LED(1);
            usleep(120 * 1000);
            LED(0);
            usleep(640 * 1000);
            continue;
        }

        if (!status.tcp_listening) {
            LED(1);
            usleep(500 * 1000);
            LED(0);
            usleep(500 * 1000);
            continue;
        }

        LED(1);
        usleep(300 * 1000);
    }
}

static void temp_humi_tcp_server_demo(void)
{
    osThreadAttr_t task_options = {0};
    osThreadAttr_t status_task_options = {0};
    osThreadAttr_t indicator_task_options = {0};

    printf("PZKJ Hi3861 temp/humi TCP server demo\r\n");

    task_options.name = "tempHumiSrv";
    task_options.stack_size = 1024 * 10;
    task_options.priority = osPriorityNormal;

    g_temp_humi_server_task_id = osThreadNew((osThreadFunc_t)temp_humi_server_task,
        NULL, &task_options);
    if (g_temp_humi_server_task_id != NULL) {
        printf("Create temp/humi server task success, id=%d\r\n",
            g_temp_humi_server_task_id);
    } else {
        printf("Create temp/humi server task failed\r\n");
    }

    status_task_options.name = "tempHumiStat";
    status_task_options.stack_size = 1024 * 4;
    status_task_options.priority = osPriorityBelowNormal;

    g_status_task_id = osThreadNew((osThreadFunc_t)status_task, NULL, &status_task_options);
    if (g_status_task_id != NULL) {
        printf("Create status task success, id=%d\r\n", g_status_task_id);
    } else {
        printf("Create status task failed\r\n");
    }

    indicator_task_options.name = "tempHumiLed";
    indicator_task_options.stack_size = 1024 * 2;
    indicator_task_options.priority = osPriorityBelowNormal;

    g_indicator_task_id = osThreadNew((osThreadFunc_t)indicator_task,
        NULL, &indicator_task_options);
    if (g_indicator_task_id != NULL) {
        printf("Create indicator task success, id=%d\r\n", g_indicator_task_id);
    } else {
        printf("Create indicator task failed\r\n");
    }
}

SYS_RUN(temp_humi_tcp_server_demo);
