#ifndef DOOR_CTRL_H
#define DOOR_CTRL_H

typedef enum {
    DOOR_STATE_CLOSED = 0,
    DOOR_STATE_OPEN = 1
} door_state_t;

void door_ctrl_init(void);
int door_ctrl_set_open(unsigned char open_flag);
door_state_t door_ctrl_get_state(void);
unsigned int door_ctrl_get_angle(void);

#endif
