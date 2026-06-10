#include "hal_bsp_key.h"
#include "hi_io.h"
#include "hi_gpio.h"
#include "hal_bsp_log.h"

/**
 * @brief  按键初始化函数
 * @note   并且有中断回调函数
 * @retval None
 */
void KEY_Init(void)
{
  hi_gpio_init();			// GPIO初始化
  hi_io_set_pull(KEY, HI_IO_PULL_UP);	// 设置GPIO上拉
  hi_io_set_func(KEY, HI_IO_FUNC_GPIO_14_GPIO);	// 设置IO14为GPIO功能
  hi_gpio_set_dir(KEY, HI_GPIO_DIR_IN);	                      // 设置GPIO为输入模式
}

/**
 * @brief  获取按键此时的状态值
 * @note   
 * @retval 
 */
uint8_t KEY_Get_Input_Value(void)
{
  hi_gpio_value val;
  hi_gpio_get_input_val(KEY, &val); 
  return val;
}

