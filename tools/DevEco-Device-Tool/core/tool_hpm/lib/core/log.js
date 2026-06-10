"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _log4js = _interopRequireDefault(require("log4js"));

var _path = _interopRequireDefault(require("path"));

var _helpers = require("../utils/helpers");

var _constant = require("../constant/constant");

var _logHelpers = require("../utils/logHelpers");

var _config = _interopRequireDefault(require("../config.json"));

var _i18n = _interopRequireDefault(require("../i18n"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function getLogger(filename) {
  var folder = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  if (folder) {
    (0, _helpers.runShellCmd)(function (shell) {
      return shell.mkdir('-p', folder);
    });
  }

  _log4js["default"].configure({
    appenders: {
      file: {
        type: 'fileSync',
        filename: _path["default"].join(folder, filename)
      }
    },
    categories: {
      "default": {
        appenders: ['file'],
        level: _log4js["default"].levels.DEBUG
      }
    }
  });

  return _log4js["default"].getLogger();
}

function getWarningConsoleLogger() {
  _log4js["default"].configure({
    appenders: {
      console: {
        type: 'console',
        layout: {
          type: 'pattern',
          pattern: '%[[WARN] - %] %m'
        }
      }
    },
    categories: {
      "default": {
        appenders: ['console'],
        level: _log4js["default"].levels.WARN
      }
    }
  });

  return _log4js["default"].getLogger();
}

function getInfoConsoleLogger() {
  _log4js["default"].configure({
    appenders: {
      console: {
        type: 'console',
        layout: {
          type: 'pattern',
          pattern: '%[[INFO] - %] %m'
        }
      }
    },
    categories: {
      "default": {
        appenders: ['console'],
        level: _log4js["default"].levels.INFO
      }
    }
  });

  return _log4js["default"].getLogger();
}

var logger = {
  debug: function debug(error) {
    var prepare = (0, _logHelpers.getLogEnvironment)();
    var cleanedError = (0, _logHelpers.cleanData)(error);

    var data = _objectSpread({
      error: cleanedError
    }, prepare);

    var dateStr = (0, _logHelpers.getFormattedDate)(new Date(), 'YYYY-MM-DD-hh-mm-ss');
    var fileName = "debug.".concat(dateStr, ".log");
    (0, _logHelpers.cleanFiles)(_constant.DEFAULT_DEBUG_LOG_DIR, _config["default"].maxLogNumber);
    var debugLogger = getLogger(fileName, _constant.DEFAULT_DEBUG_LOG_DIR);
    debugLogger.debug(data);

    _i18n["default"].log('log.check', {
      filePath: _path["default"].join(_constant.DEFAULT_DEBUG_LOG_DIR, fileName)
    });

    process.exitCode = -1;
  },
  info: function info(message) {
    var dateStr = (0, _logHelpers.getFormattedDate)(new Date(), 'YYYY-MM');
    var debugLogger = getLogger("info.".concat(dateStr, ".log"), _constant.DEFAULT_INFO_LOG_DIR);
    debugLogger.info(message);
  },
  warnConsole: function warnConsole(message) {
    var warnLogger = getWarningConsoleLogger();
    warnLogger.warn(message);
  },
  infoConsole: function infoConsole(message) {
    var infoLogger = getInfoConsoleLogger();
    infoLogger.info(message);
  }
};
var _default = logger;
exports["default"] = _default;