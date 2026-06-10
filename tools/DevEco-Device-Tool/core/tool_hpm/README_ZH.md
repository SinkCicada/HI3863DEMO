简体中文 | [English](./README.md)
# hpm-cli

> HarmonyOS 包管理器命令行工具


## 如何安装?

全局安装，可在系统任何地方访问。hpm-cli仅支持nodejs12.x及以上版本
```sh
npm install -g @ohos/hpm-cli
```

## 如何使用?

显示所有命令，执行：
```sh
hpm help
```

## 如何更新版本?

```sh
npm update -g @ohos/hpm-cli
```
## 如何卸载?

```sh
npm rm -g @ohos/hpm-cli
```
## 如何更改配置?
配置文件存放在~/.hpm/hpmrc, 显示默认配置，执行:
```sh
hpm config
```
设置配置，执行:
```sh
hpm config set key value
```
配置文件的内容如下所示:
```properties
registry = https://repo.harmonyos.com

### 登录设置
# loginUser = invitation_code

#### 路径设置
# shellPath = C:\WINDOWS\System32\cmd.exe
# globalRepo = C:\Users\username\.hpm\global

#### 网络设置
# no_proxy = *.server.com
# http_proxy = http://account:pwd@proxy_server:port
# https_proxy = http://account:pwd@proxy_server:port
# strictSsl = true

#### 其他设置
# privateSupport = true|false
# ignoreBundles = @ohos/llvm,@ohos/gn,
# OSPlatform = Auto|linux|darwin|win32
# restoreCodeSegment = true|false
```

## 最新动态
1.5.0
### 优化
* http_proxy、https_proxy代理的配置在.hpmrc文件中以密文形式存储
* hpm search命令添加新的选项
    - -b,--board: 根据开发版类型搜索发行版、组件包
    - -k,--kernel：根据内核类型搜索发行版、组件包
    - -os,--osVersion：根据os版本类型搜索组件、发行版
    - 增加--type solution类型对开源发行版的搜索

1.4.5
### 功能
* 增加新的发布类型 `chip-defintion`
### 优化
* 本地下载时清除临时目录下的文件
* 优化hpm config命令:
    - hpm config list: 查看所有配置项
    - hpm config get <key>: 查看某一个配置项

1.4.1
### 功能
* 支持快照版本的组件包下载等
### Bug修复
* 修复hpm update的bug

1.4.0
### 功能
* 添加的新的hpm ui插件: desginer
* 添加的新的hpm ui插件: search
* 添加的新的hpm ui插件: explore

1.3.0
### 功能
* 添加的新的hpm ui插件: configurator
  
### 优化
* 优化下载时的速度

1.2.6
### 功能
* 新增 fetch命令，针对集成的工具组件下载地址获取组件的压缩包
* 新增 download 命令，下载组件的bundle压缩包
* 新增 code 命令，针对code-segment 进行代码还原和清理
* 改进 install 命令执行过程和日志信息
* 新增配置项 ignoreBundles，忽略这些组件的安装
* 新增配置项 OSPlatform，可指定工具组件下载对应OS平台的版本
* 新增配置项 batchDownloadLimit，限制批量下载个数，默认值4
* UI 增加插件管理功能