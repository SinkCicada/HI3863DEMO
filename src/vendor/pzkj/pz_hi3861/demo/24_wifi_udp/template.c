/**
 ****************************************************************************************************
 * @file        template.c
 * @author      普中科技
 * @version     V1.0
 * @date        2024-06-05
 * @brief       WIFI UDP实验
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
 * 实验现象：开发板连接路由器热点，打开网络调试助手，选择UDP协议连接，即可与开发板进行UDP通信
 *
 ****************************************************************************************************
 */

#include <stdio.h>
#include <unistd.h>

#include "ohos_init.h"
#include "cmsis_os2.h"

#include "bsp_led.h"
#include "bsp_wifi.h"
#include "lwip/netifapi.h"
#include "lwip/sockets.h"
#include "lwip/api_shell.h"


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
osThreadId_t WIFI_Task_ID; //任务ID

#define WIFI_SSID "普中科技"
#define WIFI_PAWD "88888888.@"

#define UDP_SERVER_IP "192.168.101.16"
#define UDP_SERVER_PORT 8000

void WIFI_Task(void)
{
    int socket_fd = 0;
    int result;

    // 服务器的地址信息
    struct sockaddr_in send_addr;
    socklen_t addr_length = sizeof(send_addr);
    char recvBuf[512];

    // 连接Wifi
    WiFi_connectHotspots(WIFI_SSID, WIFI_PAWD);

    // 创建socket
    if ((socket_fd = socket(AF_INET, SOCK_DGRAM, 0)) == -1) 
    {
        printf("create socket failed!\r\n");
        return;
    }

    // 初始化预连接的服务端地址
    send_addr.sin_family = AF_INET;                        // IPV4
    send_addr.sin_port = htons(UDP_SERVER_PORT);           // 远端服务器的端口号
    send_addr.sin_addr.s_addr = inet_addr(UDP_SERVER_IP); // 远端服务器的IP地址
    addr_length = sizeof(send_addr);

    // 发送数据到服务远端
    result = sendto(socket_fd, "hello prechin\r\n", strlen("hello prechin\r\n"), 0,
                    (struct sockaddr *)&send_addr, addr_length);
    if (result) 
    {
        printf("result: %d, sendData:%s\r\n", result, "hello prechin");
    }
    while (1) 
    {
        memset_s(recvBuf, sizeof(recvBuf), 0, sizeof(recvBuf));

        // 接收服务端返回的字符串
        result = recvfrom(socket_fd, recvBuf, sizeof(recvBuf), 0, (struct sockaddr *)&send_addr, &addr_length);
        if (result > 0) 
        {
            // 发送数据到服务远端
            result = sendto(socket_fd, recvBuf, sizeof(recvBuf), 0, (struct sockaddr *)&send_addr, addr_length);
            if (result) 
            {
                printf("result: %d, sendData:%s\r\n", result, recvBuf);
            }
        }
        sleep(1);
    }

    // 关闭这个 socket
    closesocket(socket_fd);
}
//任务创建
void wifi_task_create(void)
{
    osThreadAttr_t taskOptions;
    taskOptions.name = "wifiTask";       // 任务的名字
    taskOptions.attr_bits = 0;               // 属性位
    taskOptions.cb_mem = NULL;               // 堆空间地址
    taskOptions.cb_size = 0;                 // 堆空间大小
    taskOptions.stack_mem = NULL;            // 栈空间地址
    taskOptions.stack_size = 1024*10;           // 栈空间大小 单位:字节
    taskOptions.priority = osPriorityNormal; // 任务的优先级

    WIFI_Task_ID = osThreadNew((osThreadFunc_t)WIFI_Task, NULL, &taskOptions); // 创建任务
    if (WIFI_Task_ID != NULL)
    {
        printf("ID = %d, WIFI_Task_ID Create OK!\n", WIFI_Task_ID);
    }
}

/**
 * @description: 初始化并创建任务
 * @param {*}
 * @return {*}
 */
static void template_demo(void)
{
    printf("普中-Hi3861开发板--WIFI UDP实验\r\n");
    led_task_create();
    wifi_task_create();//任务创建
}
SYS_RUN(template_demo);
