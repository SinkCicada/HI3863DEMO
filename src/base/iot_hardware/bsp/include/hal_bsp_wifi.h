#ifndef __HAL_BSP_WIFI_H
#define __HAL_BSP_WIFI_H

#include "cmsis_os2.h"
#include "wifi_error_code.h"

/**
 * @brief WIFI  创建wifi热点
 * @param ssid WiFi名称 
 * @param psk  WiFi密码
 * @return Returns {WIFI_SUCCESS} 成功;
 *         Returns {other} 失败.
 */
WifiErrorCode WiFi_createHotspots(const char *ssid, const char *psk);
/**
 * @brief WIFI  连接附近的WiFi
 * @param ssid WiFi名称 
 * @param psk  WiFi密码
 * @return Returns {WIFI_SUCCESS} 成功;
 *         Returns {other} 失败.
 */
WifiErrorCode WiFi_connectHotspots(const char *ssid, const char *psk);
/**
 * @brief  获取连接WiFi后的本地IP地址
 * @note   
 * @retval IP地址-字符串
 */
char* WiFi_GetLocalIP(void);

#endif

