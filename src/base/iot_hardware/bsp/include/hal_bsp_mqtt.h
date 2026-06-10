#ifndef __HAL_BSP_MQTT_H
#define __HAL_BSP_MQTT_H

/**
 * @brief MQTT  连接MQTT服务器
 * @param ip_addr 服务器的IP地址 
 * @param ip_port 服务器的IP端口号
 * @return Returns {0} 成功;
 *         Returns {-1} 失败.
 */
int MQTTClient_connectServer(const char *ip_addr, int ip_port);
/**
 * @brief MQTT  断开连接MQTT服务器
 * @param 无
 * @return Returns {0} 成功;
 *         Returns {-1} 失败.
 */
int MQTTClient_unConnectServer(void);
/**
 * @brief MQTT  订阅MQTT主题
 * @param subTopic 具有订阅权限的主题名称 
 * @return Returns {0} 成功;
 *         Returns {-1} 失败.
 */
int MQTTClient_subscribe(char *subTopic);
/**
 * @brief MQTT 客户端的初始化
 * @param clientID  客户端ID 
 * @param userName  用户名
 * @param password  密码
 * @return Returns {0} 成功;
 *         Returns {-1} 失败.
 */
int MQTTClient_init(char *clientID, char *userName, char *password);
/**
 * @brief MQTT 发布消息
 * @param pub_Topic 具有发布权限的主题名称
 * @param payloadData  发布数据
 * @param payloadLen 发布数据的长度
 * @return Returns {0} 成功;
 *         Returns {-1} 失败.
 */
int MQTTClient_pub(char *pub_Topic, unsigned char *payloadData, int payloadLen);
/**
 * @brief MQTT  接收消息
 * @param callback 当接收到消息之后，将消息传到到回调函数中 
 * @return Returns {0} 成功;
 *         Returns {-1} 失败.
 */
int MQTTClient_sub(void);

extern int8_t (*p_MQTTClient_sub_callback)(unsigned char *topic, unsigned char *payload);


#endif // !__HAL_BSP_MQTT_H
