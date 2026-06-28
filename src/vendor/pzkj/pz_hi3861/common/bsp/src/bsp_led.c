/**
 ****************************************************************************************************
 * @file        bsp_led.c
 * @author      普中科技
 * @version     V1.0
 * @date        2024-06-05
 * @brief       LED实验
 * @license     Copyright (c) 2024-2034, 深圳市普中科技有限公司
 ****************************************************************************************************
 * @attention
 *
 * 实验平台:普中-Hi3861
 * 在线视频:https://space.bilibili.com/2146492485
 * 公司网址:www.prechin.cn
 * 购买地址:
 *
 */

#include "bsp_led.h"


//LED初始化
void led_init(void)
{
    hi_gpio_init();                                            // GPIO初始化
    hi_io_set_pull(LED_PIN, HI_IO_PULL_DOWN);                  // 设置GPIO下拉
    hi_io_set_func(LED_PIN, LED_GPIO_FUN);                      // 设置IO为GPIO功能
    hi_gpio_set_dir(LED_PIN, HI_GPIO_DIR_OUT);                 // 设置GPIO为输出模式
}

// 点亮 LED（输出高电平）
void led_on(void)
{
    /* 忽略返回值，调用者可根据需要检查 */
    hi_gpio_set_output_val(LED_PIN, HI_GPIO_VALUE1);
}

// 熄灭 LED（输出低电平）
void led_off(void)
{
    hi_gpio_set_output_val(LED_PIN, HI_GPIO_VALUE0);
}

// 切换 LED 状态
void led_toggle(void)
{
    hi_gpio_value val = HI_GPIO_VALUE0;
    if (hi_gpio_get_output_val(LED_PIN, &val) == 0) {
        if (val == HI_GPIO_VALUE1) {
            hi_gpio_set_output_val(LED_PIN, HI_GPIO_VALUE0);
        } else {
            hi_gpio_set_output_val(LED_PIN, HI_GPIO_VALUE1);
        }
    } else {
        /* 如果读取失败，默认尝试置高 */
        hi_gpio_set_output_val(LED_PIN, HI_GPIO_VALUE1);
    }
}

// 获取 LED 当前输出电平（0=低，1=高），返回 -1 表示读取失败
int led_get_state(void)
{
    hi_gpio_value val = HI_GPIO_VALUE0;
    if (hi_gpio_get_output_val(LED_PIN, &val) == 0) {
        return (val == HI_GPIO_VALUE1) ? 1 : 0;
    }
    return -1;
}
