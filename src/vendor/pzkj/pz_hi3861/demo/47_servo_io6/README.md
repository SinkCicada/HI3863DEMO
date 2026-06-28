# Wi-Fi Door Servo Demo

## 功能

这个示例把 `46_wifi_check` 的联网思路和 `47_servo_io6` 的舵机控制结合起来，做成了一个像 `44_wifi_led_server` 一样的 TCP 服务设备。

- 舵机控制引脚：`GPIO6`
- 上电默认角度：`99` 度，表示门关闭
- 开门角度：`28` 度
- 设备连上 WiFi 后监听 `TCP 8000` 端口
- 局域网内其他电脑可直接访问设备 `IP:8000`

## 启动方式

### 1. 选择示例入口

确认总入口文件 [demo/BUILD.gn](/d:/Users/asus/Desktop/hi3863demo/src/vendor/pzkj/pz_hi3861/demo/BUILD.gn:16) 中启用的是：

```gn
"47_servo_io6:template",
```

并确保其他不需要的 demo 处于注释状态。

### 2. 编译

在工程根目录执行：

```powershell
.\build.bat
```

如果要完整重编：

```powershell
.\rebuild.bat
```

### 3. 烧录

```powershell
.\upload.bat
```

### 4. 查看串口日志

```powershell
.\monitor.bat
```

按一下开发板 `RESET` 后，正常应看到类似日志：

```text
[boot] default door state=CLOSED angle=99
[wifi] connected, local ip: 192.168.1.xx
[tcp] server listening on 192.168.1.xx:8000
```

## 网络控制方式

设备本身就是 TCP Server。

只要其他电脑和开发板在同一个 WiFi / 局域网下，就可以直接连接开发板打印出来的：

```text
设备IP:8000
```

例如：

```text
192.168.1.62:8000
```

## 协议格式

总长固定 `32` 字节：

```text
包头(2字节) + CRC32(4字节) + 内容(24字节) + 包尾(2字节)
```

固定字段：

- 包头：`AA 55`
- 包尾：`55 AA`
- CRC32：标准 CRC32
- 多项式：`0xEDB88320`
- 初始值：`0xFFFFFFFF`
- 结果异或：`0xFFFFFFFF`
- CRC32 校验范围：仅内容 `24` 字节
- CRC32 字节序：小端序，低字节在前

## 内容区定义

内容区共 `24` 字节，结构和 `44_wifi_led_server` 一样：

| 偏移 | 长度 | 含义 |
| --- | --- | --- |
| 0 | 1 | 命令码 |
| 1 | 1 | 房间号 |
| 2 | 1 | 状态/参数 |
| 3~23 | 21 | 预留，填 `0` |

本示例里只有一个门控对象，因此：

- 房间号固定为 `0`

## 命令定义

### 接收命令

#### 1. 汇报状态

- 命令码：`0`
- 房间号：`0`
- 参数：`1`

说明：

- 请求设备汇报门状态

请求内容区：

```text
00 00 01 00 ... 00
```

#### 2. 门状态控制

- 命令码：`1`
- 房间号：`0`
- 参数：
  - `0`：关门，舵机转到 `99°`
  - `1`：开门，舵机转到 `28°`

关门请求内容区：

```text
01 00 00 00 ... 00
```

开门请求内容区：

```text
01 00 01 00 ... 00
```

### 发送响应

设备响应时返回的也是 32 字节固定包，内容区格式如下：

- 命令码：`1`
- 房间号：`0`
- 参数：
  - `0`：当前门关闭
  - `1`：当前门打开

例如门当前关闭时，响应内容区：

```text
01 00 00 00 ... 00
```

门当前打开时，响应内容区：

```text
01 00 01 00 ... 00
```

## 本机 / 其他电脑如何控制

工程根目录已经放了测试脚本：

[door_client.py](/d:/Users/asus/Desktop/hi3863demo/door_client.py:1)

使用方式：

```powershell
python door_client.py open 192.168.1.62
python door_client.py close 192.168.1.62
python door_client.py query 192.168.1.62
```

说明：

- `open`：发开门命令
- `close`：发关门命令
- `query`：查询当前门状态

返回里：

- `state: 0` 表示门关闭
- `state: 1` 表示门打开

## 调试观察点

串口重点看这些日志：

```text
[door] init closed, angle=99
[door] open, angle=28
[door] close, angle=99
[proto] reply cmd=0x01 room=0 value=0 angle=99
[proto] reply cmd=0x01 room=0 value=1 angle=28
```

## 相关文件

- [template.c](/d:/Users/asus/Desktop/hi3863demo/src/vendor/pzkj/pz_hi3861/demo/47_servo_io6/template.c:1)：启动入口
- [door_ctrl.c](/d:/Users/asus/Desktop/hi3863demo/src/vendor/pzkj/pz_hi3861/demo/47_servo_io6/door_ctrl.c:1)：门状态与角度控制
- [servo_io6.c](/d:/Users/asus/Desktop/hi3863demo/src/vendor/pzkj/pz_hi3861/demo/47_servo_io6/servo_io6.c:1)：舵机底层驱动
- [wifi_door_server.c](/d:/Users/asus/Desktop/hi3863demo/src/vendor/pzkj/pz_hi3861/demo/47_servo_io6/wifi_door_server.c:1)：TCP 服务与协议实现
