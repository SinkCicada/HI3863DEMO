#ifndef __HAL_BSP_ULTRASONIC_H__
#define __HAL_BSP_ULTRASONIC_H__

#include "cmsis_os2.h"

/**
 * @brief  超声波传感器的初始化
 * @note   初始化串口相关参数
 * @retval None
 */
void ultrasonic_init(void);

/**
 * @brief 读超声波传感器的数据
 * @note
 * @retval 返回: 距离(mm)
 */
uint16_t read_ultrasonic_data(void);



#endif


