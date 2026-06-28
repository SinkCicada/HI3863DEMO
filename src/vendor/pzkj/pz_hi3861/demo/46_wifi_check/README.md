# Wi-Fi Check Demo

## 功能

这个目录是 WiFi 联网检查示例。

- 连接指定 WiFi
- 串口打印联网状态和 IP
- 用 LED 表示联网过程
- 使用软件串口输出辅助日志

它本身不做 TCP 远程控制，只负责验证设备能否正常联网。

## 启动方式

### 1. 选择示例入口

如果你要单独运行这个联网检查示例，请在 [demo/BUILD.gn](/d:/Users/asus/Desktop/hi3863demo/src/vendor/pzkj/pz_hi3861/demo/BUILD.gn:16) 中启用：

```gn
"46_wifi_check:template",
```

并把其他入口先注释掉。

### 2. 编译

```powershell
.\build.bat
```

### 3. 烧录

```powershell
.\upload.bat
```

### 4. 查看串口

```powershell
.\monitor.bat
```

正常情况下按复位后，会看到：

```text
PZKJ Hi3861 Wi-Fi check demo
[wifi-check] connecting to SSID: ...
[wifi-check] connected, local ip: ...
```

## 和 47_servo_io6 的关系

- `46_wifi_check`：只检查联网是否正常
- `47_servo_io6`：在联网基础上继续提供 TCP 门控服务

如果你只是想调 WiFi 连接问题，先跑 `46` 会更轻松。
