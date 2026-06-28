#ifndef PZ_WIFI_AIRCON_SERVER_H
#define PZ_WIFI_AIRCON_SERVER_H

typedef struct {
    unsigned char wifi_connecting;
    unsigned char wifi_connected;
    unsigned char tcp_listening;
    unsigned char tcp_client_connected;
    unsigned char uart_ready;
    unsigned char ac_state;
    unsigned int server_port;
    unsigned int uart_baud;
    int last_error;
    char last_action[16];
    char ip[20];
} wifi_aircon_server_status_t;

void wifi_aircon_server_get_status(wifi_aircon_server_status_t *status);
int wifi_aircon_server_start(void);

#endif
