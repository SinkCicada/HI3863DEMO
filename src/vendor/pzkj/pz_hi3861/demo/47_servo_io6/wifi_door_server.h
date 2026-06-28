#ifndef WIFI_DOOR_SERVER_H
#define WIFI_DOOR_SERVER_H

#define WIFI_DOOR_SERVER_IP_LEN 20

typedef struct {
    int wifi_connecting;
    int wifi_connected;
    int tcp_listening;
    int tcp_client_connected;
    int server_port;
    int last_error;
    unsigned char door_state;
    unsigned int door_angle;
    char ip[WIFI_DOOR_SERVER_IP_LEN];
} wifi_door_server_status_t;

int wifi_door_server_start(void);
void wifi_door_server_get_status(wifi_door_server_status_t *status);

#endif
