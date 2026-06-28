#include "led_ctrl.h"

#include <stdio.h>

#include "hi_gpio.h"
#include "hi_io.h"
#include "hi_pwm.h"

#define LED_ROOM_COUNT 3
#define PWM_FREQ 40000
#define PWM_MAX_DUTY 40000

typedef struct {
    hi_io_name io;
    hi_u8 pwm_func;
    hi_pwm_port pwm_port;
    unsigned char brightness;
    unsigned char human_detect_enabled;
} led_room_t;

static led_room_t g_led_rooms[LED_ROOM_COUNT] = {
    { HI_IO_NAME_GPIO_0, HI_IO_FUNC_GPIO_0_PWM3_OUT, HI_PWM_PORT_PWM3, 0, 0 },
    { HI_IO_NAME_GPIO_1, HI_IO_FUNC_GPIO_1_PWM4_OUT, HI_PWM_PORT_PWM4, 0, 0 },
    { HI_IO_NAME_GPIO_2, HI_IO_FUNC_GPIO_2_PWM2_OUT, HI_PWM_PORT_PWM2, 0, 0 },
};

int led_ctrl_room_is_valid(unsigned char room)
{
    return room < LED_ROOM_COUNT;
}

void led_ctrl_init(void)
{
    unsigned int index;

    hi_gpio_init();
    for (index = 0; index < LED_ROOM_COUNT; ++index) {
        hi_io_set_pull(g_led_rooms[index].io, HI_IO_PULL_DOWN);
        hi_io_set_func(g_led_rooms[index].io, g_led_rooms[index].pwm_func);
        hi_gpio_set_dir(g_led_rooms[index].io, HI_GPIO_DIR_OUT);
        hi_pwm_init(g_led_rooms[index].pwm_port);
        hi_pwm_stop(g_led_rooms[index].pwm_port);
        g_led_rooms[index].brightness = 0;
        g_led_rooms[index].human_detect_enabled = 0;
    }
}

int led_ctrl_set_brightness(unsigned char room, unsigned char brightness)
{
    hi_u16 duty;
    hi_u32 ret = HI_ERR_SUCCESS;

    if (!led_ctrl_room_is_valid(room) || brightness > 100) {
        return -1;
    }

    g_led_rooms[room].brightness = brightness;
    if (brightness == 0) {
        ret = hi_pwm_stop(g_led_rooms[room].pwm_port);
    } else {
        duty = (hi_u16)(((unsigned int)brightness * PWM_MAX_DUTY) / 100);
        ret = hi_pwm_start(g_led_rooms[room].pwm_port, duty, PWM_FREQ);
    }

    printf("[led] room=%u brightness=%u%%, pwm_ret=0x%x\r\n",
        room, brightness, ret);
    return 0;
}

unsigned char led_ctrl_get_brightness(unsigned char room)
{
    if (!led_ctrl_room_is_valid(room)) {
        return 0;
    }

    return g_led_rooms[room].brightness;
}

int led_ctrl_set_human_detect(unsigned char room, unsigned char enabled)
{
    if (!led_ctrl_room_is_valid(room) || enabled > 1) {
        return -1;
    }

    g_led_rooms[room].human_detect_enabled = enabled;
    printf("[human] room=%u detect=%s\r\n", room, enabled ? "ON" : "OFF");
    return 0;
}

unsigned char led_ctrl_get_human_detect(unsigned char room)
{
    if (!led_ctrl_room_is_valid(room)) {
        return 0;
    }

    return g_led_rooms[room].human_detect_enabled;
}
