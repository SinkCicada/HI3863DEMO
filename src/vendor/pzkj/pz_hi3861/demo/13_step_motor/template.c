/**
 ****************************************************************************************************
 * @file        template.c
 * @author      普中科技
 * @version     V1.0
 * @date        2024-06-05
 * @brief       步进电机实验
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
 * 实验现象：步进电机运行，K1控制方向，K2调速
 *
 ****************************************************************************************************
 */

#include <stdio.h>
#include <unistd.h>

#include "ohos_init.h"
#include "cmsis_os2.h"

#include "bsp_step_motor.h"
#include "bsp_key.h"
#include "bsp_led.h"


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
osThreadId_t STEP_MOTOR_Task_ID; //任务ID

void STEP_MOTOR_Task(void)
{
    uint8_t key=0;
    uint8_t dir=0;
	uint8_t speed=STEPMOTOR_MAXSPEED;

    step_motor_init();//步进电机初始化
    key_init();//按键初始化

    while (1) 
    {
        key=key_scan(0);//按键扫描
        if(key==KEY1_PRESS)//方向
            dir=!dir;
        else if(key==KEY2_PRESS)//加速
        {
			speed--;
			if(speed<STEPMOTOR_MAXSPEED)speed=STEPMOTOR_MINSPEED;
		}
        
        step_motor_run(8,dir,speed,1,1);
        
        usleep(10*1000);
    }
}
//任务创建
void step_motor_task_create(void)
{
    osThreadAttr_t taskOptions;
    taskOptions.name = "step_motorTask";       // 任务的名字
    taskOptions.attr_bits = 0;               // 属性位
    taskOptions.cb_mem = NULL;               // 堆空间地址
    taskOptions.cb_size = 0;                 // 堆空间大小
    taskOptions.stack_mem = NULL;            // 栈空间地址
    taskOptions.stack_size = 1024;           // 栈空间大小 单位:字节
    taskOptions.priority = osPriorityNormal; // 任务的优先级

    STEP_MOTOR_Task_ID = osThreadNew((osThreadFunc_t)STEP_MOTOR_Task, NULL, &taskOptions); // 创建任务
    if (STEP_MOTOR_Task_ID != NULL)
    {
        printf("ID = %d, Task Create OK!\n", STEP_MOTOR_Task_ID);
    }
}

/**
 * @description: 初始化并创建任务
 * @param {*}
 * @return {*}
 */
static void template_demo(void)
{
    printf("普中-Hi3861开发板--步进电机实验\r\n");
    led_task_create();//LED任务
    step_motor_task_create();//任务创建
}
SYS_RUN(template_demo);
