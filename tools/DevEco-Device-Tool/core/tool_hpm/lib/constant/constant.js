"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.autoPackFiles = exports.UI_PLUGIN_PREFIX = exports.SUSPEND_FOLDER = exports.PLUGIN_PREFIX = exports.NPM_PLUGIN_PREFIX = exports.NOTICE_NAME = exports.Hooks = exports.DOWNLOAD_TEMP_FOLDER = exports.DEP_OHOS_BUNDLES = exports.DEP_FOLDER_NAME = exports.DEP_BUNDLE_BASE = exports.DEFAULT_INFO_LOG_DIR = exports.DEFAULT_HISTORY_LOG_DIR = exports.DEFAULT_GLOBAL_DIR = exports.DEFAULT_DEBUG_LOG_DIR = exports.DEFAULT_CONFIG_FILE = exports.DEFAULT_CONFIG_DIR = exports.DATA_OUTPUT_FOLDER = exports.BUILT_IN_OHOS_FOLDER = exports.BINARY_DEP_ENV = void 0;

var _path = _interopRequireDefault(require("path"));

var _os = _interopRequireDefault(require("os"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
var DEP_FOLDER_NAME = 'ohos_bundles';
exports.DEP_FOLDER_NAME = DEP_FOLDER_NAME;
var BINARY_DEP_ENV = 'HPM_SRC_DEPS_DIRS';
exports.BINARY_DEP_ENV = BINARY_DEP_ENV;
var DEP_OHOS_BUNDLES = 'DEP_OHOS_BUNDLES';
exports.DEP_OHOS_BUNDLES = DEP_OHOS_BUNDLES;
var DEP_BUNDLE_BASE = 'DEP_BUNDLE_BASE';
exports.DEP_BUNDLE_BASE = DEP_BUNDLE_BASE;
var NOTICE_NAME = 'Third Party Open Source Notice';
exports.NOTICE_NAME = NOTICE_NAME;

var DEFAULT_CONFIG_DIR = _path["default"].join(_os["default"].homedir(), '.hpm');

exports.DEFAULT_CONFIG_DIR = DEFAULT_CONFIG_DIR;

var DEFAULT_CONFIG_FILE = _path["default"].join(DEFAULT_CONFIG_DIR, 'hpmrc');

exports.DEFAULT_CONFIG_FILE = DEFAULT_CONFIG_FILE;

var DEFAULT_GLOBAL_DIR = _path["default"].join(DEFAULT_CONFIG_DIR, 'global');

exports.DEFAULT_GLOBAL_DIR = DEFAULT_GLOBAL_DIR;

var DEFAULT_DEBUG_LOG_DIR = _path["default"].join(DEFAULT_CONFIG_DIR, 'log', 'debug');

exports.DEFAULT_DEBUG_LOG_DIR = DEFAULT_DEBUG_LOG_DIR;

var DEFAULT_INFO_LOG_DIR = _path["default"].join(DEFAULT_CONFIG_DIR, 'log', 'info');

exports.DEFAULT_INFO_LOG_DIR = DEFAULT_INFO_LOG_DIR;

var DEFAULT_HISTORY_LOG_DIR = _path["default"].join(DEFAULT_CONFIG_DIR, 'log', 'history');

exports.DEFAULT_HISTORY_LOG_DIR = DEFAULT_HISTORY_LOG_DIR;
var PLUGIN_PREFIX = "hpm_cli_plugin_";
exports.PLUGIN_PREFIX = PLUGIN_PREFIX;
var UI_PLUGIN_PREFIX = "hpm_ui_addon_";
exports.UI_PLUGIN_PREFIX = UI_PLUGIN_PREFIX;
var NPM_PLUGIN_PREFIX = "hpm-cli-";
exports.NPM_PLUGIN_PREFIX = NPM_PLUGIN_PREFIX;
var DATA_OUTPUT_FOLDER = ".output";
exports.DATA_OUTPUT_FOLDER = DATA_OUTPUT_FOLDER;
var SUSPEND_FOLDER = ".suspend";
exports.SUSPEND_FOLDER = SUSPEND_FOLDER;
var DOWNLOAD_TEMP_FOLDER = ".hpm_cache";
exports.DOWNLOAD_TEMP_FOLDER = DOWNLOAD_TEMP_FOLDER;
var BUILT_IN_OHOS_FOLDER = [DATA_OUTPUT_FOLDER, SUSPEND_FOLDER];
/**
 * 脚本执行钩子
 */

exports.BUILT_IN_OHOS_FOLDER = BUILT_IN_OHOS_FOLDER;
var Hooks = {
  //编译
  preBuild: "pre_build",
  afterBuild: "after_build",
  //发行
  preDist: "pre_dist",
  afterDist: "after_dist",
  //安装
  preInstall: "pre_install",
  install: "install",
  afterInstall: "after_install",
  //打包
  prePack: "pre_pack",
  pack: "pack",
  afterPack: "after_pack",
  //发布
  prePublish: "pre_publish",
  publish: "publish",
  afterPublish: "after_publish",
  //卸载
  uninstall: "uninstall",
  preUninstall: "pre_uninstall",
  afterUninstall: "after_uninstall"
};
exports.Hooks = Hooks;
var autoPackFiles = [{
  name: 'bundle.json',
  required: true
}, {
  name: 'README.md',
  required: true
}, {
  name: 'LICENSE',
  required: true
}, {
  name: 'AUTHOR',
  required: false
}, {
  name: 'README_EN.md',
  required: false
}, {
  name: 'README_CN.md',
  required: false
}, {
  name: 'CHANGELOG.md',
  required: false
}, {
  name: 'CHANGELOG_EN.md',
  required: false
}, {
  name: 'CHANGELOG_CN.md',
  required: false
}];
exports.autoPackFiles = autoPackFiles;