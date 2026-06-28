#include "aircon_ctrl.h"

#include <stdio.h>
#include <string.h>

#include "hi_gpio.h"
#include "hi_io.h"
#include "hi_uart.h"
#include "securec.h"

#define AIRCON_UART_ID HI_UART_IDX_1
#define AIRCON_UART_TX_IO HI_IO_NAME_GPIO_0
#define AIRCON_UART_TX_GPIO HI_GPIO_IDX_0
#define AIRCON_UART_RX_IO HI_IO_NAME_GPIO_1
#define AIRCON_UART_RX_GPIO HI_GPIO_IDX_1

#define AIRCON_GROUP_POWER_ON 1
#define AIRCON_GROUP_POWER_OFF 2
#define AIRCON_FRAME_LEN 8
#define AIRCON_ACK_TIMEOUT_MS 120
#define AIRCON_DRAIN_TIMEOUT_MS 10

static const unsigned int g_aircon_baud_list[] = {
    9600,
    19200,
    38400,
    57600,
    115200,
};

static unsigned int g_aircon_baud_index = 0;
static unsigned int g_aircon_current_baud = 0;
static unsigned char g_aircon_state = AIRCON_STATE_UNKNOWN;
static unsigned char g_aircon_uart_ready = 0;

static unsigned short modbus_crc16(const unsigned char *data, unsigned int len)
{
    unsigned short crc = 0xFFFF;
    unsigned int i;
    unsigned int bit;

    for (i = 0; i < len; ++i) {
        crc ^= data[i];
        for (bit = 0; bit < 8; ++bit) {
            if ((crc & 0x0001U) != 0) {
                crc = (crc >> 1) ^ 0xA001U;
            } else {
                crc >>= 1;
            }
        }
    }

    return crc;
}

static void aircon_build_emit_group_frame(unsigned short group_no, unsigned char *frame)
{
    unsigned short group_index;
    unsigned short crc;

    group_index = (unsigned short)(group_no - 1);
    frame[0] = 0x01;
    frame[1] = 0x06;
    frame[2] = 0x00;
    frame[3] = 0x12;
    frame[4] = (unsigned char)((group_index >> 8) & 0xFFU);
    frame[5] = (unsigned char)(group_index & 0xFFU);

    crc = modbus_crc16(frame, AIRCON_FRAME_LEN - 2);
    frame[6] = (unsigned char)(crc & 0xFFU);
    frame[7] = (unsigned char)((crc >> 8) & 0xFFU);
}

static int aircon_uart_open(unsigned int baud_rate)
{
    hi_uart_attribute attr;
    hi_u32 ret;

    (void)hi_uart_deinit(AIRCON_UART_ID);

    hi_gpio_init();
    hi_io_set_pull(AIRCON_UART_TX_IO, HI_IO_PULL_UP);
    hi_io_set_func(AIRCON_UART_TX_IO, HI_IO_FUNC_GPIO_0_UART1_TXD);
    hi_gpio_set_dir(AIRCON_UART_TX_GPIO, HI_GPIO_DIR_OUT);

    hi_io_set_pull(AIRCON_UART_RX_IO, HI_IO_PULL_UP);
    hi_io_set_func(AIRCON_UART_RX_IO, HI_IO_FUNC_GPIO_1_UART1_RXD);
    hi_io_set_input_enable(AIRCON_UART_RX_IO, HI_TRUE);
    hi_gpio_set_dir(AIRCON_UART_RX_GPIO, HI_GPIO_DIR_IN);

    (void)memset_s(&attr, sizeof(attr), 0, sizeof(attr));
    attr.baud_rate = baud_rate;
    attr.data_bits = HI_UART_DATA_BIT_8;
    attr.stop_bits = HI_UART_STOP_BIT_1;
    attr.parity = HI_UART_PARITY_NONE;

    ret = hi_uart_init(AIRCON_UART_ID, &attr, HI_NULL);
    if (ret != HI_ERR_SUCCESS) {
        printf("[ac-uart] init failed, baud=%u, ret=%u\r\n", baud_rate, ret);
        return -1;
    }

    g_aircon_current_baud = baud_rate;
    g_aircon_uart_ready = 1;
    return 0;
}

