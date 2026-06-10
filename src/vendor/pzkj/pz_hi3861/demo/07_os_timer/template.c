/**
 ****************************************************************************************************
 * @file        template.c
 * @author      普中科技
 * @version     V1.0
 * @date        2024-06-05
 * @brief       LiteOS软件定时器
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
 * 实验现象：打开串口助手，任务1间隔1S输出信息，定时器间隔3S输出信息
 *
 ****************************************************************************************************
 */

#include <stdio.h>
#include <unistd.h>

#include "ohos_init.h"
#include "cmsis_os2.h"


osThreadId_t Task1_ID; //  任务1 ID
osTimerId_t Timer_ID;  // 定时器ID
#define TASK_STACK_SIZE 1024
#define TASK1_DELAY_TIME 1 // s


/**
 * @description: 任务1
 * @param {*}
 * @return {*}
 */
void Task1(void)
{
    while (1) {
        printf("enter Task 1.......\n");
        sleep(TASK1_DELAY_TIME); // 1秒
    }
}
/**
 * @description: 定时器1回调函数
 * @param {*}
 * @return {*}
 */
void timer1_Callback(void)
{
    printf("enter timer1_Callback.......\n");
}

/**
 * @description: 初始化并创建任务
 * @param {*}
 * @return {*}
 */
static void template_demo(void)
{
    printf("普中-Hi3861开发板--LiteOS软件定时器\r\n");

    Timer_ID = osTimerNew(timer1_Callback, osTimerPeriodic, NULL, NULL);       // 创建定时器
    if (Timer_ID != NULL) 
    {
        printf("ID = %d, Create Timer_ID is OK!\n", Timer_ID);

        osStatus_t timerStatus = osTimerStart(Timer_ID, 300U);      // 开始定时器， 并赋予定时器的定时值（在Hi3861中，1U=10ms，100U=1S）
        if (timerStatus != osOK) 
        {
            printf("timer is not startRun !\n");
        }
    }

    osThreadAttr_t taskOptions;
    taskOptions.name = "Task1";              // 任务的名字
    taskOptions.attr_bits = 0;               // 属性位
    taskOptions.cb_mem = NULL;               // 堆空间地址
    taskOptions.cb_size = 0;                 // 堆空间大小
    taskOptions.stack_mem = NULL;            // 栈空间地址
    taskOptions.stack_size = TASK_STACK_SIZE;           // 栈空间大小 单位:字节
    taskOptions.priority = osPriorityNormal; // 任务的优先级

    Task1_ID = osThreadNew((osThreadFunc_t)Task1, NULL, &taskOptions); // 创建任务1
    if (Task1_ID != NULL)
    {
        printf("ID = %d, Create Task1_ID is OK!\n", Task1_ID);
    }

}
SYS_RUN(template_demo);
