/**
 ****************************************************************************************************
 * @file        template.c
 * @author      普中科技
 * @version     V1.0
 * @date        2024-06-05
 * @brief       LiteOS计数信号量
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
 * 实验现象：打开串口助手，任务 1 中每隔一秒释放信号量，信号量的计
            数值会加 1（相当于进入了一辆车）；任务 2 中每隔两秒钟请求信号量，信号量的计数值会减 1（相当于出
            去了 1 辆车）
 *
 ****************************************************************************************************
 */

#include <stdio.h>
#include <unistd.h>

#include "ohos_init.h"
#include "cmsis_os2.h"


osThreadId_t Task1_ID;        //  任务1 ID
osThreadId_t Task2_ID;        //  任务2 ID
osSemaphoreId_t Semaphore_ID; // 信号量ID
#define SEM_MAX_COUNT 10
#define TASK_STACK_SIZE (1024)
#define TASK1_DELAY_TIME 1
#define TASK2_DELAY_TIME 2


/**
 * @description: 任务1 模拟停车场的入口
 *  每隔一秒钟，停车场就会进入一辆车，信号量计数值加1
 * @param {*}
 * @return {*}
 */
void Task1(void)
{
    while (1) 
    {
        if (osSemaphoreGetCount(Semaphore_ID) < SEM_MAX_COUNT) 
        {
            if (osSemaphoreRelease(Semaphore_ID) == osOK) 
            {
                // 释放信号量 +1
                printf("[进入%d辆车, 停车场容量: %d] 信号量+1.\n", osSemaphoreGetCount(Semaphore_ID), SEM_MAX_COUNT);
            }
        } 
        else 
        {
            printf("[进入停车场失败, 请等待...]\n");
        }
        sleep(TASK1_DELAY_TIME);
    }
}
/**
 * @description: 任务2，每隔2秒请求信号量，信号量计数值-1
 * @param {*}
 * @return {*}
 */
void Task2(void)
{
    while (1) 
    {
        if (osSemaphoreAcquire(Semaphore_ID, osWaitForever) == osOK) 
        {
            // 释放信号量 -1
            printf("[出去1辆车, 剩余停车场容量: %d] 信号量-1.\n", osSemaphoreGetCount(Semaphore_ID));
        } 
        else 
        {
            printf("[出停车场失败]\n");
        }

        sleep(TASK2_DELAY_TIME);
    }
}

/**
 * @description: 初始化并创建任务
 * @param {*}
 * @return {*}
 */
static void template_demo(void)
{
    printf("普中-Hi3861开发板--LiteOS计数信号量\r\n");

    // 创建信号量    一个停车场最多可以停10辆车，
    Semaphore_ID = osSemaphoreNew(SEM_MAX_COUNT - 1, 0, NULL); // 参数: 最大计数值，初始计数值，参数配置
    if (Semaphore_ID != NULL) 
    {
        printf("ID = %d, Create Semaphore_ID is OK!\n", Semaphore_ID);
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

    taskOptions.name = "Task2";                                        // 任务的名字
    taskOptions.priority = osPriorityNormal;                           // 任务的优先级
    Task2_ID = osThreadNew((osThreadFunc_t)Task2, NULL, &taskOptions); // 创建任务2
    if (Task2_ID != NULL) 
    {
        printf("ID = %d, Create Task2_ID is OK!\n", Task2_ID);
    }
}
SYS_RUN(template_demo);
