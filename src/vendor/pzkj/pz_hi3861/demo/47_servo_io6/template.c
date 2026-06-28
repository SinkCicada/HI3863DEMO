#include <stdio.h>
#include <unistd.h>

#include "cmsis_os2.h"
#include "ohos_init.h"

#include "door_ctrl.h"
#include "servo_io6.h"
#include "wifi_door_server.h"

static osThreadId_t g_wifi_server_task_id = NULL;
static osThreadId_t g_status_task_id = NULL;

static void wifi_server_task(void)
{
    wifi_door_server_start();
}

static void status_task(void)
{
    wifi_door_server_status_t status;

    while (1) {
        wifi_door_server_get_status(&status);
        printf("[status] door_state=%u, angle=%u, wifi_connecting=%d, wifi_connected=%d, tcp_listening=%d, client_connected=%d, ip=%s, port=%d, last_error=%d\r\n",
            status.door_state,
            status.door_angle,
            status.wifi_connecting,
            status.wifi_connected,
            status.tcp_listening,
            status.tcp_client_connected,
            status.ip,
            status.server_port,
            status.last_error);
        sleep(5);
    }
}

static void servo_io6_demo(void)
{
    osThreadAttr_t task_options = {0};
    osThreadAttr_t status_task_options = {0};

    printf("PZKJ Hi3861 Wi-Fi door servo demo\r\n");
    printf("[boot] default door state=CLOSED angle=99\r\n");

    door_ctrl_init();

    task_options.name = "wifiDoorSrv";
    task_options.stack_size = 1024 * 10;
    task_options.priority = osPriorityNormal;

    g_wifi_server_task_id = osThreadNew((osThreadFunc_t)wifi_server_task, NULL, &task_options);
    if (g_wifi_server_task_id != NULL) {
        printf("Create wifi door server task success, id=%d\r\n", g_wifi_server_task_id);
    } else {
        printf("Create wifi door server task failed\r\n");
    }

    status_task_options.name = "wifiDoorStat";
    status_task_options.stack_size = 1024 * 4;
    status_task_options.priority = osPriorityBelowNormal;

    g_status_task_id = osThreadNew((osThreadFunc_t)status_task, NULL, &status_task_options);
    if (g_status_task_id != NULL) {
        printf("Create status task success, id=%d\r\n", g_status_task_id);
    } else {
        printf("Create status task failed\r\n");
    }
}

SYS_RUN(servo_io6_demo);
