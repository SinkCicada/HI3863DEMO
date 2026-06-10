/**
 ****************************************************************************************************
 * @file        template.c
 * @author      普中科技
 * @version     V1.0
 * @date        2024-06-05
 * @brief       WIFI AP实验
 * @license     Copyright (c) 2024-2034, 深圳市普中科技有限公司
 ****************************************************************************************************
 * @attention
 *
 * 实验平台:普中-Hi3861
 * 在线视频:https://space.bilibili.com/2146492485
 * 公司网址:www.prechin.cn
 * 购买地址:
 *
 ****************************************************************************************************
 * 实验现象：使用手机连接开发板产生的热点信号，串口助手输出连接或断开结果信息
 *
 ****************************************************************************************************
 */

#include <stdio.h>
#include <unistd.h>

#include "ohos_init.h"
#include "cmsis_os2.h"

#include "bsp_led.h"
#include "bsp_wifi.h"


//LED任务
osThreadId_t LED_Task_ID; //led任务ID

void LED_Task(void)
{
    led_init();//LED初始化

    while (1) 
    {
        LED(1); 
        usleep(200*1000); //200ms
        LED(0);
        usleep(200*1000); //200ms
    }
}
//LED任务创建
void led_task_create(void)
{
    osThreadAttr_t taskOptions;
    taskOptions.name = "LEDTask";            // 任务的名字
    taskOptions.attr_bits = 0;               // 属性位
    taskOptions.cb_mem = NULL;               // 堆空间地址
    taskOptions.cb_size = 0;                 // 堆空间大小
    taskOptions.stack_mem = NULL;            // 栈空间地址
    taskOptions.stack_size = 1024;           // 栈空间大小 单位:字节
    taskOptions.priority = osPriorityNormal; // 任务的优先级

    LED_Task_ID = osThreadNew((osThreadFunc_t)LED_Task, NULL, &taskOptions); // 创建任务1
    if (LED_Task_ID != NULL)
    {
        printf("ID = %d, Create LED_Task_ID is OK!\n", LED_Task_ID);
    }
}

//控制任务
osThreadId_t WIFI_Task_ID; //任务ID


#define ARRAY_INDEX_0 0
#define ARRAY_INDEX_1 1
#define ARRAY_INDEX_2 2
#define ARRAY_INDEX_3 3
#define ARRAY_INDEX_4 4
#define ARRAY_INDEX_5 5

// 当 有设备连接热点时 触发的回调函数
static void connectingWiFihotspotsCallback(StationInfo *info)
{
    if (info == NULL) {
        printf("HotspotStaJoin:info is null.\n");
    } else {
        printf("New Sta Join.\n");
    }
}
// 当 有设备断开热点时 触发的回调函数
static void disconnectWiFihotspotsCallback(StationInfo *info)
{
    if (info == NULL) {
        printf(" HotspotStaLeave:info is null.\n");
    } else {
        // 打印mac地址
        printf("HotspotStaLeave: macAddress=%02X:%02X:%02X:%02X:%02X:%02X, reason=%d.\n",
               info->macAddress[ARRAY_INDEX_0],
               info->macAddress[ARRAY_INDEX_1],
               info->macAddress[ARRAY_INDEX_2],
               info->macAddress[ARRAY_INDEX_3],
               info->macAddress[ARRAY_INDEX_4],
               info->macAddress[ARRAY_INDEX_5],
               info->disconnectedReason);
    }
}
// 当 热点的状态发生改变时的回调函数
static void changeWiFiHotspotStateCallback(int state)
{
    printf("HotspotStateChanged:state is %d.", state);
    if (state == WIFI_HOTSPOT_ACTIVE) {
        printf("wifi hotspot active.\n");
    } else {
        printf("wifi hotspot noactive.\n");
    }
}

void WIFI_Task(void)
{
    WifiErrorCode result;

    // 注册WiFi事件的回调函数
    WifiEvent wifiEvent = {0};
    wifiEvent.OnHotspotStaJoin = connectingWiFihotspotsCallback;
    wifiEvent.OnHotspotStaLeave = disconnectWiFihotspotsCallback;
    wifiEvent.OnHotspotStateChanged = changeWiFiHotspotStateCallback;
    result = RegisterWifiEvent(&wifiEvent);
    if (result != WIFI_SUCCESS) 
    {
        printf(" Failed to register WiFi hotspot callback function.\n");
        return;
    }

    sleep(1); // 1 s
    
    WiFi_createHotspots("PZ_Hi3861_AP", "pz123456");
    while (1) 
    {
        sleep(1); // 1 s
    }
}
//任务创建
void wifi_task_create(void)
{
    osThreadAttr_t taskOptions;
    taskOptions.name = "wifiTask";       // 任务的名字
    taskOptions.attr_bits = 0;               // 属性位
    taskOptions.cb_mem = NULL;               // 堆空间地址
    taskOptions.cb_size = 0;                 // 堆空间大小
    taskOptions.stack_mem = NULL;            // 栈空间地址
    taskOptions.stack_size = 1024*10;           // 栈空间大小 单位:字节
    taskOptions.priority = osPriorityNormal; // 任务的优先级

    WIFI_Task_ID = osThreadNew((osThreadFunc_t)WIFI_Task, NULL, &taskOptions); // 创建任务
    if (WIFI_Task_ID != NULL)
    {
        printf("ID = %d, WIFI_Task_ID Create OK!\n", WIFI_Task_ID);
    }
}

/**
 * @description: 初始化并创建任务
 * @param {*}
 * @return {*}
 */
static void template_demo(void)
{
    printf("普中-Hi3861开发板--WIFI AP实验\r\n");
    led_task_create();
    wifi_task_create();//任务创建
}
SYS_RUN(template_demo);
