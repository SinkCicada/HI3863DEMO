#ifndef __HAL_BSP_PCF8574_H__
#define __HAL_BSP_PCF8574_H__

#include "cmsis_os2.h"

#define PCF8574_I2C_ADDR (0x42)     // 器件的I2C从机地址
#define PCF8574_I2C_ID    0         // 模块的I2C总线号
#define PCF8574_SPEED     100000    // 100KHz

/**
 * @brief PCF8574 写数据
 *
 * 向PCF8574芯片写1个字节的数据，只能写1个字节的数据。
 *
 * @param data 数据中的每一位代表引脚 高位->低位，P7->P0
 * @return Returns {@link IOT_SUCCESS} 成功;
 *         Returns {@link IOT_FAILURE} 失败.
 */
uint32_t PCF8574_Write(uint8_t data);

/**
 * @brief PCF8574 读数据
 *
 * 向PCF8574芯片读1个字节的数据，只能读1个字节的数据。
 *
 * @param data 数据中的每一位代表引脚 高位->低位，P7->P0
 * @return Returns {@link IOT_SUCCESS} 成功;
 *         Returns {@link IOT_FAILURE} 失败.
 */
uint32_t PCF8574_Read(uint8_t *recv_data);

/**
 * @brief 初始化 PCF8574
 *
 * @param 
 * @return Returns {@link IOT_SUCCESS} 成功;
 *         Returns {@link IOT_FAILURE} 失败.
 */
uint32_t PCF8574_Init(void);

#endif


