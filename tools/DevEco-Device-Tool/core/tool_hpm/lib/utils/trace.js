"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.traceLogger = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _constant = require("../constant/constant");

var _helpers = require("./helpers");

var _logHelpers = require("./logHelpers");

var _child_process = require("child_process");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var traceLogger = {
  historyLogPath: _path["default"].resolve(_constant.DEFAULT_HISTORY_LOG_DIR, "history-".concat((0, _logHelpers.getFormattedDate)(new Date(), 'YYYY-MM-DD'), ".log")),
  writeToLog: function writeToLog(str) {
    if (!_fs["default"].existsSync(_constant.DEFAULT_HISTORY_LOG_DIR)) {
      (0, _helpers.runShellCmd)(function (shell) {
        return shell.mkdir('-p', _constant.DEFAULT_HISTORY_LOG_DIR);
      });
    }

    var writeStream = _fs["default"].createWriteStream(this.historyLogPath, {
      flags: 'a'
    });

    writeStream.write(str, 'utf-8');
  },
  write: function write(_ref) {
    var action = _ref.action,
        msg = _ref.msg;
    var data = {
      action: action,
      msg: msg,
      type: 'cmd'
    };
    var str = "[HPMCLI] : \n".concat(JSON.stringify(data), "\n");
    this.writeToLog(str);
  },
  unlinkLog: function unlinkLog(filePath) {
    _fs["default"].unlinkSync(filePath);
  },
  getHistoryLogger: function getHistoryLogger(filePath) {
    return new Promise(function (resolve, reject) {
      var readStream = _fs["default"].createReadStream(filePath);

      var data = '';
      readStream.on('data', function (chunk) {
        data += chunk;
      }).on('error', function (error) {
        reject(error);
      }).on('close', function () {
        resolve(data);
      });
    });
  },
  shouldSendMessage: function shouldSendMessage() {
    try {
      var logFiles = _fs["default"].readdirSync(_constant.DEFAULT_HISTORY_LOG_DIR);

      return logFiles.some(function (logFile) {
        var _logFile$match = logFile.match(/history-(\S*)\.log/),
            _logFile$match2 = _slicedToArray(_logFile$match, 2),
            filename = _logFile$match2[0],
            date = _logFile$match2[1];

        var diffDays = (Date.parse(new Date()) - Date.parse(date)) / (1000 * 60 * 60 * 24);

        if (diffDays < 1) {
          return false;
        } else {
          return true;
        }
      });
    } catch (err) {
      process.exit(-1);
    }
  },
  isTraceInstalled: function isTraceInstalled(pluginAPI) {
    var cmdPlugins = pluginAPI.getCmdPlugins();

    for (var cmd in cmdPlugins) {
      if (cmd === 'trace-server') {
        return true;
      }
    }

    return false;
  },
  sendToTrace: function sendToTrace(pluginAPI) {
    try {
      if (this.shouldSendMessage() && this.isTraceInstalled(pluginAPI)) {
        var child = (0, _child_process.spawn)('hpm', ['trace-server'], {
          shell: true,
          detached: false,
          windowsHide: false,
          stdio: 'inherit'
        });
      }
    } catch (err) {
      process.exit(-1);
    }
  }
};
exports.traceLogger = traceLogger;