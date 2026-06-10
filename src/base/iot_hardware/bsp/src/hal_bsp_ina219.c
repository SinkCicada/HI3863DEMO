#include "hal_bsp_ina219.h"
#include "hal_bsp_log.h"
#include "hi_errno.h"
#include "hi_i2c.h"
#include "hi_io.h"
#include "hi_gpio.h"



const float ina219_busVolt_LSB_mV = 4;   
const float ina219_current_LSB_mA = 0.1;  
const float ina219_power_LSB_mW = 2;


// 寄存器地址
#define INA219_REG_CONFIG 0x00        // 模式配置寄存器  可写可读
#define INA219_REG_SHUNT_VOLTAGE 0x01 // 分流电阻电压寄存器  可读
#define INA219_REG_BUS_VOLTAGE 0x02   // 总线电压寄存器 可读
#define INA219_REG_POWER 0x03         // 功率寄存器 可读
#define INA219_REG_CURRENT 0x04       // 电流寄存器 可读
#define INA219_REG_CALIBRATION 0x05   // 校准寄存器 可写可读

typedef enum
{
  INA219_CONFIG_RESET = 0x8000, // 复位重启
                                // 设置电压范围
  INA219_CONFIG_BUS_VOLTAGE_RANGE_16V = 0x0000,
  INA219_CONFIG_BUS_VOLTAGE_RANGE_32V = 0x2000,
  // 设置PGA增益和范围
  INA219_CONFIG_GAIN_1_40MV = 0x0000,
  INA219_CONFIG_GAIN_2_80MV = 0x0800,
  INA219_CONFIG_GAIN_4_160MV = 0x1000,
  INA219_CONFIG_GAIN_8_320MV = 0x1800,
  // 设置分压ADC的分辨率
  INA219_CONFIG_BADCRES_9BIT = 0x0080,
  INA219_CONFIG_BADCRES_10BIT = 0x0100,
  INA219_CONFIG_BADCRES_11BIT = 0x0200,
  INA219_CONFIG_BADCRES_12BIT = 0x0400,
  // 设置分流ADC的分辨率
  INA219_CONFIG_SADCRES_9BIT_1S_84US = 0x0000,     // 1 * 9-bit 分流采样
  INA219_CONFIG_SADCRES_10BIT_1S_148US = 0x0008,   // 1 * 10-bit 分流采样
  INA219_CONFIG_SADCRES_11BIT_1S_276US = 0x0010,   // 1 * 11-bit 分流采样
  INA219_CONFIG_SADCRES_12BIT_1S_532US = 0x0018,   // 1 * 12-bit 分流采样
  INA219_CONFIG_SADCRES_12BIT_2S_1060US = 0x0048,  // 2 * 12-bit 分流采样平均值
  INA219_CONFIG_SADCRES_12BIT_4S_2130US = 0x0050,  // 4 * 12-bit 分流采样平均值
  INA219_CONFIG_SADCRES_12BIT_8S_4260US = 0x0058,  // 8 * 12-bit 分流采样平均值
  INA219_CONFIG_SADCRES_12BIT_16S_8510US = 0x0060, // 16 * 12-bit 分流采样平均值
  INA219_CONFIG_SADCRES_12BIT_32S_17MS = 0x0068,   // 32 * 12-bit 分流采样平均值
  INA219_CONFIG_SADCRES_12BIT_64S_34MS = 0x0070,   // 64 * 12-bit 分流采样平均值
  INA219_CONFIG_SADCRES_12BIT_128S_69MS = 0x0078,  // 128 * 12-bit 分流采样平均值
  // 设置工作模式
  INA219_CONFIG_MODE_POWERDOWN = 0x0000,            // 省电模式
  INA219_CONFIG_MODE_SVOLT_TRIGGERED = 0x0001,      // 并联电压 触发模式
  INA219_CONFIG_MODE_BVOLT_TRIGGERED = 0x0002,      // 总线电压 触发模式
  INA219_CONFIG_MODE_SANDBVOLT_TRIGGERED = 0x0003,  // 分流和总线 触发模式
  INA219_CONFIG_MODE_ADCOFF = 0x0004,               // ADC禁用模式
  INA219_CONFIG_MODE_SVOLT_CONTINUOUS = 0x0005,     // 并联电压 连续模式
  INA219_CONFIG_MODE_BVOLT_CONTINUOUS = 0x0006,     // 总线电压 连续模式
  INA219_CONFIG_MODE_SANDBVOLT_CONTINUOUS = 0x0007, // 分流和总线 连续模式
} INA219_REG_CONFIG_VALUE;

#define INA219_REG_CONFIG_MODE (INA219_CONFIG_BUS_VOLTAGE_RANGE_16V | \
                                INA219_CONFIG_GAIN_8_320MV | \
                                INA219_CONFIG_BADCRES_12BIT | \
                                INA219_CONFIG_SADCRES_12BIT_16S_8510US | \
                                INA219_CONFIG_MODE_SANDBVOLT_CONTINUOUS)

// 写寄存器的值
static uint32_t INA219_write_reg(uint8_t reg, uint16_t data)
{
  uint8_t temp_H = data >> 8;
  uint8_t temp_L = data & 0xFF;
  uint8_t sendBuff[] = {reg, temp_H, temp_L};

  hi_i2c_data i2cData = {0};
  i2cData.send_buf = sendBuff;
  i2cData.send_len = sizeof(sendBuff);

  return hi_i2c_write(INA219_I2C_IDX, INA219_I2C_ADDR, &i2cData);
}

