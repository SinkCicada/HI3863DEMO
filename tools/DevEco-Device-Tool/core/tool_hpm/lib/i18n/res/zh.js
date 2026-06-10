"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

/*
 * Copyright (c) 2020-2021 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var zh = {
  init: {
    create: '你的bundle将会创建在{{dirname}}.',
    finished: '创建完成。',
    error: '创建错误： {{error}}'
  },
  install: {
    success: '已安装。(数量：{{count}})',
    nothing: '没有需要安装的组件。',
    error: '安装错误：{{error}}',
    analyzing: '正在解析依赖...',
    downloading: '{{prefix}}下载中{{name}}',
    downloadTotal: '正在下载组件({{length}}),请稍候...',
    validator: '{{name}}: {{validateMessage}}',
    invalidVersionRange: '{{name}}: 版本范围无效。',
    nameIsRequired: '名称缺失',
    installingTar: ' 安装中{{name}}',
    installTarFinished: '{{name}} 安装完成。',
    pathError: '无效路径 {{name}}。',
    installingHook: '{{prefix}}安装中 {{name}}',
    installTotal: '正在安装组件({{length}}),请稍候...',
    ignore: '已跳过{{name}}组件的下载',
    extracting: '{{prefix}}解压中 {{filePath}}',
    downlonging: '{{prefix}}下载中 ({{size}}) {{name}} <<< {{url}}',
    extractTotal: '正在解压组件({{length}}),请稍候...',
    restoring: '{{prefix}}拷贝中 {{name}} -> {{path}}.',
    checkMissMatch: '{{mName}}检验码不匹配,(期望的是: {{mChecksum}}, 实际上是: {{checksum}}.)'
  },
  build: {
    building: '构建中：{{name}}',
    complete: '{{name}} 构建完成。',
    copyDir: '构建中: 拷贝 {{from}} 到 {{to}}',
    linkDir: '构建中: 链接 {{from}} 到 {{to}}',
    needScripts: " {{name}}: 默认的 'build' 脚本缺失。",
    shouldBeCommand: "{{name}}: 'build'须为一个命令。",
    error: '构建错误: {{error}}',
    success: '构建完成。'
  },
  update: {
    noNeed: '没有需要更新的依赖。',
    checkError: '检查更新出错。错误：{{error}}',
    error: '升级错误: {{error}}',
    success: '已升级。',
    noNeedUpdate: '无需更新。'
  },
  "check-update": {
    noNeed: '没有需要更新的依赖。',
    checkError: '检查更新出错。错误：{{error}}',
    error: '升级错误: {{error}}',
    success: '已升级。',
    noNeedUpdate: '无需更新。'
  },
  config: {
    supportError: '不支持{{errAction}}选项，请输入hpm config -h查看详情。',
    execError: 'config 命令执行错误: {{error}}',
    setFormat: "输入格式应为'config set <key> <value>'。",
    deleteFormat: "输入格式应为'config delete <key>'。",
    shellPathNotFound: "无法找到路径'{{shellPath}}'。",
    loginUserNotFound: "未找到发布组件的账号。 请在'{{filePath}}'文件中设置'loginUser'。",
    https_proxy_note: "#https_proxy = http(s)://username:password@proxy.example.com (需要对的特殊字符进行转义，如: @ => %40)",
    http_proxy_note: "#http_proxy = http(s)://username:password@proxy.example.com (需要对的特殊字符进行转义, 如: @ => %40)",
    error: '获取配置信息错误: {{error}}',
    proxyDecryptedError: "代理信息应以密文形式存储，请使用hpm config set <http_proxy | https_proxy> <value>再次配置代理。"
  },
  dependencies: {
    error: '获取依赖错误: {{error}}',
    excludeError: '无法移除必选的依赖项。',
    incompatibleError: '版本不兼容 {{name}}: {{version}}',
    cycleDependency: '不允许循环依赖: {{name}}',
    invalidRange: '{{name}}: 版本范围错误。',
    unResolved: "无法解析依赖'{{name}}'，路径： {{folderPath}}。",
    noDep: "没有依赖'{{name}}',路径：{{folderPath}}。"
  },
  dist: {
    error: '构建发行版错误: {{error}}',
    building: '正在构建发行版: {{name}}',
    complete: '{{name}}: 发行版构建完成。',
    miss: '无法找到发行版{{name}}。',
    needScripts: "默认的'dist'脚本缺失。",
    shouldBeCommand: "{{name}}: 'dist'必须是一个命令。"
  },
  "gen-keys": {
    password: '需要设置密码吗？如果设置了密码，将在发布bundle时需用到，请牢记。按回车忽略密码。',
    generateSuccess: '秘钥已生成。请在{{folderPath}}检查一下',
    error: '生成秘钥失败。错误：{{error}}'
  },
  "gen-notice": {
    error: '生成Notice失败。错误: {{error}}',
    generating: '正在生成第三方开源注意事项...',
    success: '已生成第三方开源注意事项。'
  },
  list: {
    error: 'List错误: {{error}}'
  },
  pack: {
    error: '打包错误: {{error}}',
    step1: '> 打包中 {{tgz}} {{bundlePath}}',
    step2: '>   目录 {{dir}}',
    step3: '>     . . {{fileRelativePath}}',
    step4: '> 打包 {{tgz}} 完成。'
  },
  login: {
    noCookie: '登录失败。无法获取登录凭证。',
    currentUser: '当前用户: {{loginUser}}',
    expired: "登录失效。请运行'hpm publish'命令重试"
  },
  publish: {
    overlimit: '文件太大。最大支持: {{size}} MB',
    isNotTTY: '当前的运行环境不是一个TTY。为防止数据泄露，请勿在此运行环境登录。',
    windowsCmd: '在Windows环境下，建议使用cmd.exe 或PowerShell登录。',
    error: '发布错误: {{error}}',
    success: '已发布。',
    supportError: '暂不支持发布类型为chip-definition的组件包。'
  },
  run: {
    error: '运行错误: {{error}}',
    noCommand: "脚本中为定义'{{name}}' 命令"
  },
  ui: {
    start: '正在启动 HPM GUI...'
  },
  search: {
    error: '搜索错误: {{error}}',
    noMoreResult: '没有更多结果。',
    onFirstPage: '已经是第一页。',
    quit: '退出搜索',
    noResult: '无结果。',
    lastPage: '没有更多结果。按(p)键上一页，按(q)退出',
    firstPage: '按(n)键下一页，按(q)退出',
    middlePage: '按(n)键下一页, 按(p)键上一页，按(q)退出',
    moreInfo: '查看更多信息, 请上https://repo.harmonyos.com'
  },
  uninstall: {
    noDep: "依赖中没有 '{{name}}'。",
    error: '卸载错误: {{error}}',
    complete: '已卸载。'
  },
  bundle: {
    missingPublishAs: "bundle.json中 缺失'publishAs'字段",
    missingLicense: "bundle.json中 缺失'license'字段",
    fileShouldNotEmpty: '文件名{{name}}为空',
    fileRequired: '文件{{name}} 必填'
  },
  repository: {
    unResolved: "在库中无法解析依赖 '{{name}}{{suffix}}'",
    depFolderNotExisted: '{{name}}不存在。',
    extract: '正在解压{{filePath}}'
  },
  manifest: {
    error: 'Bundle {{name}}: {{message}}',
    readJsonError: '在{{dir}}无法读取bundle.json: {{message}}。',
    malformedJsonError: 'bundle.json格式错误: {{message}}',
    illegalJsonError: '无效的bundle.json: {{error}}',
    notFoundJson: '解析错误：无法找到bundle.json文件。'
  },
  parser: {
    noFile: '无法找到配置文件。',
    invalidFormat: '无效的设置格式'
  },
  template: {
    notFound: "无法找到模板：'{{name}}'。",
    isNotTemplate: "'{{name}}' 不是一个模板。"
  },
  request: {
    requestUrl: '请求: {{url}}',
    error: '错误: {{message}}',
    defaultError: '错误。请检查目标URL或网络',
    proxyFormat: '需要认证的代理格式为：http|https://username:password@proxyurl:proxyport',
    notFound: '找不到指定的路径，请检查目标URL',
    timeout: '连接超时。请检查目标URL,网络,或者代理（hpmrc文件中的）设置是否正确。',
    econnreset: '连接内容中心异常。',
    paramsError: '请求参数错误。 请检查，如：组件名称是否正确（@组织名/组件名）'
  },
  crypto: {
    aesError: '解密错误。',
    keymissing: "错误: {{key}} 缺失。 请执行命令'hpm gen-keys'生成秘钥。",
    inputPassphrase: '输入密码:',
    passphraseError: '密码错误，请重新输入。'
  },
  common: {
    message: '{{message}}',
    noFolder: '无法找到路径{{folderPath}}。',
    modifyRc: "创建或修改'{{filePath}}'配置文件。",
    networkError: '网络错误。',
    noDescription: '无描述'
  },
  license: {
    warn: '{{bundleName}}的许可协议为{{license}}，请注意开源风险。',
    uncheck: '由于网络问题，忽略许可协议检查。'
  },
  help: {
    init: '创建一个bundle.json文件',
    initTemplate: '使用的模板',
    initDir: '存放路径',
    initScope: '范围（即组织名）',
    build: '运行scripts定义的构建命令',
    pack: '打包成一个压缩文件',
    dist: '运行scripts定义的发行命令',
    install: '获取依赖并安装',
    installGlobal: '全局安装',
    installDev: '安装到开发依赖',
    forceInstall: "强制下载snapshot版本组件",
    uninstall: '从当前的Bundle移除依赖',
    uninstallGlobal: '全局卸载',
    uninstallDev: '从开发依赖卸载',
    publish: '发布到远程的组件仓库',
    publishMode: '登录模式。 支持"TOKEN" 和 "TTY"',
    publishOld: '旧的发布方式',
    dependencies: '生成一个html格式的依赖关系图',
    run: '执行scripts中定义的命令',
    config: 'hpm-cli 全局配置',
    configSet: '设置配置项',
    configDelete: '删除配置项',
    configList: '获取配置项列表',
    configItem: '获取配置项key的值',
    search: '按名称搜索组件',
    searchType: '按类型搜索组件',
    searchJson: '输出为JSON格式',
    searchPagesize: '每页返回记录数',
    searchCurrentpage: '跳转到指定页',
    searchVersion: "搜索组件的指定版本。 支持'latest','all',语义化版本(如：'^1.0.0','>2.0.1')",
    searchKernel: "按内核类型搜索，例如：'liteos-m', 'linux'",
    searchBoard: "按开发板类型搜索，例如：'hispark_pegasus', 'v200zr', 'gr5515_sk'",
    searchOsVersion: "按os版本来搜索，例如： '3.0', '3.1'",
    update: '升级组件依赖',
    updateGlobal: '全局升级',
    updateSelf: '升级 hpm-cli',
    forceUpdate: '强制更新snapshot版本组件',
    checkUpdate: '检查组件依赖的版本更新',
    checkUpdateGlobal: '检查全局组件更新',
    checkUpdateJson: '输出JSON格式',
    list: '显示依赖树',
    listGlobal: '显示全局依赖树',
    genNotice: '生成三方开源注意事项',
    genNoticeDir: '指定输出路径',
    genKeys: '生成秘钥对',
    genKeysUnbinding: '生成秘钥对不绑定MAC地址，意味着可以在其他机器使用此秘钥对。',
    extract: "解压文件. 支持格式'zip','tar','tgz' 和'.tar.gz'",
    ui: '启动HPM UI',
    x2h: "发布三方库到HPM组件仓库，支持'gradle','maven','npm'库",
    uiPort: '端口号',
    daemon: '静默启动（不打开浏览器）',
    version: '打印版本号',
    help: '显示命令帮助',
    code: '恢复或清理通过代码片段还原的代码结构,action:clean|restore',
    download: '下载组件的压缩文件(.tgz)',
    downLoadOutput: '指定组件下载至本地路径',
    fetch: '从url中获取资源并解压',
    platform: '指定资源的操作系统类型',
    zip: '从url中获取资源'
  },
  error: {
    workerStop: '任务停止，退出码： {{errCode}}'
  },
  bundleLock: {
    readJsonError: '无法读取bundle-lock.json ： {{url}}: {{message}}',
    jsonParseError: 'bundle-lock.json格式错误: {{message}}',
    lockError: '无效的bundle-lock.json: {{error}}'
  },
  bundleCache: {
    readJsonError: '无法读取bundle-cache.json ： {{url}}: {{message}}',
    jsonParseError: 'bundle-cache.json格式错误: {{message}}'
  },
  log: {
    check: '请检查错误详情："{{filePath}}"'
  },
  validate: {
    nameIsNotNull: '名称不能为空。',
    nameLengthLess256: '名称不超过256字符。',
    nameContain: '名称仅包含数字 (0-9), 小写字母 (a-z), 和下划线 (_)。',
    nameStartWith: '名称必须以数字 (0-9) 或在小写字母 (a-z)开头。',
    versionIsNotNull: '版本不能为空。',
    versionSemantic: '版本命名需遵循语义化命令规范。详情请参考：https://semver.org',
    versionLengthLess64: '版本不超过64字符',
    nameVersionLengthLess200: '名称和版本的总长度不超过200字符。',
    publishAsType: '发布形态仅支持binary, chip-definition, code-segment, distribution, model, plugin, source 或者 template。',
    dirsInvalid: '无效的目录。',
    dirNameInvalid: "无效的目录名'{{dir}}'。",
    dirPatternInvalid: "无效的文件格式'{{dir}}'。",
    scriptIsNotNull: 'scripts不能为空。',
    scriptIsObject: 'scripts必须为以对象。',
    dependenciesIsNotNull: 'dependencies不能为空。',
    dependenciesIsObject: 'dependencies必须为一个对象',
    dependencyInvalid: "无效的依赖'{{bundle}}'。",
    dependencyInvalidRange: "无效的依赖版本范围'{{bundle}}'。",
    baseIsNotNull: 'base不能为空',
    baseIsObject: 'base必须为一个对象。',
    baseNameInvalid: '无效的base名称。',
    baseRangeInvalid: '无效的base版本。',
    excludeNameArray: 'excludes必须为bundle数组。',
    envsIsObject: 'envs必须为一个对象。',
    descriptionIsString: 'description必须为一个字符串。',
    descriptionLengthLess500: 'description不超过500字符。',
    rom: 'rom 必须为一个数字(默认单位byte) 或者以数字开头，"k"或"m"结尾的字符串。',
    ram: 'ram 必须为一个数字(默认单位byte) 或者以数字开头，"k"或"m"结尾的字符串。',
    osIsString: 'ohos.os必须为一个字符串。',
    os: 'os 版本命名需遵循语义化命令规范。详情请参考 visit https://semver.org.',
    board: 'ohos.board 必须为一个字符串',
    kernel: 'ohos.kernel 必须为一个字符串',
    ohos: 'ohos必须是包含 "os", "board", or "kernel"的对象',
    authorIsNotNull: 'author 不能为空。',
    authorIsObject: 'author 必须为一个对象。',
    author: 'author 必须为包括一个name, email, 或 url的对象',
    contributorsIsNotNull: 'contributors不能为空。',
    contributorsIsArrayOrObject: 'contributors 必须为一个数组或对象。',
    contributorsContent: 'contributors必须为一个包括name, email, 或 url的对象',
    keywordsIsArray: 'keywords必须为一个数组。',
    keywordsLengthLess20: '关键词不能超过20个单词。',
    keywordIsString: '关键字必须为一个字符。',
    keywordContent: 'keyword 只能包括数字(0-9), 大小写字母(A-Z,a-z), 中划线 (-), 和空格。',
    keywordsLengthLess255: '关键字不能超过255个字符。',
    noticeFileIsString: 'noticeFile必须为一个字符串。',
    noticeFileLengthLess100: 'noticeFile 不能超过100字符。',
    licenseIsString: 'license必须为一个字符串。',
    licenseLengthLess256: 'license 不超过256个字符。',
    repositoryIsString: 'repository必须为一个字符串。',
    repositoryStartWith: 'repository 必须以 http://或https://开头。',
    homepageIsString: 'homepage必须为字符串。',
    homepageStartWith: 'homepage必须以http:// or https://开头。',
    tagsIsArray: 'tags 必须为一个数组。',
    tagIsString: 'tag 必须为一个字符串。',
    tagsLengthLess128: 'tags 不超过128个字符。',
    privateIsBoolean: "private必须为布尔值(true|false)。",
    segmentContent: 'segment必须为一个包括destPath的对象',
    insteadOfHookIsBoolean: 'insteadOfHook必须为布尔值(true|false)。',
    destPathIsString: 'destPath必须为字符串。',
    permission: 'permission 必须为包括一个authServer的对象。',
    authServerIsString: 'permission.authServer 必须为一个字符串。',
    authServerIsFault: 'authServer的值不正确。',
    readmePathIsObject: 'readmePath必须为一个对象。',
    licensePathIsString: 'licensePath 必须为一个字符串。',
    chipDefinition: 'chipDefinition 必须为包括一个baseInfo的对象。',
    baseInfo: 'chipDefinition.baseInfo 必须为包括一个对象。',
    keyIsString: '{{key}}必须为一个对象。',
    productNameStartWith: 'productName必须以字母开头。',
    productNameContain: 'productName仅包含数字 (0-9), 字母, 和下划线 (_)。',
    lengthLess: '{{key}}不超过{{length}}个字符。',
    keyContain: '{{key}}仅包含数字 (0-9), 字母, 和下划线 (_)、小数点(.)、中划线(-)。'
  },
  password: {
    lengthLess8: '密码长度不小于8位',
    mustCharacters: ' - 密码必须包含以下两种字符组合:\n' + ' - 至少一个小写字母。\n' + ' - 至少一个大写字母.\n' + ' - 至少一个数字..\n' + " - 至少一个特殊字符 `~!@#$%^&*()-_=+|[{}];:'\",<.>/? and space."
  },
  extract: {
    unsupport: '文件格式不支持.',
    error: '解压错误: {{error}}',
    running: '正在解压 {{source}}',
    success: '解压成功。'
  },
  nodejs: {
    version: "Node.js\u7248\u672C\u4E0D\u5339\u914D.\n\u5EFA\u8BAE\u6309\u7167Node.js(https://nodejs.org) 12.x (\u5305\u542B\u4E86 npm 6.14.4) or \u6216\u66F4\u65B0\u7684\u7248\u672C (\u63A8\u835012.13.0 \u4EE5\u4E0A)."
  },
  UnexpectedError: '未知错误。',
  plugin: {
    registerCmdError: '注册错误: 命令 {{name}} 已经存在。 ',
    resolveError: '插件错误: {{error}}',
    hooksError: '插件钩子 {{type}} 错误: {{error}}'
  },
  lang: {
    lang: '切换语言',
    message: '输入语言 ({{supportLanguages}})',
    supportError: '只支持 ({{supportLanguages}})。',
    error: '设置语言错误: {{error}}',
    success: '切换语言成功：{{lang}}',
    current: '当前语言为: {{lang}}\n支持: {{supportLanguages}}'
  },
  i18n: {
    metaError: 'I18n 参数错误: 元数据中的需定义插件名称'
  },
  code: {
    supportError: '不支持{{errAction}}，仅支持 ({{supportActions}})。',
    cleaning: '正在删除{{path}}',
    restoring: '拷贝{{name}} -> {{path}}',
    restore: '对{{name}}代码段的拷贝已完成',
    clean: '{{path}}已删除'
  },
  download: {
    downloading: '{{name}}组件下载中',
    success: '{{name}}下载完成',
    downloadPath: '下载目录{{path}}',
    nameError: '{{name}}组件不存在',
    loadError: '{{name}}组件下载失败'
  },
  fetch: {
    urlError: '未提供{{name}}的{{platform}}版本',
    url: '... 获取中 ({{size}}) {{url}}',
    supportError: '不支持{{errPlatform}}，仅支持({{supportPlatforms}}).',
    checksumError: '{{fileName}} 已经被修改(sha256不一致).',
    checksumNotFound: '{{fileName}}的校验文件(.sha256)不存在.'
  }
};
var _default = zh;
exports["default"] = _default;