#include "hal_bsp_log.h"
#include "hal_bsp_nfc.h"
#include "hal_bsp_nfc_to_wifi.h"
#include "hal_bsp_wifi.h"

#include "cJSON.h"
#include <stdio.h>
#include <unistd.h>
#include <string.h>
#include <stdlib.h>
/**
 * @brief  使用NFC进行配网
 * @note   驱动NDEF协议中的第一个标签数据，然后进行配网，
 * @param  *ndefBuff: 标签数据的缓冲区
 * @retval 
 */
uint32_t NFC_configuresWiFiNetwork(uint8_t *ndefBuff)
{
  if(ndefBuff == NULL)
  {
    console_log_error("NFC_configuresWiFiNetwork to ndefBuff is NULL");
    return HI_ERR_FAILURE;
  }
  uint8_t ret = 0; 
  uint8_t payloadLength = ndefBuff[NDEF_PROTOCOL_DATA_LENGTH_OFFSET];   // 获取数据长度
  if(ndefBuff[NDEF_PROTOCOL_DATA_TYPE_OFFSET] == 't') // 查看是不是文本信息
  {
    uint8_t *payload = (uint8_t *)malloc(payloadLength);
    if(payload == NULL)
    {
      console_log_error("payload malloc failed.");
      return HI_ERR_FAILURE;
    }
    memset(payload, 0, payloadLength);
    memcpy(payload, ndefBuff+NDEF_PROTOCOL_VALID_DATA_OFFSET, payloadLength);
    console_log_info("payload = %s", payload);

    cJSON *root = cJSON_Parse(payload);
    if(root)
    {
      cJSON *ssid = cJSON_GetObjectItem(root, "ssid");
      cJSON *password = cJSON_GetObjectItem(root, "passwd");
      if(ssid != NULL && password != NULL)
      {
        console_log_info("ssid = %s, password = %s", ssid->valuestring, password->valuestring);
        // 连接wifi
        if( WIFI_SUCCESS == WiFi_connectHotspots(ssid->valuestring, password->valuestring)) 
        {
          console_log_info("thongth to nfc connect wifi is success.");
          ret = 0;
        }
        else{
          console_log_error("thongth to nfc connect wifi is failed.");
          ret = 1;
        }
      }
      ssid = NULL;
      password = NULL;
    } 
    cJSON_Delete(root);
    root = NULL;

    free(payload);
    payload = NULL;
  }
  else
  {
    console_log_error("data type is not 't'!");
    return HI_ERR_FAILURE;
  }

  return ret; 
}

