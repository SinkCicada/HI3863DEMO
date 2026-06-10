/**
 ****************************************************************************************************
 * @file        template.c
 * @author      普中科技
 * @version     V1.0
 * @date        2024-06-05
 * @brief       WIFI STA实验
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
 * 实验现象：开发板连接外部WIFI热点信号，串口输出对应状态信息和连接IP地址
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


#define WIFI_SSID "普中科技"
#define WIFI_PAWD "88888888.@"

void WIFI_Task(void)
{
    WifiErrorCode result;
    WiFi_connectHotspots(WIFI_SSID, WIFI_PAWD);
    while (1) 
    {
        sleep(1); // 1s
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
    printf("普中-Hi3861开发板--WIFI Sta实验\r\n");
    led_task_create();
    wifi_task_create();//任务创建
}
SYS_RUN(template_demo);
