/**
 ****************************************************************************************************
 * @file        template.c
 * @author      普中科技
 * @version     V1.0
 * @date        2024-06-05
 * @brief       按键控制实验
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
 * 实验现象：按键KEY1控制LED开，KEY2键控制LED关
 *
 ****************************************************************************************************
 */

#include <stdio.h>
#include <unistd.h>

#include "ohos_init.h"
#include "cmsis_os2.h"

#include "bsp_key.h"
#include "bsp_led.h"


//按键控制任务
osThreadId_t KEY_Task_ID; //任务ID

void KEY_Task(void)
{
    uint8_t key=0;

    led_init();//LED初始化
    key_init();//按键初始化

    while (1) 
    {
        key=key_scan(0);//按键扫描
        if(key==KEY1_PRESS)LED(1);//点亮
        else if(key==KEY2_PRESS)LED(0);//熄灭

        usleep(10*1000);
    }
}
//按键控制任务创建
void key_task_create(void)
{
    osThreadAttr_t taskOptions;
    taskOptions.name = "keyTask";            // 任务的名字
    taskOptions.attr_bits = 0;               // 属性位
    taskOptions.cb_mem = NULL;               // 堆空间地址
    taskOptions.cb_size = 0;                 // 堆空间大小
    taskOptions.stack_mem = NULL;            // 栈空间地址
    taskOptions.stack_size = 1024;           // 栈空间大小 单位:字节
    taskOptions.priority = osPriorityNormal; // 任务的优先级

    KEY_Task_ID = osThreadNew((osThreadFunc_t)KEY_Task, NULL, &taskOptions); // 创建任务1
    if (KEY_Task_ID != NULL)
    {
        printf("ID = %d, Task Create OK!\n", KEY_Task_ID);
    }
}

/**
 * @description: 初始化并创建任务
 * @param {*}
 * @return {*}
 */
static void template_demo(void)
{
    printf("普中-Hi3861开发板--按键控制实验\r\n");

    key_task_create();//按键任务
}
SYS_RUN(template_demo);
