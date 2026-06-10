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
var en = {
  init: {
    create: 'Your bundle will be created in the directory {{dirname}}.',
    finished: 'Initialization finished.',
    error: 'Initialization error: {{error}}'
  },
  install: {
    success: 'Install sucessful.(count:{{count}})',
    nothing: 'Nothing to install.',
    error: 'Installation error: {{error}}',
    analyzing: 'Analyzing bundle dependencies...',
    downloadTotal: 'Downloading bundles(total:{{length}})...',
    downloading: '{{prefix}}Downloading {{name}}',
    validator: '{{name}}: {{validateMessage}}',
    invalidVersionRange: '{{name}}: invalid version range.',
    nameIsRequired: 'Bundle name is required',
    installingTar: 'Installing {{name}}',
    installTarFinished: 'Install {{name}} finished.',
    pathError: 'Unresolved path {{name}}.',
    installingHook: '{{prefix}}Installing {{name}}',
    installTotal: 'Installing bundles(total:{{length}})...',
    ignore: 'Ignored {{name}}',
    extracting: '{{prefix}}Extracting {{filePath}}',
    downlonging: '{{prefix}}Downloading ({{size}}) {{name}} <<< {{url}}',
    extractTotal: 'Extracting bundles(total: {{length}})...',
    restoring: '{{prefix}}Copy {{name}} -> {{path}}.',
    checkMissMatch: 'Checksum missmatch in {{mName}} (expect: {{mChecksum}} ,actual: {{checksum}})'
  },
  build: {
    building: 'Building: {{name}}',
    complete: '{{name}} build completed.',
    copyDir: 'Building: copy {{from}} to {{to}}',
    linkDir: 'Building: link {{from}} to {{to}}',
    needScripts: "{{name}}: default script 'build' required",
    shouldBeCommand: "{{name}}: 'build' must be a command.",
    error: 'Build error: {{error}}',
    success: 'Built successfully.'
  },
  update: {
    noNeed: 'No dependency needs to be updated.',
    checkError: 'An error occured when checking for updates. Error: {{error}}',
    error: 'Update error: {{error}}',
    success: 'Updated.',
    noNeedUpdate: 'No dependency needs to be updated.'
  },
  "check-update": {
    noNeed: 'No dependency needs to be updated.',
    checkError: 'An error occured when checking for updates. Error: {{error}}',
    error: 'Update error: {{error}}',
    success: 'Updated.',
    noNeedUpdate: 'No dependency needs to be updated.'
  },
  config: {
    supportError: 'Action {{errAction}} is not supported, please enter "hpm config -h" to get the details.',
    execError: 'Failed to run the configuration command. Error: {{error}}',
    setFormat: "The input format must be 'config set <key> <value>'.",
    deleteFormat: "The input format must be 'config delete <key>'.",
    shellPathNotFound: "Cannot find the shell with path '{{shellPath}}'.",
    loginUserNotFound: "Cannot find the account to publish the bundle. Set the 'loginUser' property in file '{{filePath}}'.",
    https_proxy_note: "#https_proxy = http(s)://username:password@proxy.example.com (You need percent-encode the special characters in your password. eg: @ => %40)",
    http_proxy_note: "#http_proxy = http(s)://username:password@proxy.example.com (You need percent-encode the special characters in your password. eg: @ => %40)",
    error: 'Config error: {{error}}',
    proxyDecryptedError: "The configuration of proxy should be stored in ciphertext, please enter 'hpm config set <http_proxy | https_proxy> <value>' in the terminal to set the proxy again."
  },
  dependencies: {
    error: 'An error occured when obtaining dependencies. Error: {{error}}',
    excludeError: 'Cannot remove mandatory dependencies.',
    incompatibleError: 'Incompatible version of {{name}}: {{version}}',
    cycleDependency: 'Cyclic dependency is not allowed: {{name}}',
    invalidRange: '{{name}}: invalid version range.',
    unResolved: "Unresolved dependency '{{name}}' in {{folderPath}}.",
    noDep: "No dependency '{{name}}' in {{folderPath}}."
  },
  dist: {
    error: 'Distribution error: {{error}}',
    building: 'Building distribution: {{name}}',
    complete: '{{name}}: distribution building completed.',
    miss: 'Failed to find the distribution bundle from {{name}}.',
    needScripts: "Default script 'dist' required.",
    shouldBeCommand: "{{name}}: 'dist' must be a command."
  },
  "gen-keys": {
    password: 'Do you need to enter a passphrase? If you did, please remember the passphrase and you maybe need it on publishing a bundle. Press Enter ignore the passphrase.',
    generateSuccess: 'Key generated. Check it in the directory {{folderPath}}.',
    error: 'Failed to generate the key. Error: {{error}}'
  },
  "gen-notice": {
    error: 'Failed to generate a notice. Error: {{error}}',
    generating: 'Generating Third Party Open Source Notice...',
    success: 'Third Party Open Source Notice generated.'
  },
  list: {
    error: 'List error: {{error}}'
  },
  pack: {
    error: 'Packing error: {{error}}',
    step1: '> Packing {{tgz}} {{bundlePath}}',
    step2: '>   directory {{dir}}',
    step3: '>     . . {{fileRelativePath}}',
    step4: '> Packing {{tgz}} finished.'
  },
  login: {
    noCookie: 'Login faild. Failed to obtain the login credential.',
    currentUser: 'Current user: {{loginUser}}',
    expired: "Login expired. Run the 'hpm publish' command again."
  },
  publish: {
    overlimit: 'File too large. Maximum file size: {{size}} MB',
    isNotTTY: 'The current runtime environment is not a TTY. To prevent data leakage, do not log in on this runtime environment.',
    windowsCmd: 'You are advised to log in using cmd.exe or PowerShell (in Windows).',
    error: 'Publish error: {{error}}',
    success: 'Published.',
    supportError: 'The type of chip-definition is not support to publish.'
  },
  run: {
    error: 'Execution error: {{error}}',
    noCommand: "No '{{name}}' command in scripts."
  },
  ui: {
    start: 'Starting HPM GUI...'
  },
  search: {
    error: 'Search error: {{error}}',
    noMoreResult: 'No more results.',
    onFirstPage: 'Already on the first page.',
    quit: 'Quit search',
    noResult: 'No results.',
    lastPage: 'No more results. Press (p) to return to the previous page or (q) to quit.',
    firstPage: 'Press (n) to go to the next page or (q) to quit.',
    middlePage: 'Press (n) to go to the next page, (p) to return to the previous page or (q) to quit.',
    moreInfo: 'For more information, please visit https://repo.harmonyos.com'
  },
  uninstall: {
    noDep: "No '{{name}}' in dependencies.",
    error: 'Uninstall error: {{error}}',
    complete: 'Uninstalled.'
  },
  bundle: {
    missingPublishAs: "No 'publishAs' field in bundle.json.",
    missingLicense: "No 'license' field in bundle.json.",
    fileShouldNotEmpty: 'File {{name}} is empty.',
    fileRequired: 'File {{name}} is required.'
  },
  repository: {
    unResolved: "Unresolved dependency '{{name}}{{suffix}}' in the repository.",
    depFolderNotExisted: '{{name}} does not exist.',
    extract: '...  Extracting {{filePath}}'
  },
  manifest: {
    error: 'Bundle {{name}}: {{message}}',
    readJsonError: 'Cannot read bundle.json from {{dir}}: {{message}}.',
    malformedJsonError: 'Malformed bundle.json: {{message}}',
    illegalJsonError: 'Invalid bundle.json: {{error}}',
    notFoundJson: 'Parse Error: Cannot found bundle.json file.'
  },
  parser: {
    noFile: 'Cannot find the configuration file.',
    invalidFormat: 'Invalid setting format.'
  },
  template: {
    notFound: "Cannot find the template of '{{name}}'.",
    isNotTemplate: "'{{name}}' is not a template."
  },
  request: {
    requestUrl: 'Requesting: {{url}}',
    error: 'Error: {{message}}',
    defaultError: 'Error. Check the target URL or the network.',
    proxyFormat: 'The proxy with auth must in the format of http|https://username:password@proxyurl:proxyport.',
    notFound: 'The specified path cannot be found. Check the target URL.',
    timeout: 'Connection timed out. Check the target URL, the network, or the proxy settings in hpmrc.',
    econnreset: 'Connect to content-center failed.',
    paramsError: 'Request parameters error. Check the parameters. For example, check whether a bundleName is followed after an organization name.'
  },
  crypto: {
    aesError: 'Decryption failed.',
    keymissing: "Error: {{key}} missing. Please run 'hpm gen-keys' to regenerate keys.",
    inputPassphrase: 'Please input passphrase:',
    passphraseError: 'Passphrase is error. Please enter again.'
  },
  common: {
    message: '{{message}}',
    noFolder: 'Cannot find folder {{folderPath}}.',
    modifyRc: "Create a hpm-cli configuration file, or change file '{{filePath}}' to be a hpm-cli configuration file.",
    networkError: 'Network error.',
    noDescription: 'No description'
  },
  license: {
    warn: 'The license of {{bundleName}} is {{license}}. Notice open-source risks.',
    uncheck: 'The license is not checked due to network problems.'
  },
  help: {
    init: 'Create a bundle.json file',
    initTemplate: 'Template used to create the project',
    initDir: 'Directory where the project to create is',
    initScope: 'Scope within which the project to create is',
    build: 'Run the build command defined in scripts',
    pack: 'Pack a bundle to a file',
    dist: 'Run the dist command defined in scripts',
    install: 'Obtain dependencies from a remote repository and install them',
    installGlobal: 'Global installation',
    installDev: 'Installation into devDependencies',
    forceInstall: "Forcibly installing the snapshot bundle",
    uninstall: 'Remove dependencies from the current bundle',
    uninstallGlobal: 'Global uninstall',
    uninstallDev: 'Uninstall from devDependencies',
    publish: 'Publish the bundle to a remote repository',
    publishMode: 'Login mode. "TOKEN" and "TTY" supported',
    publishOld: 'Original publish method',
    dependencies: 'Generate an HTML file to display dependency relationship',
    run: 'Run commands defined in scripts',
    config: 'hpm-cli global configuration',
    configSet: 'Set configuration item',
    configDelete: 'Delete configuration item',
    configList: 'Get the configuration list.',
    configItem: 'Get the value of the configuration item key.',
    search: 'Search for bundles by name',
    searchType: 'Search for bundles by type',
    searchJson: 'Output in JSON format',
    searchPagesize: 'Search bundles with the page size specified',
    searchCurrentpage: 'Search for bundles on a specified page',
    searchVersion: "Search for bundles on a specified version. Support 'latest','all',semver(e.g. '^1.0.0','>2.0.1')",
    searchKernel: "Search by the type of kernel, such as 'liteos-m', 'linux'",
    searchBoard: "Search by the type of board, such as 'hispark_pegasus', 'v200zr', 'gr5515_sk'",
    searchOsVersion: "Search by the os version, such as '3.0', '3.1'",
    update: 'Update bundle dependencies',
    updateGlobal: 'Global update',
    updateSelf: 'Update hpm-cli',
    forceUpdate: 'Forcibly updating the snapshot bundle',
    checkUpdate: 'Check for bundle dependency update',
    checkUpdateGlobal: 'Check for global bundle update',
    checkUpdateJson: 'Output in JSON format',
    list: 'Print dependency tree',
    listGlobal: 'Print global dependency tree',
    genNotice: 'Generate third-party open-source notice',
    genNoticeDir: 'Generate notice by specific directory',
    genKeys: 'Generate private and publish key pairs',
    genKeysUnbinding: 'Generate private and publish key pairs without binding mac address. It means you can use the key pairs in another machine.',
    extract: "Extract files. Support type 'zip','tar','tgz' and '.tar.gz'",
    ui: 'Start and open the hpm-cli ui',
    x2h: "Publish a package to HPM, support type 'gradle','maven','npm'",
    uiPort: 'Port used for the UI server',
    daemon: "Don't open browser on start",
    version: 'Output the version number',
    help: 'Display help for command',
    code: 'Restore or clean the code structure by code-segments, action:clean|restore',
    download: 'Download Zip file of component(.tgz)',
    downLoadOutput: 'Download output path',
    fetch: 'Fetch resource from url',
    platform: 'Chose the platform to fetch the url',
    zip: 'Fetch the zip'
  },
  error: {
    workerStop: 'Worker stopped with exit code {{errCode}}'
  },
  bundleLock: {
    readJsonError: 'Failed to read bundle-lock.json from {{url}}: {{message}}',
    jsonParseError: 'Malformed bundle-lock.json: {{message}}',
    lockError: 'Invalid bundle-lock.json: {{error}}'
  },
  bundleCache: {
    readJsonError: 'Failed to read bundle-lock.json from {{url}}: {{message}}',
    jsonParseError: 'Malformed bundle-lock.json: {{message}}',
    lockError: 'Invalid bundle-lock.json: {{error}}'
  },
  log: {
    check: 'Check error details by "{{filePath}}"'
  },
  validate: {
    nameIsNotNull: 'name is required.',
    nameLengthLess256: 'name cannot exceed 256 characters.',
    nameContain: 'name can contain only numbers (0-9), lowercase letters (a-z), and underscores (_).',
    nameStartWith: 'name must start with a number (0-9) or a lowercase letter (a-z).',
    versionIsNotNull: 'version is required.',
    versionSemantic: 'version can only be semantic version v2.0.0. For details, visit https://semver.org.',
    versionLengthLess64: 'version cannot exceed 64 characters.',
    nameVersionLengthLess200: 'The total length of name and version cannot exceed 200 characters.',
    publishAsType: 'Can only be publish as binary, chip-definition, code-segment, distribution, model, plugin, source or template.',
    dirsInvalid: 'Invalid directory declaration.',
    dirNameInvalid: "Invalid directory name '{{dir}}'.",
    dirPatternInvalid: "An invalid file pattern in directory '{{dir}}'.",
    scriptIsNotNull: 'scripts is required.',
    scriptIsObject: 'scripts must be an object.',
    dependenciesIsNotNull: 'dependencies is required.',
    dependenciesIsObject: 'dependencies must be an object.',
    dependencyInvalid: "Invalid dependency '{{bundle}}'.",
    dependencyInvalidRange: "Invalid version range for dependency '{{bundle}}'.",
    baseIsNotNull: 'base is required.',
    baseIsObject: 'base must be an object.',
    baseNameInvalid: 'Invalid name for base.',
    baseRangeInvalid: 'Invalid version range for base.',
    excludeNameArray: 'excludes must be an bundle name array.',
    envsIsObject: 'envs must be an object.',
    descriptionIsString: 'description must be a string.',
    descriptionLengthLess500: 'description cannot exceed 500 characters.',
    rom: 'rom must be a number (byte) or a string start with a number and end with "k" or "m".',
    ram: 'ram must be a number (byte) or a string start with a number and end with "k" or "m".',
    osIsString: 'ohos.os must be a string.',
    os: 'Each os version can only be semantic version v2.0.0. For details, visit https://semver.org.',
    board: 'ohos.board must be a string.',
    kernel: 'ohos.kernel must be a string.',
    ohos: 'ohos must be an object with keywords "os", "board", or "kernel".',
    authorIsNotNull: 'author is required.',
    authorIsObject: 'author must be an object.',
    author: 'author must be an object including a name, email, or url.',
    contributorsIsNotNull: 'contributors is required.',
    contributorsIsArrayOrObject: 'contributors must be an array or an object.',
    contributorsContent: 'contributors must be an object including a name, email, or url.',
    keywordsIsArray: 'keywords must be an array.',
    keywordsLengthLess20: 'keywords cannot exceed 20 words.',
    keywordIsString: 'keyword must be a string.',
    keywordContent: 'keyword can contain only numbers (0-9), uppercase letters (A-Z), lowercase letters (a-z), hyphens (-), and spaces.',
    keywordsLengthLess255: 'keywords cannot exceed 255 characters.',
    noticeFileIsString: 'noticeFile must be a string.',
    noticeFileLengthLess100: 'noticeFile cannot exceed 100 characters.',
    licenseIsString: 'license must be a string.',
    licenseLengthLess256: 'license cannot exceed 256 characters.',
    repositoryIsString: 'repository must be a string.',
    repositoryStartWith: 'repository must start with http:// or https://.',
    homepageIsString: 'homepage must be a string.',
    homepageStartWith: 'homepage must start with http:// or https://.',
    tagsIsArray: 'tags must be an array.',
    tagIsString: 'tag must be a string.',
    tagsLengthLess128: 'tags cannot exceed 128 characters.',
    privateIsBoolean: "private must be a Boolean value(true|false).",
    segmentContent: 'segment must be an object including a destPath.',
    insteadOfHookIsBoolean: 'insteadOfHook must be a Boolean value(true|false).',
    destPathIsString: 'destPath must be a string.',
    permission: 'permission must be an object with keywords "authServer".',
    authServerIsString: 'permission.authServer must be a string.',
    authServerIsFault: 'The value of authServer is incorrect.',
    readmePathIsObject: 'readmePath must be an object.',
    licensePathIsString: 'licensePath must be a string.',
    chipDefinition: 'chipDefinition must be an object with keywords "baseInfo".',
    baseInfo: 'chipDefinition.baseInfo must be an object.',
    keyIsString: '{{key}} must be a string.',
    productNameStartWith: 'productName must start with a letter.',
    productNameContain: 'productName can contain only numbers (0-9), letters, and underscores (_).',
    lengthLess: '{{key}} cannot exceed {{length}} characters.',
    keyContain: '{{key}} can contain only numbers (0-9), letters (a-z), and underscores (_), dot (.), hyphens (-).'
  },
  password: {
    lengthLess8: 'Password length is at least 8 characters.',
    mustCharacters: ' - The password must contain a combination of at least two of the following characters:\n' + ' - At least one lowercase letter.\n' + ' - At least one uppercase letter.\n' + ' - At least one number.\n' + " - At least one special character `~!@#$%^&*()-_=+|[{}];:'\",<.>/? and space."
  },
  extract: {
    unsupport: 'Unsupport file type.',
    error: 'Extract Error: {{error}}',
    running: 'Extracting {{source}}',
    success: 'Extracted successfully.'
  },
  nodejs: {
    version: "Node.js version is not match.\nYou are advised to install Node.js(https://nodejs.org) 12.x (including npm 6.14.4) or a later version (12.13.0 or later is recommended)."
  },
  UnexpectedError: 'Unexpected error.',
  plugin: {
    registerCmdError: 'Register Error: Command {{name}} has existed. ',
    resolveError: 'Plugin Error: {{error}}',
    hooksError: 'Plugin Hook {{type}} Error: {{error}}'
  },
  lang: {
    lang: 'Change language',
    message: 'Input language ({{supportLanguages}})',
    supportError: 'Only ({{supportLanguages}}) support.',
    error: 'Set Language Error: {{error}}',
    success: 'Changed language to {{lang}} successfully.',
    current: 'Current language: {{lang}}\nSupported languages: {{supportLanguages}}'
  },
  i18n: {
    metaError: 'I18n Parameters Error: Need plugin name in meta'
  },
  code: {
    supportError: "Action '{{errAction}}' is not supported, please use ({{supportActions}}).",
    cleaning: 'Cleaning {{path}}',
    restoring: 'Copy {{name}} -> {{path}}.',
    restore: 'Copied. {{name}}',
    clean: 'Cleaned. {{path}}'
  },
  download: {
    downloading: 'downloading {{name}}',
    success: 'download {{name}} finished',
    downloadPath: 'download to path {{path}}',
    nameError: 'Cannot found {{name}}',
    downloadError: 'download {{name}} Failed'
  },
  fetch: {
    urlError: '{{name}} does not provide a download address for the {{platform}} platform.',
    url: '...  Fetch ({{size}}) {{url}}',
    supportError: "Platform '{{errPlatform}}' is not supported, please use ({{supportPlatforms}}).",
    checksumError: '{{fileName}} has been modified.(sha256sum not matched)',
    checksumNotFound: 'the file {{fileName}}.sha256 for checksum does not exist.'
  }
};
var _default = en;
exports["default"] = _default;