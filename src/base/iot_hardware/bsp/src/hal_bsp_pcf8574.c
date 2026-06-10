#include <stdio.h>
#include <unistd.h>

#include "hi_i2c.h"
#include "hi_io.h"
#include "hi_errno.h"

#include "hal_bsp_pcf8574.h"
#include "hal_bsp_log.h"



uint32_t PCF8574_Write(const uint8_t send_data)
{
  uint32_t result = 0;
  uint8_t buffer[2] = {send_data};    

  hi_i2c_data i2c_data = { 0 };
  i2c_data.send_buf = buffer;
  i2c_data.send_len = 1;

  result = hi_i2c_write(PCF8574_I2C_ID, PCF8574_I2C_ADDR, &i2c_data);
  if (result != HI_ERR_SUCCESS)
  {
    console_log_error("I2C PCF8574 Write result is 0x%x!!!", result);
    return result;
  }
  return HI_ERR_SUCCESS;
}

uint32_t PCF8574_Read(uint8_t *recv_data)
{
  uint32_t result = 0;
  hi_i2c_data i2c_data = {0};
  i2c_data.receive_buf = recv_data;
  i2c_data.receive_len = 1;

	result = hi_i2c_read(PCF8574_I2C_ID, PCF8574_I2C_ADDR, &i2c_data);
	if (result != HI_ERR_SUCCESS)
	{
		console_log_error("I2C PCF8574 Read result is 0x%x!!!", result);
		return result;
	}

	return HI_ERR_SUCCESS;
}

uint32_t PCF8574_Init(void)
{
  uint32_t result = 0;
  
  // gpio_9 复用为 I2C_SCL
  hi_io_set_pull(HI_IO_NAME_GPIO_9, HI_IO_PULL_UP);
  hi_io_set_func(HI_IO_NAME_GPIO_9, HI_IO_FUNC_GPIO_9_I2C0_SCL);
  // gpio_10 复用为 I2C_SDA
  hi_io_set_pull(HI_IO_NAME_GPIO_10, HI_IO_PULL_UP);
  hi_io_set_func(HI_IO_NAME_GPIO_10, HI_IO_FUNC_GPIO_10_I2C0_SDA);

	result = hi_i2c_init(PCF8574_I2C_ID, PCF8574_SPEED);
	if (result != HI_ERR_SUCCESS)
	{
		console_log_error("I2C PCF8574 Init status is 0x%x!!!", result);
		return result;
	}
  console_log_success("I2C PCF8574 Init is succeeded!!!");
  
	return HI_ERR_SUCCESS;
}


