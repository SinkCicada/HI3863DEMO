#include "hal_bsp_motor.h"
#include "hal_bsp_log.h"
#include "hi_i2c.h"
#include "hi_io.h"
#include "hi_gpio.h"
#include "hi_errno.h"
#include "hi_pwm.h"
#include "hal_bsp_structAll.h"

// 驱动板上的IO扩展芯片
#define QD_PCF8574_I2C_ADDR 0x40
#define QD_PCF8574_I2C_IDX 0        // 模块的I2C总线号
#define QD_PCF8574_I2C_SPEED 100000 // 100KHz
#define QD_PCF8574_I2C_SCL_GPIO HI_IO_NAME_GPIO_9
#define QD_PCF8574_I2C_SDA_GPIO HI_IO_NAME_GPIO_10
#define QD_PCF8574_I2C_SCL_FUNC HI_IO_FUNC_GPIO_9_I2C0_SCL
#define QD_PCF8574_I2C_SDA_FUNC HI_IO_FUNC_GPIO_10_I2C0_SDA
// IO扩展芯片的寄存器变量
tn_pcf8574_io_t pcf8574_io = {0};
#define MOTOR_IN1   (pcf8574_io.bit.p0)   
#define MOTOR_IN2   (pcf8574_io.bit.p1)
#define MOTOR_IN3   (pcf8574_io.bit.p2)
#define MOTOR_IN4   (pcf8574_io.bit.p3)
// 设置电机的PWM参数
#define MOTOR_OUT_FREQ   10000 // 设置输出频率 10KHz
#define MOTOR_LEFT_PWM_GPIO HI_IO_NAME_GPIO_8
#define MOTOR_LEFT_PWM_FUNC HI_IO_FUNC_GPIO_8_PWM1_OUT
#define MOTOR_LEFT_PWM_PORT HI_PWM_PORT_PWM1
#define MOTOR_RIGHT_PWM_GPIO HI_IO_NAME_GPIO_7
#define MOTOR_RIGHT_PWM_FUNC HI_IO_FUNC_GPIO_7_PWM0_OUT
#define MOTOR_RIGHT_PWM_PORT HI_PWM_PORT_PWM0

// 设置IO扩展芯片引脚的值
static uint32_t PCF8574_Write(const uint8_t send_data)
{
  uint32_t result = 0;
  uint8_t buffer[] = {send_data};    

  hi_i2c_data i2c_data = { 0 };
  i2c_data.send_buf = buffer;
  i2c_data.send_len = sizeof(buffer);

  result = hi_i2c_write(QD_PCF8574_I2C_IDX, QD_PCF8574_I2C_ADDR, &i2c_data);
  if (result != HI_ERR_SUCCESS)
  {
    console_log_error("I2C PCF8574 Write result is 0x%x!!!", result);
    return result;
  }
  return HI_ERR_SUCCESS;
}

