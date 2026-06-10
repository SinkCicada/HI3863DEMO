"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getNpmManifests = getNpmManifests;
exports.registerPluginHooks = registerPluginHooks;
exports.resolveCmdPlugins = resolveCmdPlugins;
exports.resolveNpmPlugins = resolveNpmPlugins;

var _path = _interopRequireDefault(require("path"));

var _repository = require("../core/repository");

var _constant = require("../constant/constant");

var _config = require("../utils/config");

var _pluginAPI = require("./pluginAPI");

var _fs = _interopRequireDefault(require("fs"));

var _events = _interopRequireDefault(require("../utils/events"));

var _i18n = _interopRequireDefault(require("../i18n"));

var _log = _interopRequireDefault(require("../core/log"));

var _helpers = require("../utils/helpers");

var _package = _interopRequireDefault(require("../../package.json"));

var _manifest = require("../core/manifest");

var _excluded = ["type"];

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function resolveCmdPlugins(pluginAPI) {
  try {
    var cwd = process.cwd();
    var repo = new _repository.Repository(_path["default"].join(cwd, _constant.DEP_FOLDER_NAME), (0, _config.getGlobalRepo)());
    var manifests = repo.manifests(filterPluginFolder).concat(repo.globalManifests(filterPluginFolder));
    manifests.filter(_pluginAPI.isPlugin).filter(function (manifest) {
      return !pluginAPI.getDisabledPlugins().includes(manifest.name);
    }).forEach(function (manifest) {
      requireEntry(manifest, manifest.path, pluginAPI);
    });
  } catch (error) {
    _i18n["default"].log('plugin.resolveError', {
      error: (0, _helpers.getErrorMessage)(error)
    });

    _log["default"].debug(error);
  }
}

function resolveNpmPlugins(pluginAPI) {
  var manifests = getNpmManifests();
  manifests.forEach(function (m) {
    requireEntry(m, m.path, pluginAPI);
  });
}

function registerPluginHooks(pluginAPI) {
  _events["default"].on('hooks', function (_ref) {
    var type = _ref.type,
        args = _objectWithoutProperties(_ref, _excluded);

    var hooks = pluginAPI.getHooks();

    if (hooks[type]) {
      try {
        var _iterator = _createForOfIteratorHelper(hooks[type]),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var hook = _step.value;
            hook(args);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      } catch (error) {
        _i18n["default"].log('plugin.hooksError', {
          error: (0, _helpers.getErrorMessage)(error),
          type: type
        });
      }
    }
  });
}

function getNpmManifests() {
  var deps = _package["default"].dependencies;
  var manifests = [];

  if (deps) {
    var names = Object.keys(deps);
    var npmPlugins = [];
    names.forEach(function (n) {
      var _parseScopeName = (0, _helpers.parseScopeName)(n),
          scope = _parseScopeName.scope,
          name = _parseScopeName.name;

      if (scope && name.startsWith(_constant.NPM_PLUGIN_PREFIX)) {
        npmPlugins.push({
          scope: scope,
          name: name
        });
      }
    });
    npmPlugins.forEach(function (_ref2) {
      var scope = _ref2.scope,
          name = _ref2.name;

      var pluginPath = _path["default"].join(__dirname, "..", "..", "node_modules", scope, name);

      if (_fs["default"].existsSync(_path["default"].join(pluginPath, "bundle.json"))) {
        var manifest = _manifest.Manifest.fromPath(pluginPath);

        manifest.path = pluginPath;
        manifests.push(manifest);
      }
    });
  }

  return manifests;
}

function requireEntry(manifest, projectPath, pluginAPI) {
  var entryFileName = manifest.plugin && manifest.plugin.entry;

  if (entryFileName) {
    var entryFilePath = _path["default"].resolve(_path["default"].join(projectPath, entryFileName));

    if (_fs["default"].existsSync(entryFilePath)) {
      require(entryFilePath)(pluginAPI);
    }
  }
}

function filterPluginFolder(folderName) {
  return !!(folderName && (folderName.startsWith(_constant.PLUGIN_PREFIX) || folderName.startsWith(_constant.UI_PLUGIN_PREFIX)));
}