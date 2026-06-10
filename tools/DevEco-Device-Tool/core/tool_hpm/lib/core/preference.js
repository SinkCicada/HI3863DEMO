"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get"); return _classApplyDescriptorGet(receiver, descriptor); }

function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set"); _classApplyDescriptorSet(receiver, descriptor, value); return value; }

function _classExtractFieldDescriptor(receiver, privateMap, action) { if (!privateMap.has(receiver)) { throw new TypeError("attempted to " + action + " private field on non-instance"); } return privateMap.get(receiver); }

function _classApplyDescriptorSet(receiver, descriptor, value) { if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } }

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
var fs = require('fs');

var path = require('path');

var _require = require('../constant/constant'),
    DEFAULT_CONFIG_DIR = _require.DEFAULT_CONFIG_DIR;

var _require2 = require('../utils/helpers'),
    runShellCmd = _require2.runShellCmd;

var _json = /*#__PURE__*/new WeakMap();

var Preference = /*#__PURE__*/function () {
  function Preference() {
    _classCallCheck(this, Preference);

    _classPrivateFieldInitSpec(this, _json, {
      writable: true,
      value: void 0
    });

    if (!fs.existsSync(DEFAULT_CONFIG_DIR)) {
      runShellCmd(function (shell) {
        return shell.mkdir('-p', DEFAULT_CONFIG_DIR);
      });
    }

    this.path = path.join(DEFAULT_CONFIG_DIR, 'preference.json');

    if (!fs.existsSync(this.path)) {
      fs.writeFileSync(this.path, JSON.stringify({
        recentProject: [],
        disabledPlugins: [],
        darkMode: true,
        lang: 'en'
      }));
    }

    _classPrivateFieldSet(this, _json, this.readJsonFromFile());

    if (!(_classPrivateFieldGet(this, _json)['recentProject'] && _classPrivateFieldGet(this, _json)['disabledPlugins'] && _classPrivateFieldGet(this, _json)['lang'] && _classPrivateFieldGet(this, _json)['darkMode'] !== undefined)) {
      _classPrivateFieldGet(this, _json)['recentProject'] = _classPrivateFieldGet(this, _json)['recentProject'] || [];
      _classPrivateFieldGet(this, _json)['disabledPlugins'] = _classPrivateFieldGet(this, _json)['disabledPlugins'] || [];
      _classPrivateFieldGet(this, _json)['lang'] = _classPrivateFieldGet(this, _json)['lang'] || 'en';
      _classPrivateFieldGet(this, _json)['darkMode'] = _classPrivateFieldGet(this, _json)['darkMode'] || true;
      this.save();
    }
  }

  _createClass(Preference, [{
    key: "readJsonFromFile",
    value: function readJsonFromFile() {
      return JSON.parse(fs.readFileSync(this.path).toString());
    }
  }, {
    key: "set",
    value: function set(key, value, save) {
      _classPrivateFieldGet(this, _json)[key] = value;
      save && this.save();
    }
  }, {
    key: "get",
    value: function get(key) {
      return _classPrivateFieldGet(this, _json)[key];
    }
  }, {
    key: "save",
    value: function save() {
      fs.writeFileSync(this.path, JSON.stringify(_classPrivateFieldGet(this, _json), null, 4));
    }
  }, {
    key: "getRecentProject",
    value: function getRecentProject() {
      return _classPrivateFieldGet(this, _json).recentProject;
    }
  }, {
    key: "setRecentProject",
    value: function setRecentProject(name, projectPath, isDelete) {
      var recentProject = _classPrivateFieldGet(this, _json).recentProject || [];
      recentProject = recentProject.filter(function (p) {
        return p.path !== projectPath;
      });

      if (isDelete) {
        recentProject = recentProject.filter(function (p) {
          return p.path !== projectPath;
        });
      } else {
        recentProject.unshift({
          name: name,
          path: projectPath,
          time: new Date().toLocaleString(undefined, {
            hour12: false
          })
        });
      }

      if (recentProject.length > 10) {
        recentProject.pop();
      }

      this.set('recentProject', recentProject);
      this.save();
    }
  }, {
    key: "addDisabledPlugin",
    value: function addDisabledPlugin(name) {
      var disabledPlugins = _classPrivateFieldGet(this, _json).disabledPlugins || [];
      disabledPlugins = disabledPlugins.filter(function (pluginName) {
        return pluginName !== name;
      });
      disabledPlugins.push(name);
      this.set('disabledPlugins', disabledPlugins);
      this.save();
    }
  }, {
    key: "removeDisabledPlugin",
    value: function removeDisabledPlugin(name) {
      var disabledPlugins = _classPrivateFieldGet(this, _json).disabledPlugins || [];
      disabledPlugins = disabledPlugins.filter(function (pluginName) {
        return pluginName !== name;
      });
      this.set('disabledPlugins', disabledPlugins);
      this.save();
    }
  }, {
    key: "getDisabledPlugins",
    value: function getDisabledPlugins() {
      return _classPrivateFieldGet(this, _json).disabledPlugins;
    }
  }, {
    key: "getThemeOrLang",
    value: function getThemeOrLang(key) {
      var keys = ['darkMode', 'lang'];

      if (keys.includes(key)) {
        return _classPrivateFieldGet(this, _json)[key];
      }
    }
  }, {
    key: "setThemeOrLang",
    value: function setThemeOrLang(key, value) {
      var keys = ['darkMode', 'lang'];

      if (keys.includes(key)) {
        this.set(key, value);
        this.save();
      }
    }
  }]);

  return Preference;
}();

var preference = new Preference();
module.exports = preference;