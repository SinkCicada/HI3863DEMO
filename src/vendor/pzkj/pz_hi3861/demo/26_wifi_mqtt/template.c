/**
 ****************************************************************************************************
 * @file        template.c
 * @author      普中科技
 * @version     V1.0
 * @date        2024-06-05
 * @brief       WIFI MQTT实验
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
 * 实验现象：开发板连接路由器热点，打开通信猫MQTT调试客户端和串口调试助手，连接好服务器后设置正确的订阅和发布
 *          主题即可收到消息，同时串口助手也能收到发布的消息
 *
 ****************************************************************************************************
 */

#include <stdio.h>
#include <unistd.h>

#include "ohos_init.h"
#include "cmsis_os2.h"

#include "bsp_led.h"
#include "bsp_wifi.h"
#include "bsp_mqtt.h"

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
#define WIFI_SSID "普中科技"
#define WIFI_PAWD "88888888.@"

#define SERVER_IP_ADDR "54.244.173.190"    //broker.emqx.io
#define SERVER_IP_PORT 1883
#define MQTT_TOPIC_SUB "subTopic"
#define MQTT_TOPIC_PUB "pubTopic"
#define TASK_INIT_TIME 2 // s
#define MQTT_RECV_TASK_TIME (200 * 1000) // us


osThreadId_t mqtt_send_task_id;   // mqtt订阅数据任务
osThreadId_t mqtt_recv_task_id;   // mqtt发布数据任务
int8_t mqtt_sub_payload_callback(unsigned char *topic, unsigned char *payload)
{
    printf("[info] topic:[%s]    recv<== %s\r\n", topic, payload);
}
void mqtt_recv_task(void)
{
    while (1) 
    {
        MQTTClient_sub();
        usleep(MQTT_RECV_TASK_TIME);
    }
}

void mqtt_send_task(void)
{
    uint8_t res=0;

    // 连接Wifi
    if (WiFi_connectHotspots(WIFI_SSID, WIFI_PAWD) != WIFI_SUCCESS) 
    {
        printf("[error] WiFi_connectHotspots\r\n");
    }

    // 连接MQTT服务器
    if (MQTTClient_connectServer(SERVER_IP_ADDR, SERVER_IP_PORT) != 0) 
    {
        printf("[error] MQTTClient_connectServer\r\n");
    } 
    else 
    {
        printf("[success] MQTTClient_connectServer\r\n");
    }
    sleep(TASK_INIT_TIME);

    // 初始化MQTT客户端
    if (MQTTClient_init("mqtt_client_123", "username", "password") != 0) 
    {
        printf("[error] MQTTClient_init\r\n");
    } 
    else 
    {
        printf("[success] MQTTClient_init\r\n");
    }
    sleep(TASK_INIT_TIME);

    // 订阅Topic
    if (MQTTClient_subscribe(MQTT_TOPIC_SUB) != 0) 
    {
        printf("[error] MQTTClient_subscribe\r\n");
    } 
    else 
    {
        printf("[success] MQTTClient_subscribe\r\n");
    }
    sleep(TASK_INIT_TIME); 

    osThreadAttr_t options;
    options.name = "mqtt_recv_task";
    options.attr_bits = 0;
    options.cb_mem = NULL;
    options.cb_size = 0;
    options.stack_mem = NULL;
    options.stack_size = 1024*5;
    options.priority = osPriorityNormal;

    mqtt_recv_task_id = osThreadNew((osThreadFunc_t)mqtt_recv_task, NULL, &options);
    if (mqtt_recv_task_id != NULL) 
    {
        printf("ID = %d, Create mqtt_recv_task_id is OK!\r\n", mqtt_recv_task_id);
    }

    while (1) 
    {
        MQTTClient_pub(MQTT_TOPIC_PUB, "hello world!!!", strlen("hello world!!!"));
        sleep(TASK_INIT_TIME);
    }
}
//任务创建
void wifi_mqtt_task_create(void)
{
    osThreadAttr_t taskOptions;
    p_MQTTClient_sub_callback = &mqtt_sub_payload_callback;
    taskOptions.name = "mqttTask";       // 任务的名字
    taskOptions.attr_bits = 0;               // 属性位
    taskOptions.cb_mem = NULL;               // 堆空间地址
    taskOptions.cb_size = 0;                 // 堆空间大小
    taskOptions.stack_mem = NULL;            // 栈空间地址
    taskOptions.stack_size = 1024*5;           // 栈空间大小 单位:字节
    taskOptions.priority = osPriorityNormal; // 任务的优先级

    mqtt_send_task_id = osThreadNew((osThreadFunc_t)mqtt_send_task, NULL, &taskOptions); // 创建任务
    if (mqtt_send_task_id != NULL)
    {
        printf("ID = %d, mqtt_send_task_id Create OK!\n", mqtt_send_task_id);
    }
}

/**
 * @description: 初始化并创建任务
 * @param {*}
 * @return {*}
 */
static void template_demo(void)
{
    printf("普中-Hi3861开发板--WIFI MQTT实验\r\n");
    led_task_create();
    wifi_mqtt_task_create();//任务创建
}
SYS_RUN(template_demo);
