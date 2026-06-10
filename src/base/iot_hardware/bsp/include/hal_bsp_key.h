#ifndef __HAL_BSP_KEY_H
#define __HAL_BSP_KEY_H

#include "cmsis_os2.h"

#define KEY  HI_IO_NAME_GPIO_14 // WiFi模组的IO14引脚

/**
 * @brief  按键初始化函数
 * @note   
 * @retval None
 */
void KEY_Init(void);

/**
 * @brief  获取按键此时的状态值
 * @note   
 * @retval 
 */
uint8_t KEY_Get_Input_Value(void);

void __attribute__((weak)) gpio_callback(void *arg);
#endif

