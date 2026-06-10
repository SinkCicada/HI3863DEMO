#ifndef __HAL_BSP_INA219_H
#define __HAL_BSP_INA219_H


#include "cmsis_os2.h"


#define INA219_I2C_ADDR (0x82)   // 器件的I2C从机地址
#define INA219_I2C_IDX  0             // 模块的I2C总线号
#define INA219_I2C_SPEED 100000       // 100KHz

/**
 * @brief INA219 初始化
 * @return Returns {@link IOT_SUCCESS} 成功;
 *         Returns {@link IOT_FAILURE} 失败.
 */
uint32_t INA219_Init(void);
/**
 * @brief INA219 获取当前的功率值
 * @param power 功率（mW）
 * @return Returns {@link IOT_SUCCESS} 成功;
 *         Returns {@link IOT_FAILURE} 失败.
 */
uint32_t INA219_get_power_mw(float *power);
/**
 * @brief INA219 获取当前的电流值
 * @param current 电流（mA）
 * @return Returns {@link IOT_SUCCESS} 成功;
 *         Returns {@link IOT_FAILURE} 失败.
 */
uint32_t INA219_get_current_ma(float *current);
/**
 * @brief INA219 获取当前的电压值
 * @param voltage 电压（mV）
 * @return Returns {@link IOT_SUCCESS} 成功;
 *         Returns {@link IOT_FAILURE} 失败.
 */
uint32_t INA219_get_bus_voltage_mv(float *voltage);




#endif