static void aircon_uart_drain(void)
{
    unsigned char drain_buf[16];
    int read_len;
    unsigned int retry;

    for (retry = 0; retry < 3; ++retry) {
        read_len = hi_uart_read_timeout(AIRCON_UART_ID, drain_buf,
            sizeof(drain_buf), AIRCON_DRAIN_TIMEOUT_MS);
        if (read_len <= 0) {
            break;
        }
    }
}

static int aircon_uart_exchange(const unsigned char *tx_buf, unsigned int tx_len,
    unsigned char *rx_buf, unsigned int rx_len)
{
    int write_len;
    int read_len;
    unsigned int total = 0;

    aircon_uart_drain();

    write_len = hi_uart_write(AIRCON_UART_ID, tx_buf, tx_len);
    if (write_len != (int)tx_len) {
        printf("[ac-uart] write failed, want=%u, got=%d\r\n", tx_len, write_len);
        return -1;
    }

    while (total < rx_len) {
        read_len = hi_uart_read_timeout(AIRCON_UART_ID, rx_buf + total,
            rx_len - total, AIRCON_ACK_TIMEOUT_MS);
        if (read_len <= 0) {
            break;
        }
        total += (unsigned int)read_len;
    }

    if (total != rx_len) {
        printf("[ac-uart] ack timeout, baud=%u, got=%u/%u\r\n",
            g_aircon_current_baud, total, rx_len);
        return -1;
    }

    return 0;
}

static int aircon_try_emit_frame(const unsigned char *frame, unsigned int len)
{
    unsigned char ack[AIRCON_FRAME_LEN];
    unsigned int try_count;
    unsigned int list_count;

    list_count = sizeof(g_aircon_baud_list) / sizeof(g_aircon_baud_list[0]);
    for (try_count = 0; try_count < list_count; ++try_count) {
        unsigned int index;
        unsigned int baud_rate;

        index = (g_aircon_baud_index + try_count) % list_count;
        baud_rate = g_aircon_baud_list[index];

        if (aircon_uart_open(baud_rate) != 0) {
            continue;
        }

        if (aircon_uart_exchange(frame, len, ack, len) != 0) {
            continue;
        }

        if (memcmp(frame, ack, len) != 0) {
            printf("[ac-uart] ack mismatch at baud=%u\r\n", baud_rate);
            continue;
        }

        g_aircon_baud_index = index;
        printf("[ac-uart] ack ok, baud=%u\r\n", baud_rate);
        return 0;
    }

    return -1;
}

int aircon_ctrl_init(void)
{
    if (aircon_uart_open(g_aircon_baud_list[g_aircon_baud_index]) != 0) {
        return -1;
    }

    g_aircon_state = AIRCON_STATE_UNKNOWN;
    printf("[ac] uart ready on GPIO0/1, initial baud=%u\r\n", g_aircon_current_baud);
    printf("[ac] group1=power_on, group2=power_off\r\n");
    return 0;
}

int aircon_ctrl_emit_group(unsigned short group_no)
{
    unsigned char frame[AIRCON_FRAME_LEN];

    if (group_no == 0) {
        return -1;
    }

    aircon_build_emit_group_frame(group_no, frame);
    printf("[ac] emit group=%u\r\n", group_no);
    return aircon_try_emit_frame(frame, sizeof(frame));
}

int aircon_ctrl_power_on(void)
{
    if (aircon_ctrl_emit_group(AIRCON_GROUP_POWER_ON) != 0) {
        return -1;
    }

    g_aircon_state = AIRCON_STATE_ON;
    return 0;
}

int aircon_ctrl_power_off(void)
{
    if (aircon_ctrl_emit_group(AIRCON_GROUP_POWER_OFF) != 0) {
        return -1;
    }

    g_aircon_state = AIRCON_STATE_OFF;
    return 0;
}

unsigned int aircon_ctrl_get_baud(void)
{
    return g_aircon_current_baud;
}

unsigned char aircon_ctrl_get_state(void)
{
    return g_aircon_state;
}

const char *aircon_ctrl_get_state_text(void)
{
    if (g_aircon_state == AIRCON_STATE_ON) {
        return "ON";
    }
    if (g_aircon_state == AIRCON_STATE_OFF) {
        return "OFF";
    }
    return "UNKNOWN";
}
