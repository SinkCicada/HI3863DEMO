# 60 Multi-Service Hub

这个固件现在只保留两个功能：

- `45_temp_humi_tcp_server`：DHT11 温湿度文本流
- `47_servo_io6`：门控舵机二进制控制

`44_wifi_led_server` 已删除，不再编译 LED 控制功能。

## 端口和协议

板子只监听一个 TCP 端口：

```text
设备IP:8000
```

同一个端口用首包内容区分协议：

- 门控：32 字节二进制包，包头 `AA 55`，沿用门控命令格式。
- 温湿度：文本命令，客户端先发送 `TEMP\n`，然后板子持续返回文本行。

## 引脚

- `GPIO7`：DHT11
- `GPIO6`：门控舵机

## 启动方式

在 `src/vendor/pzkj/pz_hi3861/demo/BUILD.gn` 中启用：

```gn
"60_multi_service_hub:template",
```

然后编译、烧录：

```powershell
.\build.bat
.\upload.bat
```

需要完整重编时使用：

```powershell
.\rebuild.bat
```

## 正常日志

串口里应看到类似：

```text
[hub] connected, local ip: 192.168.1.62
[hub] one device, one IP, one port: 8000
[hub] enabled: 45 temp/humi + 47 door servo; 44 LED removed
[hub] server listening on 192.168.1.62:8000
[hub] protocol: door=binary32, temp=text command TEMP
```

## PC 端命令

扫描协议：

```powershell
python .\hub_client.py 192.168.1.62 scan
```

读取温湿度：

```powershell
python .\hub_client.py 192.168.1.62 temp --count 10
```

门控：

```powershell
python .\hub_client.py 192.168.1.62 door open
python .\hub_client.py 192.168.1.62 door close
python .\hub_client.py 192.168.1.62 door query
```

注意：温湿度默认是持续流。如果不带 `--count`，这个连接会一直占用当前端口；要再发门控命令，先按 `Ctrl+C` 断开温湿度客户端。
