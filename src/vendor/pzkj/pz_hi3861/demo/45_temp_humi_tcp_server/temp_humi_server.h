#ifndef PZ_TEMP_HUMI_TCP_SERVER_TEMP_HUMI_SERVER_H
#define PZ_TEMP_HUMI_TCP_SERVER_TEMP_HUMI_SERVER_H

#define TEMP_HUMI_SERVER_IP_LEN 20
#define TEMP_HUMI_SERVER_ALARM_LEN 24

typedef struct {
    int wifi_connecting;
    int wifi_connected;
    int tcp_listening;
    int tcp_client_connected;
    int dht11_ready;
    int server_port;
    int last_error;
    unsigned char last_temp;
    unsigned char last_humi;
    char ip[TEMP_HUMI_SERVER_IP_LEN];
    char last_alarm[TEMP_HUMI_SERVER_ALARM_LEN];
} temp_humi_server_status_t;

int temp_humi_server_start(void);
void temp_humi_server_get_status(temp_humi_server_status_t *status);

#endif
