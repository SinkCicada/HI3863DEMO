#include <stdio.h>

#include "ohos_init.h"

#include "multi_service_hub.h"

static void multi_service_hub_demo(void)
{
    printf("PZKJ Hi3861 multi-service hub demo\r\n");
    printf("[hub] combines 45 temp/humi feedback + 47 door servo on one port\r\n");

    if (multi_service_hub_start() != 0) {
        printf("[hub] start failed\r\n");
    }
}

SYS_RUN(multi_service_hub_demo);
