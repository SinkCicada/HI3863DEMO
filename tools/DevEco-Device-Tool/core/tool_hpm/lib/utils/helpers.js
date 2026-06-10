"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.URL = exports.MAC_00 = void 0;
exports.checkPassword = checkPassword;
exports.cleanBundlesFolder = cleanBundlesFolder;
exports.formatBytes = formatBytes;
exports.getErrorMessage = getErrorMessage;
exports.getLoginUser = getLoginUser;
exports.getMacAddrs = getMacAddrs;
exports.getRegistryHost = getRegistryHost;
exports.getScopeRegistry = exports.getScopeName = exports.getScopeLogin = void 0;
exports.getUuid = getUuid;
exports.initDependenciesMap = initDependenciesMap;
exports.isEmptyObject = isEmptyObject;
exports.isObject = isObject;
exports.isSnapshot = isSnapshot;
exports.isTestEnv = isTestEnv;
exports.isWindows = isWindows;
exports.memorySizeOf = memorySizeOf;
exports.parseScopeName = parseScopeName;
exports.runCmdWithSpawnSync = void 0;
exports.runShellCmd = runShellCmd;
exports.tableColumnRender = tableColumnRender;

var _shelljs = _interopRequireDefault(require("shelljs"));

var _os = _interopRequireDefault(require("os"));

var _path = _interopRequireDefault(require("path"));

var _child_process = require("child_process");

var _url = _interopRequireDefault(require("url"));

var _i18n = require("../i18n");

