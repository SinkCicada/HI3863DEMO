#include "servo_io6.h"

#include <unistd.h>

#include "hi_time.h"
#include "iot_gpio.h"

#define SERVO_PERIOD_US 20000
#define SERVO_MIN_PULSE_US 500
#define SERVO_MAX_PULSE_US 2500
#define SERVO_MAX_ANGLE 180
#define SERVO_INITIAL_ANGLE 90
#define SERVO_DRIVE_CYCLES 25

static unsigned int servo_io6_angle_to_pulse_us(unsigned int angle)
{
    if (angle > SERVO_MAX_ANGLE) {
        angle = SERVO_MAX_ANGLE;
    }

    return SERVO_MIN_PULSE_US +
        ((SERVO_MAX_PULSE_US - SERVO_MIN_PULSE_US) * angle) / SERVO_MAX_ANGLE;
}

static void servo_io6_write_once(unsigned int high_level_us)
{
    IoTGpioSetOutputVal(SERVO_IO6_NAME, IOT_GPIO_VALUE1);
    hi_udelay(high_level_us);
    IoTGpioSetOutputVal(SERVO_IO6_NAME, IOT_GPIO_VALUE0);
    hi_udelay(SERVO_PERIOD_US - high_level_us);
}

void servo_io6_init(void)
{
    hi_gpio_init();
    hi_io_set_func(SERVO_IO6_NAME, SERVO_IO6_FUNC);
    hi_gpio_set_dir(SERVO_IO6_GPIO_IDX, HI_GPIO_DIR_OUT);
    IoTGpioSetOutputVal(SERVO_IO6_NAME, IOT_GPIO_VALUE0);
}

void servo_io6_set_angle(unsigned int angle)
{
    unsigned int pulse_us;
    unsigned int i;

    pulse_us = servo_io6_angle_to_pulse_us(angle);
    for (i = 0; i < SERVO_DRIVE_CYCLES; i++) {
        servo_io6_write_once(pulse_us);
    }
}

void servo_io6_move_to_initial(void)
{
    servo_io6_set_angle(SERVO_INITIAL_ANGLE);
    usleep(200 * 1000);
}
