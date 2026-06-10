"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cacheExpiration = cacheExpiration;
exports.getRootBundlePath = exports.getGlobalRepo = exports.getConfig = void 0;
exports.httpProxyDecrypt = httpProxyDecrypt;
exports.ignoreLicenseCheck = ignoreLicenseCheck;
exports.initConfig = void 0;
exports.isPrivateSupport = isPrivateSupport;
exports.isStrictSsl = isStrictSsl;
exports.restoreCodeSegment = restoreCodeSegment;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _rcParser2 = _interopRequireDefault(require("../core/rc-parser"));

var _helpers = require("./helpers");

var _constant = require("../constant/constant");

var _config = _interopRequireDefault(require("../config.json"));

var _i18n = _interopRequireWildcard(require("../i18n"));

var _crypto = _interopRequireDefault(require("../core/crypto"));

var _log = _interopRequireDefault(require("../core/log"));

var _defaultConfig;

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var defaultConfig = (_defaultConfig = {
  registry: _config["default"].registry,
  login: _config["default"].login,
  globalRepo: _constant.DEFAULT_GLOBAL_DIR,
  strictSsl: _config["default"].strictSsl
}, _defineProperty(_defaultConfig, (0, _i18n.getI18nMessage)('config.https_proxy_note'), ''), _defineProperty(_defaultConfig, (0, _i18n.getI18nMessage)('config.http_proxy_note'), ''), _defineProperty(_defaultConfig, "restoreCodeSegment", true), _defineProperty(_defaultConfig, "privateSupport", false), _defineProperty(_defaultConfig, "ignoreLicenseCheck", false), _defineProperty(_defaultConfig, "OSPlatform", 'Auto'), _defineProperty(_defaultConfig, "batchDownloadLimit", 4), _defineProperty(_defaultConfig, "ignoreBundles", ''), _defineProperty(_defaultConfig, "modelRepository", _constant.DEFAULT_CONFIG_DIR), _defineProperty(_defaultConfig, 'cache-expiration', _config["default"]['cache-expiration']), _defaultConfig);

if ((0, _helpers.isWindows)()) {
  defaultConfig.shellPath = process.env.COMSPEC;
} else {
  defaultConfig.shellPath = _config["default"].unixShell;
}

var initConfig = function initConfig() {
  if (!_fs["default"].existsSync(_constant.DEFAULT_CONFIG_DIR)) {
    (0, _helpers.runShellCmd)(function (shell) {
      return shell.mkdir('-p', _constant.DEFAULT_CONFIG_DIR);
    });
  }

  var configPath = _constant.DEFAULT_CONFIG_FILE;
  var config = null; // init hpmrc

  if (!_fs["default"].existsSync(configPath)) {
    var rcParser = _rcParser2["default"].saveJsonToFile(defaultConfig, configPath);

    config = rcParser.toJson();
  } else {
    var _rcParser = _rcParser2["default"].fromPath(configPath);

    var json = _rcParser.toJson();

    config = _objectSpread(_objectSpread({}, defaultConfig), json);

    if (config.shellPath && !_fs["default"].existsSync(config.shellPath)) {
      _i18n["default"].log('config.shellPathNotFound', {
        shellPath: config.shellPath
      });

      _i18n["default"].log('common.modifyRc', {
        filePath: _constant.DEFAULT_CONFIG_FILE
      });

      process.exit(-1);
    }
  } // init proxy key pairs 


  var publicPath = _path["default"].resolve(_constant.DEFAULT_CONFIG_DIR, 'key', 'publicKey_proxy.pem');

  var privatePath = _path["default"].resolve(_constant.DEFAULT_CONFIG_DIR, 'key', 'privateKey_proxy.pem');

  if (!_fs["default"].existsSync(publicPath) && !_fs["default"].existsSync(privatePath)) {
    _crypto["default"].generateKeyPair({
      user: 'proxy',
      isLog: false,
      isAesGcm: true
    });
  } // init global bundle json


  if (!_fs["default"].existsSync(config.globalRepo)) {
    (0, _helpers.runShellCmd)(function (shell) {
      return shell.mkdir('-p', config.globalRepo);
    });

    _fs["default"].writeFileSync(_path["default"].join(config.globalRepo, 'bundle.json'), JSON.stringify({
      name: 'global',
      version: '0.0.1'
    }, null, 4));
  } // write config to process.env


  for (var key in config) {
    if (config[key]) {
      if (key.toLowerCase() === 'path') {
        var pathArr = config[key].split(_path["default"].delimiter).concat(process.env.path.split(_path["default"].delimiter));
        process.env.path = pathArr.join(_path["default"].delimiter);
      } else {
        if (['http_proxy', 'https_proxy'].includes(key)) {
          try {
            process.env[key] = _crypto["default"].proxyDecrypt(config[key]);
          } catch (error) {
            _log["default"].warnConsole((0, _i18n.getI18nMessage)('config.proxyDecryptedError'));
          }
        } else {
          process.env[key] = config[key];
        }
      }
    }
  }
};

exports.initConfig = initConfig;

var getConfig = function getConfig() {
  var configPath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _constant.DEFAULT_CONFIG_FILE;

  if (_fs["default"].existsSync(configPath)) {
    var rcParser = _rcParser2["default"].fromPath(configPath);

    var config = rcParser.toJson();
    return config;
  }

  return defaultConfig;
};

exports.getConfig = getConfig;

var getGlobalRepo = function getGlobalRepo() {
  return _path["default"].join(process.env.globalRepo, _constant.DEP_FOLDER_NAME);
};

exports.getGlobalRepo = getGlobalRepo;

var getRootBundlePath = function getRootBundlePath(isGlobal) {
  return isGlobal ? process.env.globalRepo : process.cwd();
};

exports.getRootBundlePath = getRootBundlePath;

var toBoolean = function toBoolean(value, defaultVal) {
  if (typeof value === 'string') {
    return value.trim().toLowerCase() === 'true';
  }

  return defaultVal;
};

function isStrictSsl() {
  return toBoolean(process.env.strictSsl, false);
}

function isPrivateSupport() {
  return toBoolean(process.env.privateSupport, false);
}

function restoreCodeSegment() {
  return toBoolean(process.env.restoreCodeSegment, true);
}

function ignoreLicenseCheck() {
  return toBoolean(process.env.ignoreLicenseCheck, false);
}

function cacheExpiration() {
  var cacheTime = parseInt(process.env['cache-expiration']);

  if (!!cacheTime || cacheTime < 0) {
    return _config["default"]['cache-expiration'] * 1000;
  }

  return cacheTime * 1000;
}

function httpProxyDecrypt() {
  var proxy = {
    https_proxy: '',
    http_proxy: ''
  };

  if (process.env.https_proxy) {
    proxy.https_proxy = process.env.https_proxy;
  }

  if (process.env.http_proxy) {
    proxy.http_proxy = process.env.http_proxy;
  }

  return proxy;
}