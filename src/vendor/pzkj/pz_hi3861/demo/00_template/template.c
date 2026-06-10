/**
 ****************************************************************************************************
 * @file        template.c
 * @author      普中科技
 * @version     V1.0
 * @date        2024-06-05
 * @brief       工程模板创建
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
 * 实验现象：LED指示灯闪烁
 *
 ****************************************************************************************************
 */

#include <stdio.h>
#include <unistd.h>

#include "ohos_init.h"
#include "cmsis_os2.h"
#include "hi_io.h"
#include "hi_gpio.h"


#define LED_PIN     HI_IO_NAME_GPIO_2 

osThreadId_t Task1_ID = 0;   //  任务1 ID
hi_gpio_value val, val_last; // GPIO的状态值
#define TASK_STACK_SIZE 1024
#define TASK_DELAY_TIME (200 * 1000)


/**
 * @description: 任务1
 * @param {*}
 * @return {*}
 */
void Task1(void)
{
    printf("enter Task 1.......\r\n");
    hi_gpio_init();                                            // GPIO初始化
    hi_io_set_pull(LED_PIN, HI_IO_PULL_DOWN);                  // 设置GPIO下拉
    hi_io_set_func(LED_PIN, HI_IO_FUNC_GPIO_2_GPIO);           // 设置IO2为GPIO功能
    hi_gpio_set_dir(LED_PIN, HI_GPIO_DIR_OUT);                 // 设置GPIO为输出模式

    while (1) 
    {
        hi_gpio_set_ouput_val(LED_PIN,1);
        printf("LED点亮\r\n");
        usleep(TASK_DELAY_TIME); // 200ms sleep
        hi_gpio_set_ouput_val(LED_PIN,0);
        printf("LED熄灭\r\n");
        usleep(TASK_DELAY_TIME);
    }
}

/**
 * @description: 初始化并创建任务
 * @param {*}
 * @return {*}
 */
static void template_demo(void)
{
    printf("普中-Hi3861开发板--工程模板\r\n");

    osThreadAttr_t taskOptions;
    taskOptions.name = "Task1";              // 任务的名字
    taskOptions.attr_bits = 0;               // 属性位
    taskOptions.cb_mem = NULL;               // 堆空间地址
    taskOptions.cb_size = 0;                 // 堆空间大小
    taskOptions.stack_mem = NULL;            // 栈空间地址
    taskOptions.stack_size = TASK_STACK_SIZE;           // 栈空间大小 单位:字节
    taskOptions.priority = osPriorityNormal; // 任务的优先级:wq

    Task1_ID = osThreadNew((osThreadFunc_t)Task1, NULL, &taskOptions); // 创建任务1
    if (Task1_ID != NULL) 
    {
        printf("ID = %d, Create Task1_ID is OK!\r\n", Task1_ID);
    }
}
SYS_RUN(template_demo);
