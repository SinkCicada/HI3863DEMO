/**
 ****************************************************************************************************
 * @file        template.c
 * @author      普中科技
 * @version     V1.0
 * @date        2024-06-05
 * @brief       DHT11温湿度传感器实验
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
 * 实验现象：串口输出DHT11采集温度和湿度
 *
 ****************************************************************************************************
 */

#include <stdio.h>
#include <unistd.h>

#include "ohos_init.h"
#include "cmsis_os2.h"

#include "bsp_led.h"
#include "bsp_dht11.h"


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
osThreadId_t DHT11_Task_ID; //任务ID

void DHT11_Task(void)
{
    static uint8_t i=0;
    uint8_t temp;  	    
	uint8_t humi;

    while(dht11_init())
	{
		printf("DHT11检测失败，请插好!\r\n");
		usleep(500*1000); //500ms
	}
	printf("DHT11检测成功!\r\n");

    while (1) 
    {
        i++;
        if(i%50==0)
        {
            dht11_read_data(&temp,&humi);
			printf("温度=%d°C  湿度=%d%%RH\r\n",temp,humi);
        }

        usleep(10*1000); //10ms
    }
}
//任务创建
void dht11_task_create(void)
{
    osThreadAttr_t taskOptions;
    taskOptions.name = "dht11Task";       // 任务的名字
    taskOptions.attr_bits = 0;               // 属性位
    taskOptions.cb_mem = NULL;               // 堆空间地址
    taskOptions.cb_size = 0;                 // 堆空间大小
    taskOptions.stack_mem = NULL;            // 栈空间地址
    taskOptions.stack_size = 1024;           // 栈空间大小 单位:字节
    taskOptions.priority = osPriorityNormal1; // 任务的优先级

    LED_Task_ID = osThreadNew((osThreadFunc_t)DHT11_Task, NULL, &taskOptions); // 创建任务
    if (LED_Task_ID != NULL)
    {
        printf("ID = %d, LED_Task_ID Create OK!\n", LED_Task_ID);
    }
}

/**
 * @description: 初始化并创建任务
 * @param {*}
 * @return {*}
 */
static void template_demo(void)
{
    printf("普中-Hi3861开发板--DHT11温湿度传感器实验\r\n");
    led_task_create();
    dht11_task_create();//任务创建
}
SYS_RUN(template_demo);
