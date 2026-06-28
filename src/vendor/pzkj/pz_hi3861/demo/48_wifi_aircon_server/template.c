#include <stdio.h>
#include <unistd.h>

#include "cmsis_os2.h"
#include "ohos_init.h"

#include "aircon_ctrl.h"

#define AIRCON_TEST_DELAY_S 3

static osThreadId_t g_aircon_test_task_id = NULL;

static void aircon_test_task(void)
{
    int ret;

    printf("[ac-test] power-on smoke test starts in %d seconds\r\n", AIRCON_TEST_DELAY_S);
    sleep(AIRCON_TEST_DELAY_S);

    ret = aircon_ctrl_init();
    if (ret != AIRCON_CTRL_RET_OK) {
        printf("[ac-test] uart init failed, ret=%d\r\n", ret);
        return;
    }

    printf("[ac-test] sending one OFF raw code now\r\n");
    ret = aircon_ctrl_power_off();
    printf("[ac-test] send finished, ret=%d, state=%s\r\n",
        ret, aircon_ctrl_get_state_text());
}

static void wifi_aircon_demo(void)
{
    osThreadAttr_t test_task_options = {0};

    printf("PZKJ Hi3861 aircon UART smoke test\r\n");
    printf("[ac-test] wifi/tcp disabled; auto-send one verified raw code on boot\r\n");
    printf("[ac-test] wiring: GPIO0->module RX, GPIO1->module TX, GND shared\r\n");

    test_task_options.name = "airconTest";
    test_task_options.stack_size = 1024 * 4;
    test_task_options.priority = osPriorityNormal;

    g_aircon_test_task_id = osThreadNew((osThreadFunc_t)aircon_test_task,
        NULL, &test_task_options);
    if (g_aircon_test_task_id != NULL) {
        printf("[ac-test] create task success, id=%d\r\n", g_aircon_test_task_id);
    } else {
        printf("[ac-test] create task failed\r\n");
    }
}

SYS_RUN(wifi_aircon_demo);
