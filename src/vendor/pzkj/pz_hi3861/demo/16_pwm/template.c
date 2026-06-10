/**
 ****************************************************************************************************
 * @file        template.c
 * @author      普中科技
 * @version     V1.0
 * @date        2024-06-05
 * @brief       PWM呼吸灯实验
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
 * 实验现象：LED由暗变亮，再由亮变暗
 *
 ****************************************************************************************************
 */

#include <stdio.h>
#include <unistd.h>

#include "ohos_init.h"
#include "cmsis_os2.h"

#include "bsp_pwm.h"
#include "bsp_led.h"



//控制任务
osThreadId_t PWM_Task_ID; //任务ID

void PWM_Task(void)
{
    uint8_t fx=0;
	uint16_t j=0;

    led_init();//LED初始化
    pwm_init();//PWM初始化
    
    while (1) 
    {
        if(fx==0)
		{
			j+=10;
			if(j==3000)
				fx=1;
		}
		else
		{
			j-=10;
			if(j==0)
				fx=0;
		}
		pwm_set_duty(j);
        
        usleep(10*1000);
    }
}
//任务创建
void pwm_task_create(void)
{
    osThreadAttr_t taskOptions;
    taskOptions.name = "pwmTask";       // 任务的名字
    taskOptions.attr_bits = 0;               // 属性位
    taskOptions.cb_mem = NULL;               // 堆空间地址
    taskOptions.cb_size = 0;                 // 堆空间大小
    taskOptions.stack_mem = NULL;            // 栈空间地址
    taskOptions.stack_size = 1024;           // 栈空间大小 单位:字节
    taskOptions.priority = osPriorityNormal; // 任务的优先级

    PWM_Task_ID = osThreadNew((osThreadFunc_t)PWM_Task, NULL, &taskOptions); // 创建任务
    if (PWM_Task_ID != NULL)
    {
        printf("ID = %d, Task Create OK!\n", PWM_Task_ID);
    }
}

/**
 * @description: 初始化并创建任务
 * @param {*}
 * @return {*}
 */
static void template_demo(void)
{
    printf("普中-Hi3861开发板--PWM呼吸灯实验\r\n");
    pwm_task_create();//任务创建
}
SYS_RUN(template_demo);
