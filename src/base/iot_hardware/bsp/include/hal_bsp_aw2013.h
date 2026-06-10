#ifndef HAL_BSP_AW2013_H
#define HAL_BSP_AW2013_H

#include "cmsis_os2.h"

#define AW2013_I2C_ADDR (0x8A)   // 器件的I2C从机地址
#define AW2013_I2C_IDX  0             // 模块的I2C总线号
#define AW2013_I2C_SPEED 100000       // 100KHz

/**
 * @brief AW2013 控制RGB灯的红灯亮度
 * @param PWM_Data PWM的控制输出值 0~255
 * @return Returns {@link IOT_SUCCESS} 成功;
 *         Returns {@link IOT_FAILURE} 失败.
 */
uint32_t AW2013_Control_Red(uint8_t PWM_Data);
/**
 * @brief AW2013 控制RGB灯的绿灯亮度
 * @param PWM_Data PWM的控制输出值 0~255
 * @return Returns {@link IOT_SUCCESS} 成功;
 *         Returns {@link IOT_FAILURE} 失败.
 */
uint32_t AW2013_Control_Green(uint8_t PWM_Data);
/**
 * @brief AW2013 控制RGB灯的蓝灯亮度
 * @param PWM_Data PWM的控制输出值 0~255
 * @return Returns {@link IOT_SUCCESS} 成功;
 *         Returns {@link IOT_FAILURE} 失败.
 */
uint32_t AW2013_Control_Blue(uint8_t PWM_Data);
/**
 * @brief AW2013 控制RGB灯的三色灯参数
 * @param R_Value PWM的控制输出值 0~255
 * @param G_Value PWM的控制输出值 0~255
 * @param B_Value PWM的控制输出值 0~255
 * @return Returns {@link IOT_SUCCESS} 成功;
 *         Returns {@link IOT_FAILURE} 失败.
 */
uint32_t AW2013_Control_RGB(uint8_t R_Value, uint8_t G_Value, uint8_t B_Value);
/**
 * @brief AW2013 器件的初始化
 * @param 无
 * @return Returns {@link IOT_SUCCESS} 成功;
 *         Returns {@link IOT_FAILURE} 失败.
 */
uint32_t AW2013_Init(void);


#endif // !HAL_BSP_AW2013_H
