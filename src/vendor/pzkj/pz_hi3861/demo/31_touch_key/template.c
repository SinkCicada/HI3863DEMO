/**
 ****************************************************************************************************
 * @file        template.c
 * @author      普中科技
 * @version     V1.0
 * @date        2024-06-05
 * @brief       电容触摸按键实验
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
 * 实验现象：电容触摸按键，控制LED指示灯亮灭。
 *
 ****************************************************************************************************
 */

#include <stdio.h>
#include <unistd.h>

#include "ohos_init.h"
#include "cmsis_os2.h"

#include "bsp_led.h"



//管脚定义
#define TOUCH_KEY_PIN         HI_IO_NAME_GPIO_11
#define TOUCH_KEY_GPIO_FUN    HI_IO_FUNC_GPIO_11_GPIO

//传感器模块初始化
void pz_module_init(void)
{
    hi_gpio_init();                                            // GPIO初始化
    hi_io_set_pull(TOUCH_KEY_PIN, HI_IO_PULL_NONE);                   // 设置GPIO上拉
    hi_io_set_func(TOUCH_KEY_PIN, TOUCH_KEY_GPIO_FUN);                   // 设置IO为GPIO功能
    hi_gpio_set_dir(TOUCH_KEY_PIN, HI_GPIO_DIR_IN);                // 设置GPIO为输入模式
}

osThreadId_t TOUCH_KEY_Task_ID; //任务ID

void TOUCH_KEY_Task(void)
{
    uint8_t key=0;
    uint8_t value=0;

    led_init();//LED初始化
    pz_module_init();

    while (1) 
    {
        hi_gpio_get_input_val(TOUCH_KEY_PIN,&key);
        if(key==1)LED(1);
        else LED(0);
        usleep(10*1000);
    }
}
//任务创建
void tpuch_key_task_create(void)
{
    osThreadAttr_t taskOptions;
    taskOptions.name = "TouchkeyTask";            // 任务的名字
    taskOptions.attr_bits = 0;               // 属性位
    taskOptions.cb_mem = NULL;               // 堆空间地址
    taskOptions.cb_size = 0;                 // 堆空间大小
    taskOptions.stack_mem = NULL;            // 栈空间地址
    taskOptions.stack_size = 1024;           // 栈空间大小 单位:字节
    taskOptions.priority = osPriorityNormal; // 任务的优先级

    TOUCH_KEY_Task_ID = osThreadNew((osThreadFunc_t)TOUCH_KEY_Task, NULL, &taskOptions); // 创建任务1
    if (TOUCH_KEY_Task_ID != NULL)
    {
        printf("ID = %d, Create TOUCH_KEY_Task_ID is OK!\n", TOUCH_KEY_Task_ID);
    }
}

/**
 * @description: 初始化并创建任务
 * @param {*}
 * @return {*}
 */
static void template_demo(void)
{
    printf("普中-Hi3861开发板--电容触摸按键实验\r\n");
    tpuch_key_task_create();
}
SYS_RUN(template_demo);