// 读寄存器的值
static uint32_t INA219_read_reg(uint8_t reg, uint16_t *data)
{
  uint8_t sendBuff[] = {reg};
  uint8_t readBuff[2] = {0};
  hi_i2c_data i2cData = {0};
  int ret = 0;

  i2cData.send_buf = sendBuff;
  i2cData.send_len = sizeof(sendBuff);
  i2cData.receive_buf = readBuff;
  i2cData.receive_len = sizeof(readBuff);

  ret = hi_i2c_writeread(INA219_I2C_IDX, INA219_I2C_ADDR, &i2cData);
  if (ret != HI_ERR_SUCCESS)
    return ret;
  else
    *data = (readBuff[0] << 8 | readBuff[1]);

  return HI_ERR_SUCCESS;
}

// 获取电压值
uint32_t INA219_get_bus_voltage_mv(float *voltage)
{
  if(voltage == NULL)
  {
    console_log_error("INA219_get_bus_voltage_mv ==> voltage == NULL");
    return HI_ERR_FAILURE;
  }

  uint32_t result = 0;
  uint16_t value = 0;
  // 防止外在原因导致寄存器配置丢失，再配置一遍寄存器
  // 配置工作模式
  result = INA219_write_reg(INA219_REG_CONFIG, INA219_REG_CONFIG_MODE);
  if (result != HI_ERR_SUCCESS)
  {
    console_log_error("I2C ina219 Init status is 0x%x!!!", result);
    return result;
  }

  result = INA219_read_reg(INA219_REG_BUS_VOLTAGE, &value);
  if( result != HI_ERR_SUCCESS )
  {
    console_log_error("INA219_read INA219_REG_BUS_VOLTAGE is failed.");
    return result;
  }

  value >>= 3;  // 右移三位，丢弃CNVR和OVF
  value *= ina219_busVolt_LSB_mV;   // 官方文档要求：必须乘上4mv

  *voltage = (float)value;

  return HI_ERR_SUCCESS;
}

// 获取电流值
uint32_t INA219_get_current_ma(float *current)
{
  if(current == NULL)
  {
    console_log_error("INA219_get_current_ma ==> current == NULL");
    return HI_ERR_FAILURE;
  }

  uint32_t result = 0;
  uint16_t value = 0;
  // 防止外在原因导致寄存器配置丢失，再配置一遍寄存器
  // 配置工作模式
  result = INA219_write_reg(INA219_REG_CONFIG, INA219_REG_CONFIG_MODE);
  if (result != HI_ERR_SUCCESS)
  {
    console_log_error("I2C ina219 Init status is 0x%x!!!", result);
    return result;
  }

  result = INA219_read_reg(INA219_REG_CURRENT, &value);
  if( result != HI_ERR_SUCCESS )
  {
    console_log_error("INA219_read INA219_REG_CURRENT is failed.");
    return result;
  }

  value *= ina219_current_LSB_mA;   // 得到寄存器的值，再乘以每位对应的值（INA_I_LSB）得到实际的电流值

  *current = (float)value;

  return HI_ERR_SUCCESS;
}

// 获取电源功率值
uint32_t INA219_get_power_mw(float *power)
{
  if(power == NULL)
  {
    console_log_error("INA219_get_power_mw ==> power == NULL");
    return HI_ERR_FAILURE;
  }

  uint32_t result = 0;
  uint16_t value = 0;
  // 防止外在原因导致寄存器配置丢失，再配置一遍寄存器
  // 配置工作模式
  result = INA219_write_reg(INA219_REG_CONFIG, INA219_REG_CONFIG_MODE);
  if (result != HI_ERR_SUCCESS)
  {
    console_log_error("I2C ina219 Init status is 0x%x!!!", result);
    return result;
  }

  result = INA219_read_reg(INA219_REG_POWER, &value);
  if( result != HI_ERR_SUCCESS )
  {
    console_log_error("INA219_read INA219_REG_POWER is failed.");
    return result;
  }

  value *= ina219_power_LSB_mW;   // 得到寄存器的值，再乘以每位对应的值（INA_I_LSB）得到实际的电流值

  *power = (float)value;

  return HI_ERR_SUCCESS;
}

// 初始化函数
uint32_t INA219_Init(void)
{
  uint32_t result;

  // gpio_9 复用为 I2C_SCL
  hi_io_set_pull(HI_IO_NAME_GPIO_9, HI_IO_PULL_UP);
  hi_io_set_func(HI_IO_NAME_GPIO_9, HI_IO_FUNC_GPIO_9_I2C0_SCL);
  // gpio_10 复用为 I2C_SDA
  hi_io_set_pull(HI_IO_NAME_GPIO_10, HI_IO_PULL_UP);
  hi_io_set_func(HI_IO_NAME_GPIO_10, HI_IO_FUNC_GPIO_10_I2C0_SDA);

  result = hi_i2c_init(INA219_I2C_IDX, INA219_I2C_SPEED);
  if (result != HI_ERR_SUCCESS)
  {
    console_log_error("I2C ina219 Init status is 0x%x!!!", result);
    return result;
  }

  // 复位芯片
  result = INA219_write_reg(INA219_REG_CONFIG, INA219_CONFIG_RESET);
  if (result != HI_ERR_SUCCESS)
  {
    console_log_error("I2C ina219 reset status is 0x%x!!!", result);
    return result;
  }

  // 配置工作模式
  result = INA219_write_reg(INA219_REG_CONFIG, INA219_REG_CONFIG_MODE);
  if (result != HI_ERR_SUCCESS)
  {
    console_log_error("I2C ina219 Init status is 0x%x!!!", result);
    return result;
  }

  // 配置校准寄存器
  result = INA219_write_reg(INA219_REG_CALIBRATION, 4096);
  if (result != HI_ERR_SUCCESS)
  {
    console_log_error("I2C ina219 Init status is 0x%x!!!", result);
    return result;
  }

  console_log_info("I2C ina219 Init is succeeded!!!");

  return 0;
}