#ifndef PZ_AIRCON_CTRL_H
#define PZ_AIRCON_CTRL_H

#define AIRCON_STATE_OFF 0
#define AIRCON_STATE_ON 1
#define AIRCON_STATE_UNKNOWN 2

#define AIRCON_CTRL_RET_OK 0
#define AIRCON_CTRL_RET_SENT_NO_ACK 1
#define AIRCON_CTRL_RET_FAIL (-1)

int aircon_ctrl_init(void);
int aircon_ctrl_power_on(void);
int aircon_ctrl_power_off(void);
int aircon_ctrl_emit_group(unsigned short group_no);
unsigned int aircon_ctrl_get_baud(void);
unsigned char aircon_ctrl_get_state(void);
const char *aircon_ctrl_get_state_text(void);

#endif
