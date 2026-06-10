/**
 ****************************************************************************************************
 * @file        template.c
 * @author      普中科技
 * @version     V1.0
 * @date        2024-06-05
 * @brief       声音传感器模块实验
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
 * 实验现象：声音传感器模块，检测到有声音时，指示灯亮，一段时间后自动灭。
 *
 ****************************************************************************************************
 */

#include <stdio.h>
#include <unistd.h>

#include "ohos_init.h"
#include "cmsis_os2.h"

#include "bsp_led.h"



//管脚定义
#define MODULE_PIN         HI_IO_NAME_GPIO_11
#define MODULE_GPIO_FUN    HI_IO_FUNC_GPIO_11_GPIO

//传感器模块初始化
void pz_module_init(void)
{
    hi_gpio_init();                                            // GPIO初始化
    hi_io_set_pull(MODULE_PIN, HI_IO_PULL_NONE);                   // 设置GPIO上拉
    hi_io_set_func(MODULE_PIN, MODULE_GPIO_FUN);                   // 设置IO为GPIO功能
    hi_gpio_set_dir(MODULE_PIN, HI_GPIO_DIR_IN);                // 设置GPIO为输入模式
}

osThreadId_t MODULE_Task_ID; //任务ID

void MODULE_Task(void)
{
    uint8_t key=0;
    uint8_t value=0;

    led_init();//LED初始化
    pz_module_init();

    while (1) 
    {
        hi_gpio_get_input_val(MODULE_PIN,&key);
        if(key==0)LED(1);
        sleep(3);
        LED(0);
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
    printf("普中-Hi3861开发板--声音传感器模块实验\r\n");
    module_task_create();
}
SYS_RUN(template_demo);
