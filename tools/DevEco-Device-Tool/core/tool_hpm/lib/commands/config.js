"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.config = void 0;

var _rcParser = _interopRequireDefault(require("../core/rc-parser"));

var _i18n = _interopRequireWildcard(require("../i18n"));

var _constant = require("../constant/constant");

var _crypto = _interopRequireDefault(require("../core/crypto"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
var config = function config(options, _ref) {
  var args = _ref.args;
  var actionName = args && args[0];

  var rcParser = _rcParser["default"].fromPath(_constant.DEFAULT_CONFIG_FILE);

  var key = args[1];
  var value = args[2];

  switch (actionName) {
    case 'set':
      if (args.length !== 3) {
        throw (0, _i18n.getI18nMessage)('config.setFormat');
      }

      if (['http_proxy', 'https_proxy'].includes(key)) {
        value = _crypto["default"].proxyEncrypt(value);
      }

      rcParser.set(key, value);
      rcParser.save();
      break;

    case 'delete':
      if (args.length !== 2) {
        throw (0, _i18n.getI18nMessage)('config.deleteFormat');
      }

      rcParser["delete"](key);
      rcParser.save();
      break;

    case 'list':
      if (options.json) {
        console.log(JSON.stringify(rcParser.toJson(), null, 4));
      } else {
        _i18n["default"].log('common.message', {
          message: "".concat(rcParser.toString(), "\n")
        });
      }

      _i18n["default"].log('common.modifyRc', {
        filePath: _constant.DEFAULT_CONFIG_FILE
      });

      break;

    case 'get':
      console.log(rcParser.get(key));
      break;

    default:
      console.log((0, _i18n.getI18nMessage)('config.supportError', {
        errAction: actionName || ''
      }));
      break;
  }
};

exports.config = config;