#include "lwip/netifapi.h"
#include "lwip/sockets.h"
#include "hal_bsp_log.h"
#include "wifi_device.h"
#include <stdio.h>
#include <unistd.h>
#include <string.h>
#include <stdlib.h>
#include "ohos_init.h"
#include "MQTTPacket.h"
#include "hal_bsp_mqtt.h"

#define MQTT_BUFF_MAX_SIZE  512

int g_tcp_socket_fd = 0;    // 网络套接字
unsigned char mqttBuff[MQTT_BUFF_MAX_SIZE] = {0};

// 发送网络数据
static int transport_sendPacketBuffer(unsigned char* buf, int buflen)
{
  int rc = send(g_tcp_socket_fd, buf, buflen, 0);

	return (rc <= 0) ? 0 : 1;
}
// 接收网络数据
static int transport_getdata(unsigned char* buf, int count)
{
	int rc = recv(g_tcp_socket_fd, buf, count, 0);
	return rc;
}

// 连接服务器
int MQTTClient_connectServer(const char *ip_addr, int ip_port)
{
  if(ip_addr == NULL)
    return -1;

  int res = 0;  // 函数返回值
  struct sockaddr_in tcpServerConfig;   // tcp服务器信息

  // 创建TCP套接字
  g_tcp_socket_fd = socket(AF_INET, SOCK_STREAM, 0);
  if(g_tcp_socket_fd < 0)
  {
    console_log_error("Failed to create Socket");
  }

  // 连接TCP服务器
  tcpServerConfig.sin_family = AF_INET;// IPV4
  tcpServerConfig.sin_port = htons(ip_port); // 填写服务器的IP端口号
  tcpServerConfig.sin_addr.s_addr = inet_addr(ip_addr); //填写服务器的IP地址

  res = connect(g_tcp_socket_fd, (struct sockaddr *)&tcpServerConfig, sizeof(tcpServerConfig)); //连接服务器
  if (res == -1)
  {
    console_log_error("Failed to connect to the server");
    return -1;
  }
  console_log_success("Connection to server successful");


  return 0;
}

// 断开TCP服务器 0:成功, -1:失败
int MQTTClient_unConnectServer(void)
{
  return close(g_tcp_socket_fd);
  console_log_success("Server shut down successfully");
}


// mqtt客户端 订阅主题
int MQTTClient_subscribe(char *subTopic)
{
  if(subTopic == NULL)
  {
    console_log_error("Incorrect parameters");
    return -1;
  } 

  int len = 0, res = 0;
  int subcount = 0, granted_qos = 0, req_qos = 0;
  unsigned short submsgid = 0;
  MQTTString topicString = MQTTString_initializer;

  /* subscribe */
  topicString.cstring = subTopic;
  len = MQTTSerialize_subscribe(mqttBuff, sizeof(mqttBuff), 0, 1, 1, &topicString, &req_qos);
  if(len <= 0)
  {
    console_log_error("MQTTSerialize_subscribe Error %d", len);
    return -1;
  }
  res = transport_sendPacketBuffer(mqttBuff, len);
  if( res != 1 )
  {
    console_log_error("transport_sendPacketBuffer Error %d", res);
    return -1;
  }

  sleep(1);
  memset(mqttBuff, 0, sizeof(mqttBuff));

  /* wait for suback */
  if (MQTTPacket_read(mqttBuff, sizeof(mqttBuff), transport_getdata) != SUBACK) 
  {
    console_log_error("MQTTPacket_read Error");
    return -1;
  }
  
  if (MQTTDeserialize_suback(&submsgid, 1, &subcount, &granted_qos, mqttBuff, sizeof(mqttBuff)) != 1)
  {
    console_log_error("MQTTDeserialize_suback Error");
    return -1;
  }

  console_log_success("MQTT subscribed to topics successfully");
  
  return 0;
}


