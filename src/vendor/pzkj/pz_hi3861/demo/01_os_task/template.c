/**
 ****************************************************************************************************
 * @file        template.c
 * @author      普中科技
 * @version     V1.0
 * @date        2024-06-05
 * @brief       LiteOS任务管理
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
 * 实验现象：打开串口助手，任务2运行，挂起任务1，5秒后恢复任务1运行；
 *
 ****************************************************************************************************
 */

#include <stdio.h>
#include <unistd.h>

#include "ohos_init.h"
#include "cmsis_os2.h"


osThreadId_t Task1_ID;   //  任务1 ID
osThreadId_t Task2_ID;   //  任务2 ID
#define TASK_STACK_SIZE 1024
#define TASK1_DELAY_TIME 1 // s
#define TASK2_DELAY_TIME 5 // s


/**
 * @description: 任务1
 * @param {*}
 * @return {*}
 */
void Task1(void)
{
    while (1) 
    {
        printf("Task 1.......\r\n");
        sleep(TASK1_DELAY_TIME);
    }
}

/**
 * @description: 任务2
 * @param {*}
 * @return {*}
 */
void Task2(void)
{
    uint8_t num = 0;
    while (1) {
        printf("Task 2, 开始挂起任务1\r\n");
        osThreadSuspend(Task1_ID);      // 挂起任务1
        sleep(TASK2_DELAY_TIME);        // 延时5秒钟

        printf("Task 2, 开始恢复任务1\r\n");
        osThreadResume(Task1_ID);      // 恢复任务1
        sleep(TASK2_DELAY_TIME);       // 延时5秒钟
    }
}

/**
 * @description: 初始化并创建任务
 * @param {*}
 * @return {*}
 */
static void template_demo(void)
{
    printf("普中-Hi3861开发板--LiteOS任务管理\r\n");

    osThreadAttr_t options;
    options.name = "Task1";       // 任务的名字
    options.attr_bits = 0;      // 属性位
    options.cb_mem = NULL;      // 堆空间地址
    options.cb_size = 0;        // 堆空间大小
    options.stack_mem = NULL;   // 栈空间地址
    options.stack_size = TASK_STACK_SIZE;  // 栈空间大小 单位:字节
    options.priority = osPriorityNormal;  // 任务的优先级

    Task1_ID = osThreadNew((osThreadFunc_t)Task1, NULL, &options);      // 创建任务1
    if (Task1_ID != NULL) {
        printf("ID = %d, Create Task1_ID is OK!\n", Task1_ID);
    }

    options.name = "Task2";
    options.priority = osPriorityNormal1;
    Task2_ID = osThreadNew((osThreadFunc_t)Task2, NULL, &options);      // 创建任务2
    if (Task2_ID != NULL) {
        printf("ID = %d, Create Task2_ID is OK!\n", Task2_ID);
    }
}
SYS_RUN(template_demo);
