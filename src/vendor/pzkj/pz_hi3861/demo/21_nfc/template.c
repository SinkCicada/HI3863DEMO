/**
 ****************************************************************************************************
 * @file        template.c
 * @author      普中科技
 * @version     V1.0
 * @date        2024-06-05
 * @brief       NFC实验
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
 * 实验现象：通过手机NFC APP向 NFC 标签中写入数据，并且读取 NFC 标签中的数据，通过串口助手输出。
 *
 ****************************************************************************************************
 */

#include <stdio.h>
#include <unistd.h>

#include "ohos_init.h"
#include "cmsis_os2.h"

#include "bsp_led.h"
#include "bsp_nfc.h"


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
osThreadId_t NFC_Task_ID; //任务ID

void NFC_Task(void)
{
    uint8_t ret, num = 0;
    uint8_t ndefLen = 0;      // ndef包的长度
    uint8_t ndef_Header = 0;  // ndef消息开始标志位-用不到
    uint32_t result_code = 0; // 函数的返回值
    uint8_t i=0;
    
    nfc_init();

    // 读整个数据的包头部分，读出整个数据的长度
    if (result_code = NT3HReadHeaderNfc(&ndefLen, &ndef_Header) != true) 
    {
        printf("NT3HReadHeaderNfc is failed. result_code = %d\r\n", result_code);
        return;
    }

    ndefLen += NDEF_HEADER_SIZE; // 加上头部字节
    if (ndefLen <= NDEF_HEADER_SIZE) 
    {
        printf("ndefLen <= 2\r\n");
        return;
    }
    uint8_t *ndefBuff = (uint8_t *)malloc(ndefLen + 1);
    if (ndefBuff == NULL) 
    {
        printf("ndefBuff malloc is Falied!\r\n");
        return;
    }

    if (result_code = get_NDEFDataPackage(ndefBuff, ndefLen) != HI_ERR_SUCCESS) 
    {
        printf("get_NDEFDataPackage is failed. result_code = %d\r\n", result_code);
        return;
    }

    printf("start print ndefBuff.\r\n");
    for (i = 0; i < ndefLen; i++) 
    {
        printf("0x%x ", ndefBuff[i]);
    }
    
    while (1) 
    {
        usleep(10*1000); //10ms
    }
}
//任务创建
void nfc_task_create(void)
{
    osThreadAttr_t taskOptions;
    taskOptions.name = "nfcTask";       // 任务的名字
    taskOptions.attr_bits = 0;               // 属性位
    taskOptions.cb_mem = NULL;               // 堆空间地址
    taskOptions.cb_size = 0;                 // 堆空间大小
    taskOptions.stack_mem = NULL;            // 栈空间地址
    taskOptions.stack_size = 1024*5;           // 栈空间大小 单位:字节
    taskOptions.priority = osPriorityNormal; // 任务的优先级

    NFC_Task_ID = osThreadNew((osThreadFunc_t)NFC_Task, NULL, &taskOptions); // 创建任务
    if (NFC_Task_ID != NULL)
    {
        printf("ID = %d, NFC_Task_ID Create OK!\n", NFC_Task_ID);
    }
}

/**
 * @description: 初始化并创建任务
 * @param {*}
 * @return {*}
 */
static void template_demo(void)
{
    printf("普中-Hi3861开发板--NFC实验\r\n");
    led_task_create();
    nfc_task_create();//任务创建
}
SYS_RUN(template_demo);
