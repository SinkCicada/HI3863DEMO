/**
 ****************************************************************************************************
 * @file        template.c
 * @author      普中科技
 * @version     V1.0
 * @date        2024-06-05
 * @brief       外部中断实验
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
 * 实验现象：K1键控制LED亮，K2键控制LED灭
 *
 ****************************************************************************************************
 */

#include <stdio.h>
#include <unistd.h>

#include "ohos_init.h"
#include "cmsis_os2.h"

#include "bsp_exti.h"
#include "bsp_led.h"



//控制任务
osThreadId_t EXTI_Task_ID; //任务ID

void EXTI_Task(void)
{
    led_init();//LED初始化
    exti_init();//外部中断初始化
    
    while (1) 
    {
        usleep(10*1000);
    }
}
//任务创建
void exti_task_create(void)
{
    osThreadAttr_t taskOptions;
    taskOptions.name = "extiTask";       // 任务的名字
    taskOptions.attr_bits = 0;               // 属性位
    taskOptions.cb_mem = NULL;               // 堆空间地址
    taskOptions.cb_size = 0;                 // 堆空间大小
    taskOptions.stack_mem = NULL;            // 栈空间地址
    taskOptions.stack_size = 1024;           // 栈空间大小 单位:字节
    taskOptions.priority = osPriorityNormal; // 任务的优先级

    EXTI_Task_ID = osThreadNew((osThreadFunc_t)EXTI_Task, NULL, &taskOptions); // 创建任务
    if (EXTI_Task_ID != NULL)
    {
        printf("ID = %d, Task Create OK!\n", EXTI_Task_ID);
    }
}

/**
 * @description: 初始化并创建任务
 * @param {*}
 * @return {*}
 */
static void template_demo(void)
{
    printf("普中-Hi3861开发板--外部中断实验\r\n");
    exti_task_create();//任务创建
}
SYS_RUN(template_demo);
