#ifndef SERVO_IO6_H
#define SERVO_IO6_H

#include "hi_gpio.h"
#include "hi_io.h"

#define SERVO_IO6_NAME HI_IO_NAME_GPIO_6
#define SERVO_IO6_GPIO_IDX HI_GPIO_IDX_6
#define SERVO_IO6_FUNC HI_IO_FUNC_GPIO_6_GPIO

void servo_io6_init(void);
void servo_io6_set_angle(unsigned int angle);
void servo_io6_move_to_initial(void);

#endif
