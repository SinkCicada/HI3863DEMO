#ifndef PZ_WIFI_LED_SERVER_LED_CTRL_H
#define PZ_WIFI_LED_SERVER_LED_CTRL_H

void led_ctrl_init(void);
int led_ctrl_set_brightness(unsigned char room, unsigned char brightness);
unsigned char led_ctrl_get_brightness(unsigned char room);
int led_ctrl_set_human_detect(unsigned char room, unsigned char enabled);
unsigned char led_ctrl_get_human_detect(unsigned char room);
int led_ctrl_room_is_valid(unsigned char room);

#endif
