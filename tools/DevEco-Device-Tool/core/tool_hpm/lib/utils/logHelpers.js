"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cleanData = cleanData;
exports.cleanFiles = cleanFiles;
exports.getFormattedDate = getFormattedDate;
exports.getLogEnvironment = getLogEnvironment;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _package = _interopRequireDefault(require("../../package.json"));

var _helpers = require("./helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function getLogEnvironment() {
  var envs = process.env;
  var envKeys = Object.keys(envs);
  var cleanedEnvs = {};
  envKeys.forEach(function (key) {
    if (key.startsWith('DEP_')) {
      cleanedEnvs[key] = envKeys[key];
    }
  });
  return {
    platform: process.platform,
    node: process.version,
    hpm: _package["default"].version,
    argv: process.argv,
    env: cleanedEnvs
  };
}

function cleanData(data) {
  if (data && _typeof(data) === 'object') {
    var clone = data;
    var keywords = ['cookie', 'proxy', 'password', 'headers', '_header'];
    var stack = [clone];
    var cache = [clone];

    var _loop = function _loop() {
      var current = stack.pop();
      var keys = Object.keys(current);

      var _loop2 = function _loop2(i) {
        var key = keys[i];
        var lowercaseKey = key.toLowerCase();
        keywords.forEach(function (word) {
          if (lowercaseKey.indexOf(word) >= 0) {
            delete current[key];
          }
        });
        var child = current[key];

        if (child && (0, _helpers.isObject)(child) && !cache.find(function (c) {
          return c === child;
        })) {
          stack.push(current[key]);
          cache.push(child);
        }
      };

      for (var i = 0; i < keys.length; i += 1) {
        _loop2(i);
      }
    };

    while (stack.length > 0) {
      _loop();
    }

    return clone;
  }

  return data;
}

function cleanFiles(folder, maxFileNum) {
  if (_fs["default"].existsSync(folder)) {
    var dirs = _fs["default"].readdirSync(folder);

    if (dirs.length >= maxFileNum) {
      var oldFile = '';
      var oldTime = Infinity;
      dirs.forEach(function (fileName) {
        var filePath = _path["default"].join(folder, fileName);

        var stats = _fs["default"].statSync(filePath);

        if (oldTime > stats.mtimeMs) {
          oldTime = stats.mtimeMs;
          oldFile = filePath;
        }
      });

      if (oldFile) {
        (0, _helpers.runShellCmd)(function (shell) {
          return shell.rm('-rf', oldFile);
        });
      }
    }
  }
}

function getFormattedDate(d, format) {
  var year = d.getFullYear();
  var month = d.getMonth() + 1;
  var date = d.getDate();
  var hour = d.getHours();
  var minute = d.getMinutes();
  var second = d.getSeconds();

  if (format === 'YYYY-MM-DD-hh-mm-ss') {
    return [year, month, date, hour, minute, second].map(function (m) {
      return String(m).padStart(2, '0');
    }).join('-');
  }

  if (format === 'YYYY-MM') {
    return "".concat(String(year), "-").concat(String(month).padStart(2, '0'));
  }

  if (format === 'YYYY-MM-DD') {
    return [year, month, date].map(function (m) {
      return String(m).padStart(2, '0');
    }).join('-');
  }

  return d.getTime();
}