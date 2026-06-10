#ifndef __HAL_BSP_MOTOR_H
#define __HAL_BSP_MOTOR_H

#include "cmsis_os2.h"

// 电机的运动方向
typedef enum {
  MOTOR_DIRECTION_STOP = 0,   // 电机停止
  MOTOR_DIRECTION_POSITIVE,   // 电机正转
  MOTOR_DIRECTION_ROLLBACK,   // 电机反转
}Motor_Direction_t;

// 是左电机还是右电机
typedef enum {
  MOTOR_INDEX_LEFT = 0, // 左电机
  MOTOR_INDEX_RIGHT = 1, // 右电机
}Motor_Index_t;


uint32_t MOTOR_Init(void);

uint32_t MOTOR_set_orientation(Motor_Index_t index, Motor_Direction_t value, uint16_t pwm_value);

#endif

