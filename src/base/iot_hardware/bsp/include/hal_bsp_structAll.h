#ifndef HAL_BSP_STRUCTALL_H__
#define HAL_BSP_STRUCTALL_H__

// 使用位域定义IO扩展芯片的外部接口
typedef union _PCF8574_IO
{
  unsigned char all;
  struct PCF8574_REG
  {
    unsigned char p0 : 1;    // P0口   
    unsigned char p1 : 1;    
    unsigned char p2 : 1;
    unsigned char p3 : 1;

    unsigned char p4 : 1;
    unsigned char p5 : 1;
    unsigned char p6 : 1;
    unsigned char p7 : 1;     // P7口
  } bit;
} tn_pcf8574_io_t;


#define NV_ID 0x0B
typedef struct {
    unsigned short smartControl_flag;
    unsigned short light_upper;
    unsigned short light_lower; 
    unsigned char humi_upper;
    unsigned char humi_lower; 
} hi_nv_save_sensor_threshold;

#endif // !HAL_BSP_STRUCTALL_H__
