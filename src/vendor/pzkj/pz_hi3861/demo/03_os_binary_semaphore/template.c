/**
 ****************************************************************************************************
 * @file        template.c
 * @author      普中科技
 * @version     V1.0
 * @date        2024-06-05
 * @brief       LiteOS二值信号量
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
 * 实验现象：打开串口助手，任务1在写数据时，任务2不能读，任务2在读数据时，任务1不能写；
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
uint8_t buff[20] = {0};       // 定义一个共享资源
#define TASK_STACK_SIZE 1024
#define TASK_DELAY_TIME 1 // s


/**
 * @description: 任务1
 * @param {*}
 * @return {*}
 */
void Task1(void)
{
    int i = 0;
    while (1) 
    {
        printf("enter Task 1.......\n");
        osSemaphoreAcquire(Semaphore_ID, osWaitForever); // 请求信号量 -1

        // 操作共享数据 写数据
        printf("write Buff Data: \n");
        for (i = 0; i < sizeof(buff); i++) 
        {
            buff[i] = i;
        }
        printf("\n");
        osSemaphoreRelease(Semaphore_ID); // 释放信号量 +1
        sleep(TASK_DELAY_TIME);
    }
}
/**
 * @description: 任务2
 * @param {*}
 * @return {*}
 */
void Task2(void)
{
    int i = 0;
    while (1) 
    {
        printf("enter Task 2.......\n");
        osSemaphoreAcquire(Semaphore_ID, osWaitForever); // 请求信号量 -1
        // 操作共享数据 读数据
        printf("read Buff Data: \n");
        for (i = 0; i < sizeof(buff); i++) 
        {
            printf("%d \n", buff[i]);
        }
        printf("\n");
        osSemaphoreRelease(Semaphore_ID); // 释放信号量 +1

        sleep(TASK_DELAY_TIME);
    }
}

/**
 * @description: 初始化并创建任务
 * @param {*}
 * @return {*}
 */
static void template_demo(void)
{
    printf("普中-Hi3861开发板--LiteOS二值信号量\r\n");

    // 创建信号量
    Semaphore_ID = osSemaphoreNew(1, 1, NULL); // 参数: 最大计数值，初始计数值，参数配置
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
