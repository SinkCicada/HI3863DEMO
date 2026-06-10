/**
 ****************************************************************************************************
 * @file        template.c
 * @author      普中科技
 * @version     V1.0
 * @date        2024-06-05
 * @brief       PS2传感器模块实验
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
 * 实验现象：PS2摇杆传感器模块操作，将检测方向通过串口监视器输出。
 *
 ****************************************************************************************************
 */

#include <stdio.h>
#include <unistd.h>

#include "ohos_init.h"
#include "cmsis_os2.h"

#include "bsp_led.h"
#include "bsp_adc.h"
#include "hi_adc.h"


//管脚定义
#define ADC0_PIN         HI_IO_NAME_GPIO_12
#define ADC6_PIN         HI_IO_NAME_GPIO_13

//ADC初始化
void adc0_6_init(void)
{
    hi_gpio_init();                                            // GPIO初始化
    hi_io_set_pull(ADC0_PIN, HI_IO_PULL_UP);                   // 设置GPIO上拉
    hi_io_set_pull(ADC6_PIN, HI_IO_PULL_UP);                   // 设置GPIO上拉
}
//读取AD值
uint16_t get_adc0_value(void)
{
    uint16_t data;
    hi_adc_read(HI_ADC_CHANNEL_0,&data,HI_ADC_EQU_MODEL_8,HI_ADC_CUR_BAIS_DEFAULT,0xff);
    return data;
}
uint16_t get_adc6_value(void)
{
    uint16_t data;
    hi_adc_read(HI_ADC_CHANNEL_6,&data,HI_ADC_EQU_MODEL_8,HI_ADC_CUR_BAIS_DEFAULT,0xff);
    return data;
}

//数据范围映射
int ratio_map(int x,int in_min,int in_max,int out_min,int out_max)
{
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
//方向判断
int direction(void)
{
    char i=0;
    int adcx=0;
    int adcy=0;
    int adcsw=0;

    adcx=get_adc0_value();//读取ADC值
    adcx = ratio_map(adcx, 0, 4095, 0, 255);
    
    adcy=get_adc5_value();//读取ADC值
    adcy = ratio_map(adcy, 0, 4095, 0, 255);

    adcsw=get_adc6_value();//读取ADC值
    adcsw = ratio_map(adcsw, 0, 4095, 0, 255);

    printf("adcx=%d\r\n",adcx);
    printf("adcy=%d\r\n",adcy);
    printf("adcsw=%d\r\n",adcsw);

    //根据输出值，自行调节阈值大小比较
    if(adcx<=30)i=1;//up方向
    else if(adcx>=120)i=2;//down方向
    else if(adcy>=120)i=3;//left方向
    else if(adcy<=30)i=4;//right方向
    else if(adcsw<=30)i=5;//Button按下

    return i;
}


osThreadId_t MODULE_Task_ID; //任务ID

void MODULE_Task(void)
{
    char *state[6]={"home","up","down","left","right","pressed"};

    led_init();//LED初始化
    adc5_init();
    adc0_6_init();

    while (1) 
    {
        printf("方向：%s\r\n",state[direction()]);
        usleep(500*1000);
    }
}
//任务创建
void module_task_create(void)
{
    osThreadAttr_t taskOptions;
    taskOptions.name = "ModuleTask";            // 任务的名字
    taskOptions.attr_bits = 0;               // 属性位
    taskOptions.cb_mem = NULL;               // 堆空间地址
    taskOptions.cb_size = 0;                 // 堆空间大小
    taskOptions.stack_mem = NULL;            // 栈空间地址
    taskOptions.stack_size = 1024;           // 栈空间大小 单位:字节
    taskOptions.priority = osPriorityNormal; // 任务的优先级

    MODULE_Task_ID = osThreadNew((osThreadFunc_t)MODULE_Task, NULL, &taskOptions); // 创建任务1
    if (MODULE_Task_ID != NULL)
    {
        printf("ID = %d, Create MODULE_Task_ID is OK!\n", MODULE_Task_ID);
    }
}

/**
 * @description: 初始化并创建任务
 * @param {*}
 * @return {*}
 */
static void template_demo(void)
{
    printf("普中-Hi3861开发板--PS2传感器模块实验\r\n");
    module_task_create();
}
SYS_RUN(template_demo);
