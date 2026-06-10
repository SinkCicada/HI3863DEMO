#include <string.h>
#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include "hal_bsp_wifi.h"
#include "wifi_device.h"
#include "wifi_hotspot.h"
#include "lwip/netifapi.h"
#include "lwip/netif.h"
#include "lwip/ip4_addr.h"
#include "lwip/api_shell.h"
#include "hal_bsp_log.h"


#define DEF_TIMEOUT 15
static int g_ConnectSuccess = 0;
#define SELECT_WLAN_PORT "wlan0"
static struct netif *g_lwip_netif = NULL;
static char g_IP_Addr[20] = {0};    // 连接wifi热点之后，获取到的IP地址

/**
 * @brief  获取连接WiFi后的本地IP地址
 * @note   
 * @retval IP地址-字符串
 */
char* WiFi_GetLocalIP(void)
{
  return g_IP_Addr;
}
/**
 * 获取WiFi的IP地址
 **/
void Sta_GetWiFiIP(struct netif *netif, char *ip)
{
  int ret;
  if(netif == NULL){
    return ;
  }

  ip4_addr_t ipAddr;
  ip4_addr_t netMask;
  ip4_addr_t gateWay;

  ret = netifapi_netif_get_addr(netif, &ipAddr, &netMask, &gateWay);
  if (ret == 0) {
    inet_ntop(AF_INET, &ipAddr, ip, INET_ADDRSTRLEN);
  }
}

WifiErrorCode WiFi_createHotspots(const char *ssid, const char *psk)
{
  WifiErrorCode result;

  console_log_info("Start initialization of WiFi hotspots");
  
  // 使能WiFi
  result = EnableWifi();
  if(result != WIFI_SUCCESS)
  {
    console_log_error("Enable WiFi failed");
    return result;
  }
  // 判断WiFi是否激活
  result = IsWifiActive();
  if(result != WIFI_STA_ACTIVE)
  {
    console_log_error("WiFi activation failed");
    return result;
  }

  // 设置指定的热点信息
  HotspotConfig hotspotConfig = {0};
  strcpy(hotspotConfig.ssid, ssid);
  strcpy(hotspotConfig.preSharedKey, psk);
  hotspotConfig.securityType = WIFI_SEC_TYPE_PSK;
  hotspotConfig.band = HOTSPOT_BAND_TYPE_2G;
  hotspotConfig.channelNum = 5;
  result = SetHotspotConfig(&hotspotConfig);
  if(result != WIFI_SUCCESS)
  {
    console_log_error("Failed to set WiFi hotspot information");
    return result;
  }

  // 开启WiFi热点模式
  result = EnableHotspot();
  if(result != WIFI_SUCCESS)
  {
    console_log_error("Failed to enable wifi hotspot mode");
    return result;
  }

  // 检查WiFi热点是否激活
  result = IsHotspotActive();
  if(result != WIFI_HOTSPOT_ACTIVE)
  {
    console_log_error("WiFi hotspot activation failed");
    return result;
  }
  
  console_log_success("WiFi hotspot initialized successfully");

  return WIFI_SUCCESS;
}

// 连接WiFi热点时的状态发生改变的回调函数
static void ConnectionWifiChangedHandler(int state, WifiLinkedInfo *info)
{
  if (info == NULL)
  {
    console_log_error("WifiConnectionChanged:info is null");
  }
  else
  {
    if (state == WIFI_STATE_AVALIABLE)
    {
      g_ConnectSuccess = 1;
    }
    else
    {
      g_ConnectSuccess = 0;
    }
  }
}
// 等待连接热点 默认15s的超时时间
static int WaitConnectResult(void)
{
  int ConnectTimeout = DEF_TIMEOUT;
  while (ConnectTimeout > 0)
  {
    sleep(1);
    ConnectTimeout--;
    printf(".");
    if (g_ConnectSuccess == 1)
    {
      console_log_info("WaitConnectResult:wait success[%d]s", (DEF_TIMEOUT - ConnectTimeout));
      break;
    }
  }
  if (ConnectTimeout <= 0)
  {
    console_log_error("WaitConnectResult:timeout!");
    return 0;
  }

  return 1;
}
WifiErrorCode WiFi_connectHotspots(const char *ssid, const char *psk)
{
  WifiErrorCode result;

  console_log_info("Start Connect of WiFi hotspots");
  
  // 使能WiFi
  result = EnableWifi();
  if(result != WIFI_SUCCESS)
  {
    console_log_error("Enable WiFi failed");
    return result;
  }
  // 判断WiFi是否激活
  result = IsWifiActive();
  if(result != WIFI_STA_ACTIVE)
  {
    console_log_error("WiFi activation failed");
    return result;
  }
  // 注册wifi的回调函数
  WifiEvent eventConfig = {0};
  eventConfig.OnWifiConnectionChanged = ConnectionWifiChangedHandler;    // WiFi连接的状态改变
  result = RegisterWifiEvent(&eventConfig);
  if(result != WIFI_SUCCESS)
  {
    console_log_error("Failed to register WiFi callback function");
    return result;
  }

  // 连接指定的WiFi热点
  WifiDeviceConfig wifiDeviceConfig = {0};
  int wifiResult = 0;
  strcpy(wifiDeviceConfig.ssid, ssid);  // 连接WiFi的名称
  strcpy(wifiDeviceConfig.preSharedKey, psk); // WiFi的密码
  wifiDeviceConfig.securityType = WIFI_SEC_TYPE_PSK;  // WiFi的安全性
  result = AddDeviceConfig(&wifiDeviceConfig, &wifiResult);
  if (result == WIFI_SUCCESS)
  {
    if (ConnectTo(wifiResult) == WIFI_SUCCESS && WaitConnectResult() == 1)
    {
      console_log_success("wifi connect succeed!");
      g_lwip_netif = netifapi_netif_find(SELECT_WLAN_PORT);
      //启动DHCP
      if (g_lwip_netif)
      {
        dhcp_start(g_lwip_netif);
        console_log_info("begain to dhcp");
      }

      //等待DHCP
      for (;;)
      {
        if (dhcp_is_bound(g_lwip_netif) == ERR_OK)
        {
          console_log_info("<-- DHCP state:OK -->");
          Sta_GetWiFiIP(g_lwip_netif, g_IP_Addr);
          // console_log_info("connect wifi IP addr: %s", g_IP_Addr);
          break;
        }
        printf("#");
        sleep(1);
      }
    }
    else 
      return ERROR_WIFI_BUSY;
  }
  return WIFI_SUCCESS;
}

