#include "door_ctrl.h"

#include <stdio.h>

#include "servo_io6.h"

#define DOOR_CLOSED_ANGLE 99
#define DOOR_OPEN_ANGLE 28

static door_state_t g_door_state = DOOR_STATE_CLOSED;
static unsigned int g_door_angle = DOOR_CLOSED_ANGLE;

void door_ctrl_init(void)
{
    servo_io6_init();
    servo_io6_set_angle(DOOR_CLOSED_ANGLE);
    g_door_state = DOOR_STATE_CLOSED;
    g_door_angle = DOOR_CLOSED_ANGLE;
    printf("[door] init closed, angle=%u\r\n", g_door_angle);
}

int door_ctrl_set_open(unsigned char open_flag)
{
    if (open_flag > 1) {
        return -1;
    }

    if (open_flag == 0) {
        servo_io6_set_angle(DOOR_CLOSED_ANGLE);
        g_door_state = DOOR_STATE_CLOSED;
        g_door_angle = DOOR_CLOSED_ANGLE;
        printf("[door] close, angle=%u\r\n", g_door_angle);
    } else {
        servo_io6_set_angle(DOOR_OPEN_ANGLE);
        g_door_state = DOOR_STATE_OPEN;
        g_door_angle = DOOR_OPEN_ANGLE;
        printf("[door] open, angle=%u\r\n", g_door_angle);
    }

    return 0;
}

door_state_t door_ctrl_get_state(void)
{
    return g_door_state;
}

unsigned int door_ctrl_get_angle(void)
{
    return g_door_angle;
}
