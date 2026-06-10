#include "hal_bsp_ultrasonic.h"

#include "hal_bsp_log.h"
#include "hi_io.h"
#include "hi_uart.h"

#include <stdio.h>
#include <unistd.h>
#include <string.h>
#include <stdlib.h>

#include "ohos_init.h"
#include "cmsis_os2.h"

void ultrasonic_init(void)
{
  uint32_t ret = 0;
  // 初始化串口
  hi_io_set_func(HI_IO_NAME_GPIO_11, HI_IO_FUNC_GPIO_11_UART2_TXD);
  hi_io_set_func(HI_IO_NAME_GPIO_12, HI_IO_FUNC_GPIO_12_UART2_RXD);

  hi_uart_attribute uart_param = {
      .baud_rate = 9600,
      .data_bits = 8,
      .stop_bits = 1,
      .parity = 0,
  };
  ret = hi_uart_init(HI_UART_IDX_2, &uart_param, NULL);
  if (ret != HI_ERR_SUCCESS)
  {
    console_log_error("hi uart init is faild.");
  }
}

/**
 * @brief 读超声波传感器的数据
 * @note
 * @retval 返回: 距离(mm)
 */
uint16_t read_ultrasonic_data(void)
{
  uint8_t buff[4] = {0};
  uint8_t data = 0xFF;
  uint8_t sum = 0;
  hi_uart_write(HI_UART_IDX_2, (hi_u8 *)&data, 1);
  usleep(100 * 1000); // 100ms sleep 手册中显示，一定要大于70ms的采集周期
  hi_uart_read(HI_UART_IDX_2, buff, sizeof(buff));
  sum = (buff[0] + buff[1] + buff[2]) & 0x00FF;
  if (sum == buff[3])
    return buff[1] * 256 + buff[2];
  else
    console_log_error("read ultrasonic data is faild.");

  return 0;
}