var _semver = _interopRequireDefault(require("semver"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var MAC_00 = '00:00:00:00:00:00';
exports.MAC_00 = MAC_00;

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

function isEmptyObject(obj) {
  return isObject(obj) && Object.keys(obj).length === 0;
}

var runCmdWithSpawnSync = function runCmdWithSpawnSync(cmd) {
  var result = cmd(_child_process.spawnSync);

  if (isTestEnv()) {
    // Cannot get spawnSync return value. So we will mock spawnSync in testcase and test its input
    process.stdout.write(result.cmd);

    if (result.env) {
      process.stdout.write(result.env);
    }
  }

  if (result && result.status) {
    process.exitCode = result.status;
  }
};

exports.runCmdWithSpawnSync = runCmdWithSpawnSync;

function runShellCmd(cmd) {
  var needHandleResult = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var shellResult = cmd(_shelljs["default"]);

  if (needHandleResult) {
    if (shellResult.code !== 0) {
      process.exitCode = -1;
      throw shellResult.stderr;
    }

    if (isTestEnv()) {
      process.stdout.write(shellResult.stdout);
    }
  }

  return shellResult;
}

function isSnapshot(version) {
  var prereleaseList = _semver["default"].prerelease(version);

  return prereleaseList && prereleaseList.length && prereleaseList[0].toString().toUpperCase() === "SNAPSHOT";
}

function isWindows() {
  return _os["default"].platform() === 'win32';
}

function initDependenciesMap(bundles) {
  var dependencies = new Map(); // 依赖了谁

  var dependents = new Map(); // 被谁依赖了

  var _iterator = _createForOfIteratorHelper(bundles),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var bundle = _step.value;
      dependencies.set(bundle.name, new Set());
      dependents.set(bundle.name, new Set());
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  var dependencySet = null;
  var dependentSet = null;

  var _iterator2 = _createForOfIteratorHelper(bundles),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var _bundle = _step2.value;

      var _iterator3 = _createForOfIteratorHelper(_bundle.dependencies),
          _step3;

      try {
        var _loop = function _loop() {
          var dependencie = _step3.value;
          var depName = dependencie.name;

          if (bundles.find(function (b) {
            return b.name === depName;
          })) {
            dependencySet = dependencies.get(_bundle.name);

            if (dependencySet) {
              dependencySet.add(depName);
            }

            dependentSet = dependents.get(depName);

            if (dependentSet) {
              dependentSet.add(_bundle.name);
            }
          }
        };

        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          _loop();
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }

  return {
    dependencies: dependencies,
    dependents: dependents
  };
}

var getScopeName = function getScopeName(name) {
  var scope = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  return "".concat(scope.startsWith('@') ? scope : "@".concat(scope), "/").concat(name);
};

exports.getScopeName = getScopeName;

function parseScopeName(name) {
  var scopeInfo = /^(@[\s\S]+)\/([\s\S]+)$/g.exec(name);

  if (scopeInfo && scopeInfo.length === 3) {
    return {
      scope: scopeInfo[1] || '',
      name: scopeInfo[2] || ''
    };
  }

  return {
    scope: '',
    name: name
  };
}

function getRegistryUrl(name) {
  var _parseScopeName = parseScopeName(name),
      scope = _parseScopeName.scope;

  return scope && process.env["".concat(scope, ":registry")] ? process.env["".concat(scope, ":registry")] : process.env.registry || '';
}

function getRegistryHost(name) {
  var registryUrl = getRegistryUrl(name);

  var parsed = _url["default"].parse(registryUrl);

  return "".concat(parsed.protocol, "//").concat(parsed.host);
}

var getScopeRegistry = function getScopeRegistry(name) {
  var registryUrl = getRegistryUrl(name);

  var parsed = _url["default"].parse(registryUrl);

  if (!parsed.path || parsed.path === '/') {
    return "".concat(parsed.protocol, "//").concat(parsed.host, "/hpm/registry/api/bundles");
  }

  return "".concat(registryUrl, "/bundles");
};

exports.getScopeRegistry = getScopeRegistry;

var getScopeLogin = function getScopeLogin(name) {
  var _parseScopeName2 = parseScopeName(name),
      scope = _parseScopeName2.scope;

  if (scope && process.env["".concat(scope, ":login")]) {
    return process.env["".concat(scope, ":login")];
  }

  if (process.env.login) {
    return process.env.login;
  }

  var host = getRegistryHost(name);
  return "".concat(host, "/hpm/auth/pk");
};

exports.getScopeLogin = getScopeLogin;

var getScopeLicense = function getScopeLicense() {
  var registryUrl = getRegistryUrl("");

  var parsed = _url["default"].parse(registryUrl);

  return "".concat(parsed.protocol, "//").concat(parsed.host, "/hpm/dist/api/business/classification");
};

var getScopeSolutions = function getScopeSolutions() {
  var registryUrl = getRegistryUrl("");

  var parsed = _url["default"].parse(registryUrl);

  return "".concat(parsed.protocol, "//").concat(parsed.host, "/hpm/registry/api/solutions");
};

var URL = {
  bundles: function bundles(name) {
    return "".concat(getScopeRegistry(name));
  },
  login: function login(name) {
    return "".concat(getScopeLogin(name));
  },
  search: function search(name) {
    return "".concat(getScopeRegistry(name));
  },
  upload: function upload(name) {
    return "".concat(getScopeRegistry(name), "/upload");
  },
  uploadStatus: function uploadStatus(name, storageKey) {
    return "".concat(getScopeRegistry(name), "/").concat(storageKey);
  },
  // 通知服务器是否已经上传到内容中心
  licenses: function licenses() {
    return getScopeLicense();
  },
  searchSolution: function searchSolution() {
    return getScopeSolutions();
  }
};
exports.URL = URL;

function getLoginUser() {
  var loginUser = process.env.loginUser;

  var hpmrcPath = _path["default"].join(_os["default"].homedir(), '.hpm', 'hpmrc');

  if (!loginUser) {
    throw (0, _i18n.getI18nMessage)('config.loginUserNotFound', {
      filePath: hpmrcPath
    });
  }

  return loginUser;
}

function getErrorMessage(error) {
  if (!error) {
    return (0, _i18n.getI18nMessage)('UnexpectedError');
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error.response) {
    var statusCode = error.response.status;

    if (statusCode === 404) {
      return (0, _i18n.getI18nMessage)('request.notFound');
    }

    if (statusCode === 405) {
      return (0, _i18n.getI18nMessage)('request.paramsError');
    }

    if (error.response.data && error.response.data.message) {
      return error.response.data.message;
    }

    if (error.response.statusText) {
      return error.response.statusText;
    }
  }

  if (error.code) {
    if (error.code === 'ETIMEDOUT' || error.code === 'EACCES') {
      return (0, _i18n.getI18nMessage)('request.timeout');
    }

    if (error.code === 'ECONNRESET') {
      return (0, _i18n.getI18nMessage)('request.econnreset');
    }
  }

  if (error.data && error.data.message) {
    return error.data.message;
  }

  if (error.message) {
    return error.message;
  }

  return (0, _i18n.getI18nMessage)('UnexpectedError');
}

function getMacAddrs() {
  var networkInfo = _os["default"].networkInterfaces();

  var macs = [];

  for (var key in networkInfo) {
    var faces = networkInfo[key];

    for (var i = 0; i < faces.length; i += 1) {
      var face = faces[i];

      if (face.mac && face.mac !== MAC_00) {
        macs.push(face.mac);
        break;
      }
    }
  }

  return macs;
}

function checkPassword(password) {
  if (!password) {
    return true;
  }

  if (password.length < 8) {
    return (0, _i18n.getI18nMessage)('password.lengthLess8');
  }

  var upperReg = /[A-Z]/;
  var lowerReg = /[a-z]/;
  var numberReg = /[0-9]/;
  var specialReg = /[~!@#$\%^&*()\-_\=+\|\[{}\];:'",<.>\/?]/;
  var matchNum = 0;
  [upperReg, lowerReg, numberReg, specialReg].forEach(function (reg) {
    if (reg.test(password)) {
      matchNum += 1;
    }
  });

  if (matchNum < 2) {
    return (0, _i18n.getI18nMessage)('password.mustCharacters');
  }

  return true;
}

function isTestEnv() {
  return process.env.NODE_ENV === 'test';
}

function tableColumnRender(value, maxLength) {
  if (value.length > maxLength) {
    return "".concat(value.substr(0, maxLength), "...");
  }

  return value;
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " Bytes";else if (bytes < Math.pow(1024, 2)) return (bytes / 1024).toFixed(2) + " KB";else if (bytes < Math.pow(1024, 3)) return (bytes / Math.pow(1024, 2)).toFixed(2) + " MB";else return (bytes / Math.pow(1024, 3)).toFixed(2) + " GB";
}

;

function cleanBundlesFolder(dir) {
  if (fs.existsSync(dir)) {
    runShellCmd(function (shell) {
      return shell.rm('-rf', dir);
    });
  }
}

function getUuid() {
  var uuidStack = [];
  var hexDigitstring = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (var index = 0; index < 36; index++) {
    uuidStack[index] = hexDigitstring.substr(Math.floor(Math.random() * 0x10), 1);
  }

  uuidStack[14] = "4";
  uuidStack[19] = hexDigitstring.substr(uuidStack[19] & 0x3 | 0x8, 1);
  uuidStack[8] = "-";
  uuidStack[13] = "-";
  uuidStack[18] = "-";
  uuidStack[23] = "-";
  return uuidStack.join("");
}

function memorySizeOf(data) {
  var bytes = 0;

  var sizeOf = function sizeOf(data) {
    if (data !== null && data !== undefined) {
      switch (_typeof(data)) {
        case 'number':
          bytes += 8;
          break;

        case 'string':
          bytes += data.length;
          break;

        case 'boolean':
          bytes += 4;
          break;

        case 'object':
          var dataClass = Object.prototype.toString.call(data).slice(8, -1);

          if (dataClass === 'Object') {
            for (var key in data) {
              if (!data.hasOwnProperty(key)) continue;
              sizeOf(data[key]);
            }
          } else if (dataClass === 'Array') {
            bytes += data.join().length;
          } else {
            bytes += data.toString().length * 2;
          }

          break;
      }
    }

    return bytes;
  };

  return sizeOf(data);
}