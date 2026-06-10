/**
 ****************************************************************************************************
 * @file        template.c
 * @author      普中科技
 * @version     V1.0
 * @date        2024-06-05
 * @brief       LiteOS消息队列
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
 * 实验现象：打开串口助手，任务1发送消息成功后，任务2接收消息；
 *
 ****************************************************************************************************
 */

#include <stdio.h>
#include <unistd.h>

#include "ohos_init.h"
#include "cmsis_os2.h"


osThreadId_t Task1_ID; //  任务1 ID
osThreadId_t Task2_ID; //  任务2 ID
osMessageQueueId_t MsgQueue_ID; // 消息队列的ID
#define TASK_STACK_SIZE (1024)
#define TASK_DELAY_TIME 1 // s
#define MESSAGE_TIMEOUT 100
#define MsgQueueObjectNumber 16       // 定义消息队列对象的个数
typedef struct message_people 
{
    uint8_t id;     // ID
    uint8_t age;    // 年龄
    char *name;     // 名字
}msg_people_t;
msg_people_t msg_people;


/**
 * @description: 任务1 发送消息
 * @param {*}
 * @return {*}
 */
void Task1(void)
{
    osStatus_t msgStatus;
    while (1) 
    {
        printf("enter Task 1.......\n");
        msg_people.id = 0;
        msg_people.age = 16; // 年龄 16岁
        msg_people.name = "xiao_ming";
        msgStatus = osMessageQueuePut(MsgQueue_ID, &msg_people, 0, MESSAGE_TIMEOUT);
        if (msgStatus == osOK) 
        {
            printf("osMessageQueuePut is ok.\n");
        }
        sleep(TASK_DELAY_TIME);
    }
}
/**
 * @description: 任务2 接收消息
 * @param {*}
 * @return {*}
 */
void Task2(void)
{
    osStatus_t msgStatus;
    while (1) 
    {
        printf("enter Task 2.......\n");
        msgStatus = osMessageQueueGet(MsgQueue_ID, &msg_people, 0, MESSAGE_TIMEOUT);
        if (msgStatus == osOK) 
        {
            printf("osMessageQueueGet is ok.\n");
            printf("Recv: id = %d, age = %d, name = %s\n", msg_people.id, msg_people.age, msg_people.name);
        }
    }
}

/**
 * @description: 初始化并创建任务
 * @param {*}
 * @return {*}
 */
static void template_demo(void)
{
    printf("普中-Hi3861开发板--LiteOS消息队列\r\n");

    // 创建消息队列 消息队列中的消息个数，消息队列中的消息大小，属性
    MsgQueue_ID = osMessageQueueNew(MsgQueueObjectNumber, sizeof(msg_people_t), NULL);
    if (MsgQueue_ID != NULL) {
        printf("ID = %d, Create MsgQueue_ID is OK!\n", MsgQueue_ID);
    }

    osThreadAttr_t taskOptions;
    taskOptions.name = "Task1";              // 任务的名字
    taskOptions.attr_bits = 0;               // 属性位
    taskOptions.cb_mem = NULL;               // 堆空间地址
    taskOptions.cb_size = 0;                 // 堆空间大小
    taskOptions.stack_mem = NULL;            // 栈空间地址
    taskOptions.stack_size = TASK_STACK_SIZE; // 栈空间大小 单位:字节
    taskOptions.priority = osPriorityNormal; // 任务的优先级

    Task1_ID = osThreadNew((osThreadFunc_t)Task1, NULL, &taskOptions);      // 创建任务1
    if (Task1_ID != NULL) {
        printf("ID = %d, Create Task1_ID is OK!\n", Task1_ID);
    }

    taskOptions.name = "Task2";              // 任务的名字
    taskOptions.priority = osPriorityNormal; // 任务的优先级
    Task2_ID = osThreadNew((osThreadFunc_t)Task2, NULL, &taskOptions);      // 创建任务2
    if (Task2_ID != NULL) 
    {
        printf("ID = %d, Create Task2_ID is OK!\n", Task2_ID);
    }
}
SYS_RUN(template_demo);