// mqtt客户端 初始化
int MQTTClient_init(char *clientID, char *userName, char *password)
{
  if(clientID == NULL || userName == NULL || password == NULL)
  {
    console_log_error("Incorrect parameters");
    return -1;
  } 

  int res = 0, len = 0; 
  unsigned char sessionPresent = 0, connack_rc = 0;
  MQTTPacket_connectData mqttData = MQTTPacket_connectData_initializer;

  // 初始化MQTT客户端
  mqttData.clientID.cstring = clientID;
  mqttData.username.cstring = userName;
  mqttData.password.cstring = password;
  mqttData.cleansession = 1;
  mqttData.keepAliveInterval = 60;
  

  // 组MQTT消息包
  len = MQTTSerialize_connect(mqttBuff, sizeof(mqttBuff), &mqttData);
  if(len <= 0)
  {
    console_log_error("MQTTSerialize_connect Error %d", res);
    return -1;
  }
  res = transport_sendPacketBuffer(mqttBuff, len);
  if( res != 1 ) {
    console_log_error("transport_sendPacketBuffer Error %d", res);
    return -1;
  }

  sleep(3);

  /* 打印发送出去的数据帧，调试用 */
	console_log_info("MQTT_sendPacket:  ");
	for(int i = 0; i < len; i++)
	{
		printf("%x ", mqttBuff[i]);
	}
  console_log_info("");

  memset(mqttBuff, 0, sizeof(mqttBuff));

  /* wait for connack */
  if (MQTTPacket_read(mqttBuff, sizeof(mqttBuff), transport_getdata) != CONNACK)
  {
    console_log_info("MQTTPacket_read != CONNACK");
  }

	console_log_info("MQTT_recvPacket:  ");
	/* 打印服务器返回的消息，调试用 */
	for(int i = 0; i < 10; i++)
	{
		printf("%x ", mqttBuff[i]);
	}
  console_log_info("");
	
  if (MQTTDeserialize_connack(&sessionPresent, &connack_rc, mqttBuff, sizeof(mqttBuff)) != 1 || connack_rc != 0)
  {
    console_log_info("Unable to connect, return code %d", connack_rc);
	  memset(mqttBuff, 0, sizeof(mqttBuff));
    return -1;
  }else
    console_log_success("MQTT initialized successfully");
	memset(mqttBuff, 0, sizeof(mqttBuff));
  return 0;
}

int MQTTClient_pub(char *pub_Topic, unsigned char *payloadData, int payloadLen)
{
  if (payloadData == NULL)
  {
    console_log_error("Incorrect parameters");
    return -1;
  }

  int ret = 0,len = 0;
  unsigned short retry_count = 5; // 重发次数
  unsigned char sendBuff[MQTT_BUFF_MAX_SIZE] = {0};
  MQTTString topicString = MQTTString_initializer;

  topicString.cstring = pub_Topic;
  len = MQTTSerialize_publish(sendBuff, sizeof(sendBuff), 0, 0, 0, 0, topicString,
                                        payloadData,
                                        payloadLen);
  while( --retry_count > 0 ) {
    ret = transport_sendPacketBuffer(sendBuff, len);
    if( ret == 1 ) {
      break;
    }
    
    console_log_error("Send MQTT_Data Fail");
    usleep(100*1000);
  }

  if( !retry_count && ret != 1 ) {
    console_log_error("transport_sendPacketBuffer Error %d", ret);
    return -1;
  }

  // console_log_info("send==>%s", payloadData);
  return 0;
}
unsigned char mqtt_topic[200];
int8_t (*p_MQTTClient_sub_callback)(unsigned char *topic, unsigned char *payload);

int MQTTClient_sub(void)
{
  int qos,payloadlen_in;
  unsigned char dup,retained;
  unsigned short msgid;
  unsigned char* payload_in;
  MQTTString receivedTopic ;

  memset(mqttBuff, 0, sizeof(mqttBuff));

  if (MQTTPacket_read(mqttBuff, sizeof(mqttBuff), transport_getdata) == PUBLISH)
  {
    MQTTDeserialize_publish(&dup, &qos, &retained, &msgid, &receivedTopic,
                            &payload_in, &payloadlen_in, mqttBuff, sizeof(mqttBuff));

    // printf("topic:[%s]", receivedTopic.lenstring.data);
    // printf("topicLen: [%d]", strlen(receivedTopic.lenstring.data) - payloadlen_in + 1);
    // printf("payloadlen_in: [%d]", payloadlen_in);
    // printf("\ntopic=>[%s]\ndata=>[%s]",mqtt_topic, payload_in);

    strncpy(mqtt_topic, receivedTopic.lenstring.data, strlen(receivedTopic.lenstring.data)-payloadlen_in);
    p_MQTTClient_sub_callback(mqtt_topic, payload_in);
  }
}