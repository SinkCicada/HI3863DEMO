/**
 ****************************************************************************************************
 * @file        template.c
 * @author      普中科技
 * @version     V1.0
 * @date        2024-06-05
 * @brief       继电器实验
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
 * 实验现象：继电器通电一段时间后断开
 *
 ****************************************************************************************************
 */

#include <stdio.h>
#include <unistd.h>

#include "ohos_init.h"
#include "cmsis_os2.h"

#include "bsp_relay.h"


//继电器任务
osThreadId_t RELAY_Task_ID; //任务ID

void RELAY_Task(void)
{
    relay_init();//继电器初始化
    RELAY(1);//继电器吸合
    sleep(3);//延时3S
    RELAY(0);//继电器断开
    while (1) 
    {
        usleep(10*1000);
    }
}
//继电器任务创建
void relay_task_create(void)
{
    osThreadAttr_t taskOptions;
    taskOptions.name = "RELAYTask";            // 任务的名字
    taskOptions.attr_bits = 0;               // 属性位
    taskOptions.cb_mem = NULL;               // 堆空间地址
    taskOptions.cb_size = 0;                 // 堆空间大小
    taskOptions.stack_mem = NULL;            // 栈空间地址
    taskOptions.stack_size = 1024;           // 栈空间大小 单位:字节
    taskOptions.priority = osPriorityNormal; // 任务的优先级

    RELAY_Task_ID = osThreadNew((osThreadFunc_t)RELAY_Task, NULL, &taskOptions); // 创建任务1
    if (RELAY_Task_ID != NULL)
    {
        printf("ID = %d, Create RELAY_Task_ID is OK!\n", RELAY_Task_ID);
    }
}

/**
 * @description: 初始化并创建任务
 * @param {*}
 * @return {*}
 */
static void template_demo(void)
{
    printf("普中-Hi3861开发板--继电器实验\r\n");

    relay_task_create();//继电器任务
}
SYS_RUN(template_demo);
