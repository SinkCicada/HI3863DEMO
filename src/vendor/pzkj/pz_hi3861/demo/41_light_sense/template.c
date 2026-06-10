/**
 ****************************************************************************************************
 * @file        template.c
 * @author      普中科技
 * @version     V1.0
 * @date        2024-06-05
 * @brief       光敏传感器模块实验
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
 * 实验现象：光敏传感器模块，将ADC检测数据输出在串口助手上显示。
 *
 ****************************************************************************************************
 */

#include <stdio.h>
#include <unistd.h>

#include "ohos_init.h"
#include "cmsis_os2.h"

#include "bsp_led.h"
#include "bsp_adc.h"



osThreadId_t MODULE_Task_ID; //任务ID

void MODULE_Task(void)
{
    uint8_t i=0;
    uint16_t adc_value=0;

    led_init();//LED初始化
    adc5_init();

    while (1) 
    {
        i++;
        if(i%50==0)
        {
            adc_value=get_adc5_value();
            printf("adc_value=%d\r\n",adc_value);
        }
        usleep(10*1000);
    }
}
//任务创建
void module_task_create(void)
{
    osThreadAttr_t taskOptions;
    taskOptions.name = "ModuleTask";            // 任务的名字
    taskOptions.attr_bits = 0;               // 属性位
    taskOptions.cb_mem = NULL;               // 堆空间地址
    taskOptions.cb_size = 0;                 // 堆空间大小
    taskOptions.stack_mem = NULL;            // 栈空间地址
    taskOptions.stack_size = 1024;           // 栈空间大小 单位:字节
    taskOptions.priority = osPriorityNormal; // 任务的优先级

    MODULE_Task_ID = osThreadNew((osThreadFunc_t)MODULE_Task, NULL, &taskOptions); // 创建任务1
    if (MODULE_Task_ID != NULL)
    {
        printf("ID = %d, Create MODULE_Task_ID is OK!\n", MODULE_Task_ID);
    }
}

/**
 * @description: 初始化并创建任务
 * @param {*}
 * @return {*}
 */
static void template_demo(void)
{
    printf("普中-Hi3861开发板--光敏传感器模块实验\r\n");
    module_task_create();
}
SYS_RUN(template_demo);
