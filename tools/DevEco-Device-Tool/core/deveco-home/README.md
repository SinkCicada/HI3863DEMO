# deveco-home

## 开发指南

### 环境准备

安装yarn: 执行 npm install -g yarn

git设置 ：git config --global core.autocrlf false

### 拉包

执行 yarn

### 启动

执行 yarn start

此命令会在本地的9000端口启动调试服务，所有文件变更都会热加载

### 切换中英文

将url中的en改为zh

### 所有可执行脚本说明

yarn start: 启动外部版本的dark主题调试服务

yarn start-internal: 启动内部版本的dark主题调试服务

yarn start-light: 启动外部版本的light主题调试服务

yarn start-light-internal: 启动内部版本的light主题的调试服务

yarn build-pro: 构建dark主题，压缩的，外部版本包

yarn build-pro-internal: 构建light主题，压缩的，内部版本包

yarn build-pro-light: 构建light主题，压缩的，外部版本包

yarn build-pro-light-internal: 构建light主题，压缩的，内部版本包

yarn build-dev: 构建，未压缩，dark，外部

yarn build-dev-internal: 构建，未压缩，dark, 内部

yarn build-dev-light: 构建，未压缩，light, 外部

yarn build-dev-light-internal: 构建， 未压缩， light, 内部

yarn lint: 执行eslint

yarn format: 执行格式化

yarn test: 执行单元测试，暂未开放

yarn test-c: 执行覆盖率测试，暂未开放

yarn prepare: 安装git hook



