"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BundleCache = void 0;
exports.cachePath = cachePath;

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _helpers = require("../utils/helpers");

var _constant = require("../constant/constant");

var _config = require("../utils/config");

var _i18n = require("../i18n");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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

var _cacheMap = /*#__PURE__*/new WeakMap();

var _cacheBundle = /*#__PURE__*/new WeakMap();

var BundleCache = /*#__PURE__*/function () {
  function BundleCache(cacheMap, cacheBundle) {
    _classCallCheck(this, BundleCache);

    _classPrivateFieldInitSpec(this, _cacheMap, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _cacheBundle, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldSet(this, _cacheMap, cacheMap);

    _classPrivateFieldSet(this, _cacheBundle, cacheBundle);
  }

  _createClass(BundleCache, [{
    key: "saveToFile",
    value: function saveToFile(dir) {
      var cacheDir = _path["default"].join(dir, _constant.DEP_FOLDER_NAME, _constant.DOWNLOAD_TEMP_FOLDER);

      if (_fs["default"].existsSync(cacheDir)) {
        var json = this.toJson();

        var cacheJsonDir = _path["default"].join(cacheDir, 'bundle-cache.json');

        if (_fs["default"].existsSync(cacheJsonDir)) {
          (0, _helpers.runShellCmd)(function (shell) {
            return shell.rm('-rf', cacheJsonDir);
          });
        }

        _fs["default"].writeFileSync(cacheJsonDir, JSON.stringify(json, null, 4));
      }
    }
  }, {
    key: "setCacheMap",
    value: function setCacheMap(manifests) {
      var _this = this;

      manifests.forEach(function (manifest) {
        _classPrivateFieldGet(_this, _cacheMap)[manifest.name] = new Date().getTime();

        if (!_classPrivateFieldGet(_this, _cacheBundle).includes(manifest.name)) {
          _classPrivateFieldGet(_this, _cacheBundle).push(manifest.name);
        }
      });
    }
  }, {
    key: "addOrUpdate",
    value: function addOrUpdate(manifests) {
      this.setCacheMap(manifests);
    }
  }, {
    key: "removeCache",
    value: function removeCache(manifestNameList) {
      var _this2 = this;

      manifestNameList.forEach(function (name) {
        var index = _classPrivateFieldGet(_this2, _cacheBundle).findIndex(function (key) {
          return key === name;
        });

        if (index >= 0) {
          _classPrivateFieldGet(_this2, _cacheBundle).splice(index, 1);

          delete _classPrivateFieldGet(_this2, _cacheMap)[name];
        }
      });
    }
  }, {
    key: "isManifestTimeout",
    value: function isManifestTimeout(manifest) {
      if (_classPrivateFieldGet(this, _cacheBundle).includes(manifest.name)) {
        return Date.now() - _classPrivateFieldGet(this, _cacheMap)[manifest.name] >= (0, _config.cacheExpiration)();
      }

      return true;
    }
  }, {
    key: "toJson",
    value: function toJson() {
      return _classPrivateFieldGet(this, _cacheMap);
    }
  }, {
    key: "cacheBundle",
    get: function get() {
      return _classPrivateFieldGet(this, _cacheBundle);
    }
  }]);

  return BundleCache;
}();

exports.BundleCache = BundleCache;

BundleCache.fromManifests = function (manifests) {
  var bundleCache = new BundleCache({}, []);
  bundleCache.setCacheMap(manifests);
  return bundleCache;
};

BundleCache.isExisted = function (dir) {
  return _fs["default"].existsSync(_path["default"].join(cachePath(dir), 'bundle-cache.json'));
};

BundleCache.fromPath = function (dir) {
  function _(func, err) {
    try {
      return func();
    } catch (e) {
      if (err) {
        var error = err(e);
        if (error) throw error;
      }
    }
  }

  var cacheJsonDir = _path["default"].join(cachePath(dir), 'bundle-cache.json');

  var content = _(function () {
    return _fs["default"].readFileSync(cacheJsonDir);
  }, function (e) {
    return new Error((0, _i18n.getI18nMessage)('bundleCache.readJsonError', {
      url: cacheJsonDir,
      message: e.message
    }));
  });

  var json = _(function () {
    return JSON.parse(content);
  }, function (e) {
    return new Error((0, _i18n.getI18nMessage)('bundleCache.jsonParseError', {
      message: e.message
    }));
  });

  var keys = Object.keys(json);
  return new BundleCache(json, keys);
};

function cachePath(dir) {
  return _path["default"].join(dir, _constant.DEP_FOLDER_NAME, _constant.DOWNLOAD_TEMP_FOLDER);
}