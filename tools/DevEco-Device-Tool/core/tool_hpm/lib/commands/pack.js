"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pack = pack;
exports.packBundle = packBundle;

var _tar = _interopRequireDefault(require("tar"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _bundle = require("../core/bundle");

var _helpers = require("../utils/helpers");

var _i18n = _interopRequireWildcard(require("../i18n"));

var _constant = require("../constant/constant");

var _events = _interopRequireWildcard(require("../utils/events"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function pack() {
  var bundle = _bundle.Bundle.from(process.cwd());

  packBundle(bundle);
}

function packBundle(bundle) {
  var tgz = "".concat(bundle.id, ".tgz");

  if (_fs["default"].existsSync(tgz)) {
    (0, _helpers.runShellCmd)(function (shell) {
      return shell.rm('-rf', tgz);
    });
  }

  var prePackCmd = bundle.scripts(_constant.Hooks.prePack);

  if (prePackCmd) {
    (0, _helpers.runCmdWithSpawnSync)(function (spawnSync) {
      return spawnSync(prePackCmd, {
        shell: process.env.shellPath,
        env: bundle.vars.env,
        cwd: bundle.path,
        stdio: 'inherit'
      });
    });
  }

  _events["default"].emit('hooks', {
    type: _events.EventTypes.beforePack,
    name: bundle.name,
    path: bundle.path
  });

  bundle.copyReadme();

  _i18n["default"].log('pack.step1', {
    tgz: tgz,
    bundlePath: bundle.path
  });

  var base = _path["default"].join((0, _helpers.runShellCmd)(function (shell) {
    return shell.tempdir();
  }, false), "".concat(bundle.id, "-").concat(Date.now()));

  (0, _helpers.runShellCmd)(function (shell) {
    return shell.mkdir('-p', base);
  });
  var files = bundle.pack();

  var dirname = _path["default"].parse(bundle.path).base;

  if (!files) {
    var baseDir = _path["default"].resolve(base, dirname);

    (0, _helpers.runShellCmd)(function (shell) {
      return shell.mkdir('-p', baseDir);
    }); //  cp的时候过滤掉ohos_bundles

    var excludeDepFolder = _fs["default"].readdirSync(_path["default"].resolve(bundle.path)).filter(function (item) {
      return item !== _constant.DEP_FOLDER_NAME;
    }).map(function (item) {
      return _path["default"].resolve(bundle.path, item);
    });

    (0, _helpers.runShellCmd)(function (shell) {
      return shell.cp('-R', excludeDepFolder, baseDir);
    });
  } else {
    var _loop = function _loop(dir) {
      _i18n["default"].log('pack.step2', {
        dir: dir
      });

      (0, _helpers.runShellCmd)(function (shell) {
        return shell.mkdir('-p', _path["default"].join(base, dir));
      });

      var _iterator = _createForOfIteratorHelper(files[dir]),
          _step;

      try {
        var _loop2 = function _loop2() {
          var file = _step.value;

          var fileRelativePath = _path["default"].relative(bundle.path, file);

          _i18n["default"].log('pack.step3', {
            fileRelativePath: fileRelativePath
          });

          (0, _helpers.runShellCmd)(function (shell) {
            return shell.cp('-R', file, _path["default"].join(base, dir));
          });
        };

        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          _loop2();
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    };

    for (var dir in files) {
      _loop(dir);
    }
  }

  var temSourcePath = ['code-segment', 'template'].some(bundle.isPublishAs.bind(bundle)) ? _path["default"].join(base, dirname) : base;

  var tarFiles = _fs["default"].readdirSync(temSourcePath);

  if (bundle.isPublishAs('chip-definition') && !isXmlExisted(tarFiles, temSourcePath)) {
    throw (0, _i18n.getI18nMessage)('bundle.fileRequired', {
      name: '*.xml'
    });
  }

  tarFiles = tarFiles.map(function (f) {
    return f.startsWith('@') ? "./".concat(f) : f;
  }); // tar-node

  _tar["default"].create({
    gzip: true,
    file: tgz,
    cwd: temSourcePath,
    sync: true
  }, tarFiles);

  _i18n["default"].log('pack.step4', {
    tgz: tgz
  });

  var afterPackCmd = bundle.scripts(_constant.Hooks.pack) || bundle.scripts(_constant.Hooks.afterPack);

  if (afterPackCmd) {
    (0, _helpers.runCmdWithSpawnSync)(function (spawnSync) {
      return spawnSync(afterPackCmd, {
        shell: process.env.shellPath,
        env: bundle.vars.env,
        cwd: bundle.path,
        stdio: 'inherit'
      });
    });
  }

  _events["default"].emit('hooks', {
    type: _events.EventTypes.afterPack,
    name: bundle.name,
    path: bundle.path
  });

  if (_fs["default"].existsSync(base)) {
    (0, _helpers.runShellCmd)(function (shell) {
      return shell.rm('-rf', base);
    });
  }
}

function isXmlExisted(files, soucePath) {
  return files.find(function (file) {
    return file.endsWith('.xml') && _fs["default"].statSync(_path["default"].resolve(soucePath, file)).isFile();
  });
}