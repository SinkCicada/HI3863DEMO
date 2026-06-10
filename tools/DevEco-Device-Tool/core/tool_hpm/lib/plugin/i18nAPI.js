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
var _require = require("../i18n"),
    i18n = _require["default"],
    getI18nMessage = _require.getI18nMessage;

var i18nAPI = {
  addLocalization: function addLocalization(lang, resource, meta) {
    i18n.addLocalization(lang, resource, meta);
  },
  log: function log(key, params) {
    var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
        _ref$silent = _ref.silent,
        silent = _ref$silent === void 0 ? false : _ref$silent;

    i18n.log(key, params, {
      silent: silent
    });
  },
  getMessage: function getMessage(key, params) {
    return getI18nMessage(key, params);
  }
};
var _default = i18nAPI;
exports["default"] = _default;