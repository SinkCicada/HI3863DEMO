"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.EventTypes = void 0;

var _events = require("events");

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
var eventEmitter = new _events.EventEmitter();
/**
 * 触发事件（插件监听事件）
 */

var EventTypes = {
  //安装
  beforeEachInstall: "beforeEachInstall",
  afterEachInstall: "afterEachInstall",
  beforeAllInstall: "beforeAllInstall",
  afterAllInstall: "afterAllInstall",
  //编译
  beforeEachBuild: "beforeEachBuild",
  afterEachBuild: "afterEachBuild",
  beforeAllBuild: "beforeAllBuild",
  afterAllBuild: "afterAllBuild",
  //发行版
  beforeDist: "beforeDist",
  afterDist: "afterDist",
  //打包
  beforePack: "beforePack",
  afterPack: "afterPack",
  //发布
  beforePublish: "beforePublish",
  afterPublish: "afterPublish",
  //卸载
  beforeUninstall: "beforeUninstall",
  afterUninstall: "afterUninstall"
};
exports.EventTypes = EventTypes;
global.eventEmitter = eventEmitter;
var _default = eventEmitter;
exports["default"] = _default;