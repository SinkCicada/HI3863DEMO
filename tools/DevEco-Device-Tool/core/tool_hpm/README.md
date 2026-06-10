[简体中文](./README_ZH.md) | English
# hpm-cli

> The HarmonyOS Package Manager command line interface.

## How to install it?

Install this globally and you'll have access to the hpm command anywhere on your system. The hpm-cli only support versions >=12.x of nodejs.

```sh
npm install -g @ohos/hpm-cli
```
## How to use it?
List all available commands using:
```sh
hpm help
```

## Update to the latest version
```sh
npm update -g @ohos/hpm-cli
```
## How to uninstall it?
```sh
npm rm -g @ohos/hpm-cli
```
## Configuration
The config file is located at ~/.hpm/hpmrc, List default configurations using:
```sh
hpm config
```
Set the configuration using:
```sh
hpm config set key value
```
The config file is as follows:
```properties
registry = https://repo.harmonyos.com

### login Settings
# loginUser = invitation_code

#### Path Settings
# shellPath = C:\WINDOWS\System32\cmd.exe
# globalRepo = C:\Users\username\.hpm\global

#### Network Settings
# no_proxy = *.server.com
# http_proxy = http://user:pwd@proxy_server:port
# https_proxy = http://user:pwd@proxy_server:port
# strictSsl = true

#### Other Settings
# privateSupport = true|false
# ignoreBundles = @ohos/llvm,@ohos/gn,
# OSPlatform = Auto|linux|darwin|win32
# restoreCodeSegment = true|false
```

## What's new
1.5.0
### 优化
* stored the http_proxy and https_proxy configuations in ciphertext when exec the command hpm config set http_proxy|https_proxy
* add some options for hpm search
    - -b,--board: Search by the type of board, such as 'hispark_pegasus', 'v200zr', 'gr5515_sk'
    - -k,--kernel: Search by the type of kernel, such as 'liteos-m', 'linux'
    - -os,--osVersion: Search by the os version, such as '3.0', '3.1'

1.4.5
### FEATURES
* add pulishType `chip-defintion`
### FIXED
* remove tempdir when install bundle
* add action for hpm config
    - hpm config list: list all configurations in the .hpmrc
    - hpm config get <key>: get value for the Specify key

1.4.1
### FEATURES
* supports snapshot bundle.
  
### FIXED
* update dependencies

1.4.0
### FEATURES
* add hpm ui plugin support :desginer
* add hpm ui plugin support :search
* add hpm ui plugin support :explore

1.3.0
### FEATURES
* update hpm ui plugin: configurator
  
### FIXED
* impoved performance

1.2.6
### FEATURES

* add command 'fetch' for download tools
* add command 'download' for download a bundle by name
* add command 'code' for code-segment restore|clean
* add configuration item 'ignoreBundles'
* add configuration item 'OSPlatform'
* add configuration item 'batchDownloadLimit'
* add plugins store (UI)
  
### FIXED
* improved command 'install'

1.2.0
### FEATURES
* add hpm ui plugin support :configurator
* add private package support

1.1.0
### FEATURES
* support hpm ui

