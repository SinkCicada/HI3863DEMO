#include <stdio.h>
#include <stdarg.h>
#include <unistd.h>

#include "cmsis_os2.h"
#include "hi_gpio.h"
#include "hi_io.h"
#include "hi_isr.h"
#include "hi_time.h"
#include "ohos_init.h"

#include "bsp_led.h"
#include "bsp_wifi.h"

#define WIFI_SSID "TEST-2.4GHz"
#define WIFI_PASSWORD "8888888867"
#define WIFI_RETRY_INTERVAL_S 2
#define SOFT_UART_BAUD 9600
#define SOFT_UART_BIT_US 104
#define SOFT_UART_LOG_BUF_SIZE 192
#define SOFT_UART_TX_IO HI_IO_NAME_GPIO_0
#define SOFT_UART_TX_GPIO HI_GPIO_IDX_0
#define SOFT_UART_RX_IO HI_IO_NAME_GPIO_1
#define SOFT_UART_RX_GPIO HI_GPIO_IDX_1

static osThreadId_t g_wifi_check_task_id = NULL;
static osThreadId_t g_wifi_led_task_id = NULL;
static volatile int g_soft_uart_ready = 0;

typedef enum {
    WIFI_LED_CONNECTING = 0,
    WIFI_LED_FAILED = 1,
    WIFI_LED_CONNECTED = 2,
} wifi_led_state_t;

static volatile wifi_led_state_t g_wifi_led_state = WIFI_LED_CONNECTING;

static void soft_uart_tx_level(hi_gpio_value level)
{
    hi_gpio_set_ouput_val(SOFT_UART_TX_GPIO, level);
}

static void soft_uart_init(void)
{
    hi_io_set_pull(SOFT_UART_TX_IO, HI_IO_PULL_UP);
    hi_io_set_func(SOFT_UART_TX_IO, HI_IO_FUNC_GPIO_0_GPIO);
    hi_gpio_set_dir(SOFT_UART_TX_GPIO, HI_GPIO_DIR_OUT);
    soft_uart_tx_level(HI_GPIO_VALUE1);

    hi_io_set_pull(SOFT_UART_RX_IO, HI_IO_PULL_UP);
    hi_io_set_func(SOFT_UART_RX_IO, HI_IO_FUNC_GPIO_1_GPIO);
    hi_io_set_input_enable(SOFT_UART_RX_IO, HI_TRUE);
    hi_gpio_set_dir(SOFT_UART_RX_GPIO, HI_GPIO_DIR_IN);

    g_soft_uart_ready = 1;
}

static void soft_uart_send_byte(unsigned char data)
{
    unsigned char bit;
    hi_u32 int_value;

    int_value = hi_int_lock();

    soft_uart_tx_level(HI_GPIO_VALUE0);
    hi_udelay(SOFT_UART_BIT_US);

    for (bit = 0; bit < 8; ++bit) {
        soft_uart_tx_level((data & 0x01) ? HI_GPIO_VALUE1 : HI_GPIO_VALUE0);
        hi_udelay(SOFT_UART_BIT_US);
        data >>= 1;
    }

    soft_uart_tx_level(HI_GPIO_VALUE1);
    hi_udelay(SOFT_UART_BIT_US);

    hi_int_restore(int_value);
}

static void soft_uart_send_string(const char *text)
{
    if (!g_soft_uart_ready || text == NULL) {
        return;
    }

    while (*text != '\0') {
        soft_uart_send_byte((unsigned char)*text);
        ++text;
    }
}

static void debug_log(const char *fmt, ...)
{
    char buffer[SOFT_UART_LOG_BUF_SIZE];
    va_list args;
    int len;

    va_start(args, fmt);
    len = vsnprintf(buffer, sizeof(buffer), fmt, args);
    va_end(args);

    if (len < 0) {
        return;
    }

    buffer[sizeof(buffer) - 1] = '\0';
    printf("%s", buffer);
    soft_uart_send_string(buffer);
}

static void flash_led(unsigned char times, unsigned int on_ms, unsigned int off_ms)
{
    unsigned char i;

    for (i = 0; i < times; ++i) {
        LED(1);
        usleep(on_ms * 1000);
        LED(0);
        usleep(off_ms * 1000);
    }
}

static void wifi_led_task(void)
{
    while (1) {
        if (g_wifi_led_state == WIFI_LED_CONNECTED) {
            LED(1);
            usleep(300 * 1000);
            continue;
        }

        if (g_wifi_led_state == WIFI_LED_FAILED) {
            LED(1);
            usleep(120 * 1000);
            LED(0);
            usleep(120 * 1000);
            LED(1);
            usleep(120 * 1000);
            LED(0);
            usleep(640 * 1000);
            continue;
        }

        LED(1);
        usleep(200 * 1000);
        LED(0);
        usleep(800 * 1000);
    }
}

static void wifi_check_task(void)
{
    int ret;

    while (1) {
        g_wifi_led_state = WIFI_LED_CONNECTING;
        debug_log("[wifi-check] connecting to SSID: %s\r\n", WIFI_SSID);
        ret = WiFi_connectHotspots(WIFI_SSID, WIFI_PASSWORD);
        if (ret == WIFI_SUCCESS) {
            debug_log("[wifi-check] connected, local ip: %s\r\n", WiFi_GetLocalIP());
            g_wifi_led_state = WIFI_LED_CONNECTED;
            flash_led(3, 150, 150);
            while (1) {
                sleep(1);
            }
        }

        debug_log("[wifi-check] connect failed, code=%d\r\n", ret);
        g_wifi_led_state = WIFI_LED_FAILED;
        sleep(WIFI_RETRY_INTERVAL_S);
    }
}

static void wifi_check_demo(void)
{
    osThreadAttr_t task_options = {0};
    osThreadAttr_t led_task_options = {0};

    led_init();
    soft_uart_init();

    debug_log("PZKJ Hi3861 Wi-Fi check demo\r\n");
    debug_log("Soft UART: TX=GPIO0, RX=GPIO1, %d 8N1\r\n", SOFT_UART_BAUD);
    debug_log("SSID=%s\r\n", WIFI_SSID);

    led_task_options.name = "wifiLed";
    led_task_options.stack_size = 1024 * 2;
    led_task_options.priority = osPriorityBelowNormal;

    g_wifi_led_task_id = osThreadNew((osThreadFunc_t)wifi_led_task, NULL, &led_task_options);
    if (g_wifi_led_task_id != NULL) {
        debug_log("Create wifi led task success, id=%d\r\n", g_wifi_led_task_id);
    } else {
        debug_log("Create wifi led task failed\r\n");
    }

    task_options.name = "wifiCheck";
    task_options.stack_size = 1024 * 8;
    task_options.priority = osPriorityNormal;

    g_wifi_check_task_id = osThreadNew((osThreadFunc_t)wifi_check_task, NULL, &task_options);
    if (g_wifi_check_task_id != NULL) {
        debug_log("Create wifi check task success, id=%d\r\n", g_wifi_check_task_id);
    } else {
        debug_log("Create wifi check task failed\r\n");
    }
}

SYS_RUN(wifi_check_demo);
