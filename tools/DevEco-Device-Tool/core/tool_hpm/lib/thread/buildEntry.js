"use strict";

require("idempotent-babel-polyfill");

var _build = require("../commands/build");

var _bundle = require("../core/bundle");

var _i18n = _interopRequireDefault(require("../i18n"));

var _log = _interopRequireDefault(require("../core/log"));

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
var _require = require('worker_threads'),
    workerData = _require.workerData;

var bundlePath = workerData.bundlePath,
    isStartBundle = workerData.isStartBundle,
    bundleVarValues = workerData.bundleVarValues,
    customizeArgs = workerData.customizeArgs;

try {
  var bundle = _bundle.Bundle.from(bundlePath);

  bundle.vars.merge(bundleVarValues);
  (0, _build.bundleBuild)(bundle, isStartBundle, customizeArgs);
} catch (error) {
  _i18n["default"].log('build.error', {
    error: error
  });

  _log["default"].debug(error);

  process.exit(-1);
}