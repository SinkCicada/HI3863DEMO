#ifndef PZ_WIFI_LED_SERVER_WIFI_LED_SERVER_H
#define PZ_WIFI_LED_SERVER_WIFI_LED_SERVER_H

#define WIFI_LED_SERVER_IP_LEN 20

typedef struct {
    int wifi_connecting;
    int wifi_connected;
    int tcp_listening;
    int tcp_client_connected;
    int server_port;
    int last_error;
    char ip[WIFI_LED_SERVER_IP_LEN];
} wifi_led_server_status_t;

int wifi_led_server_start(void);
void wifi_led_server_get_status(wifi_led_server_status_t *status);

#endif