// 设置电机的转动方向、速度  pwm_value: MAX=16000
uint32_t MOTOR_set_orientation(Motor_Index_t index, Motor_Direction_t value, uint16_t pwm_value)
{
  uint32_t result = 0;
  uint16_t pwm_freq_value = 160000000 / MOTOR_OUT_FREQ; // 分频值。设置输出的频率

  switch (index)
  {
    case MOTOR_INDEX_LEFT:  // 左电机
      if (MOTOR_DIRECTION_STOP == value)   // 停转
      {
        MOTOR_IN1 = 0;
        MOTOR_IN2 = 0;
        hi_pwm_stop(MOTOR_LEFT_PWM_PORT);
      }
      else if(MOTOR_DIRECTION_POSITIVE == value) // 正转
      {
        MOTOR_IN1 = 1;
        MOTOR_IN2 = 0;
      }
      else if(MOTOR_DIRECTION_ROLLBACK == value) // 反转
      {
        MOTOR_IN1 = 0;
        MOTOR_IN2 = 1;
      }

      result = hi_pwm_start(MOTOR_LEFT_PWM_PORT, (pwm_value <= 0) ? 1 : (pwm_value), pwm_freq_value);
      if(result != HI_ERR_SUCCESS)
      {
        console_log_error("hi_pwm_start is failed. result=0x%x", result);
        return result;
      }

      result = PCF8574_Write(pcf8574_io.all);
      if(result != HI_ERR_SUCCESS)
      {
        console_log_error("PCF8574_Write is failed. result=0x%x", result);
        return result;
      }
    break;

    case MOTOR_INDEX_RIGHT:   // 右电机
      if (MOTOR_DIRECTION_STOP == value)   // 停转
      {
        MOTOR_IN3 = 0;
        MOTOR_IN4 = 0;
        hi_pwm_stop(MOTOR_RIGHT_PWM_PORT);
      }
      else if(MOTOR_DIRECTION_POSITIVE == value) // 正转
      {
        MOTOR_IN3 = 1;
        MOTOR_IN4 = 0;
      }
      else if(MOTOR_DIRECTION_ROLLBACK == value) // 反转
      {
        MOTOR_IN3 = 0;
        MOTOR_IN4 = 1;
      }

      result = hi_pwm_start(MOTOR_RIGHT_PWM_PORT, (pwm_value <= 0) ? 1 : (pwm_value), pwm_freq_value);
      if(result != HI_ERR_SUCCESS)
      {
        console_log_error("hi_pwm_start is failed. result=0x%x", result);
        return result;
      }

      result = PCF8574_Write(pcf8574_io.all);
      if(result != HI_ERR_SUCCESS)
      {
        console_log_error("PCF8574_Write is failed. result=0x%x", result);
        return result;
      }
    break;
  }

  return HI_ERR_SUCCESS;
}






// 电机初始化
uint32_t MOTOR_Init(void)
{
  uint32_t result = 0;
  // 初始化I2C通信
  hi_io_set_pull(QD_PCF8574_I2C_SCL_GPIO, HI_IO_PULL_UP);
  hi_io_set_func(QD_PCF8574_I2C_SCL_GPIO, QD_PCF8574_I2C_SCL_FUNC);
  hi_io_set_pull(QD_PCF8574_I2C_SDA_GPIO, HI_IO_PULL_UP);
  hi_io_set_func(QD_PCF8574_I2C_SDA_GPIO, QD_PCF8574_I2C_SDA_FUNC);
  result = hi_i2c_init(QD_PCF8574_I2C_IDX, QD_PCF8574_I2C_SPEED);
  if (result != HI_ERR_SUCCESS)
  {
    console_log_error("pcf8574 i2c Init status is 0x%x!!!", result);
    return result;
  }
  PCF8574_Write(pcf8574_io.all);    // 电机全部停转

  // 左电机PWM初始化
  hi_io_set_pull(MOTOR_LEFT_PWM_GPIO, HI_IO_PULL_UP);
  hi_io_set_func(MOTOR_LEFT_PWM_GPIO, MOTOR_LEFT_PWM_FUNC);
  result = hi_pwm_init(HI_PWM_PORT_PWM0);
  if (result != HI_ERR_SUCCESS)
  {
    console_log_error("Motor pwm Init status is 0x%x!!!", result);
    return result;
  }

  // 右电机PWM初始化
  hi_io_set_pull(MOTOR_RIGHT_PWM_GPIO, HI_IO_PULL_UP);
  hi_io_set_func(MOTOR_RIGHT_PWM_GPIO, MOTOR_RIGHT_PWM_FUNC);
  result = hi_pwm_init(HI_PWM_PORT_PWM1);
  if (result != HI_ERR_SUCCESS)
  {
    console_log_error("Motor pwm Init status is 0x%x!!!", result);
    return result;
  }


  console_log_info("Motor Init is success.");
  return HI_ERR_SUCCESS;
}
