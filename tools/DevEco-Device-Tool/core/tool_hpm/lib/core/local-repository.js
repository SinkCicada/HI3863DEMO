"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LocalRepository = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path2 = _interopRequireDefault(require("path"));

var _glob = _interopRequireDefault(require("glob"));

var _semver = _interopRequireDefault(require("semver"));

var _manifest = require("./manifest");

var _helpers = require("../utils/helpers");

var _dependency = require("./dependency");

var _constant = require("../constant/constant");

var _i18n = require("../i18n");

var _log = _interopRequireDefault(require("./log"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

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

var _path = /*#__PURE__*/new WeakMap();

var _suspendPath = /*#__PURE__*/new WeakMap();

var _localmanifests = /*#__PURE__*/new WeakMap();

var LocalRepository = /*#__PURE__*/function () {
  function LocalRepository(repoPath) {
    _classCallCheck(this, LocalRepository);

    _classPrivateFieldInitSpec(this, _path, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _suspendPath, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _localmanifests, {
      writable: true,
      value: null
    });

    _classPrivateFieldSet(this, _path, repoPath);

    _classPrivateFieldSet(this, _suspendPath, _path2["default"].join(_classPrivateFieldGet(this, _path), _constant.SUSPEND_FOLDER));
  }

  _createClass(LocalRepository, [{
    key: "path",
    get: function get() {
      return _classPrivateFieldGet(this, _path);
    }
  }, {
    key: "manifests",
    value: function manifests(filter) {
      var _this = this;

      var manifests = [];

      if (_fs["default"].existsSync(_classPrivateFieldGet(this, _path))) {
        var files = [];

        var dirs = _fs["default"].readdirSync(_classPrivateFieldGet(this, _path));

        dirs.forEach(function (dir) {
          if (dir.startsWith('@')) {
            var subdirs = _fs["default"].readdirSync(_path2["default"].join(_classPrivateFieldGet(_this, _path), dir));

            if (filter) {
              subdirs = subdirs.filter(filter);
            }

            subdirs = subdirs.map(function (subdir) {
              return _path2["default"].join(dir, subdir);
            });
            files = files.concat(subdirs);
          } else {
            if (!_constant.BUILT_IN_OHOS_FOLDER.includes(dir)) {
              files.push(dir);
            }
          }
        });

        var _iterator = _createForOfIteratorHelper(files),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var file = _step.value;

            try {
              var jsonPath = _path2["default"].resolve(_path2["default"].join(_classPrivateFieldGet(this, _path), file, 'bundle.json'));

              if (_fs["default"].existsSync(jsonPath)) {
                var manifestJSON = JSON.parse(_fs["default"].readFileSync(jsonPath));

                var manifest = _manifest.Manifest.json(manifestJSON);

                manifest.path = _path2["default"].join(_classPrivateFieldGet(this, _path), manifest.name);
                manifests.push(manifest);
              }
            } catch (e) {
              _log["default"].debug(e);
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }

      _classPrivateFieldSet(this, _localmanifests, manifests);

      return manifests;
    }
  }, {
    key: "resolve",
    value: function resolve(manifest) {
      var result = [];

      var _iterator2 = _createForOfIteratorHelper(manifest.dependencies),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var dependency = _step2.value;
          var depManifest = this.manifest(dependency.name, dependency.versionRanges);

          if (!depManifest) {
            throw (0, _i18n.getI18nMessage)('dependencies.unResolved', {
              name: dependency.name,
              folderPath: _constant.DEP_FOLDER_NAME
            });
          }

          result.push(depManifest);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      return result;
    }
  }, {
    key: "manifest",
    value: function manifest(name, range) {
      var manifests = this.manifests();
      var dependency = new _dependency.Dependency(name, range);
      var found = manifests.filter(function (b) {
        return dependency.match(b);
      });

      if (found.length === 0) {
        return null;
      }

      return found.reduce(function (m, c) {
        return _semver["default"].lt(m.version, c.version) ? c : m;
      }, found[0]);
    }
  }, {
    key: "suspend",
    value: function suspend() {
      var _this2 = this;

      var manifestNames = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var localManifests = this.manifests();
      manifestNames.forEach(function (name) {
        var found = localManifests.find(function (lm) {
          return lm.name === name;
        });

        if (found) {
          var _parseScopeName = (0, _helpers.parseScopeName)(found.name),
              scope = _parseScopeName.scope,
              _name = _parseScopeName.name;

          var oldPath = _path2["default"].join(_classPrivateFieldGet(_this2, _path), scope, _name);

          var newPath = _path2["default"].join(_classPrivateFieldGet(_this2, _suspendPath), scope);

          if (!_fs["default"].existsSync(newPath)) {
            (0, _helpers.runShellCmd)(function (shell) {
              return shell.mkdir('-p', newPath);
            });
          }

          (0, _helpers.runShellCmd)(function (shell) {
            return shell.mv(oldPath, newPath);
          });
        }
      });
    }
  }, {
    key: "deleteSuspend",
    value: function deleteSuspend() {
      var _this3 = this;

      if (_fs["default"].existsSync(_classPrivateFieldGet(this, _suspendPath))) {
        (0, _helpers.runShellCmd)(function (shell) {
          return shell.rm('-rf', _classPrivateFieldGet(_this3, _suspendPath));
        });
      }
    }
  }, {
    key: "restoreSuspend",
    value: function restoreSuspend() {
      var _this4 = this;

      if (_fs["default"].existsSync(_classPrivateFieldGet(this, _suspendPath))) {
        var dirs = _fs["default"].readdirSync(_classPrivateFieldGet(this, _suspendPath));

        var _iterator3 = _createForOfIteratorHelper(dirs),
            _step3;

        try {
          var _loop = function _loop() {
            var dir = _step3.value;
            (0, _helpers.runShellCmd)(function (shell) {
              return shell.cp('-R', _path2["default"].join(_classPrivateFieldGet(_this4, _suspendPath), dir), _this4.path);
            });
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
    }
  }, {
    key: "remove",
    value: function remove(nameList) {
      var _this5 = this;

      if (_fs["default"].existsSync(this.path)) {
        var _iterator4 = _createForOfIteratorHelper(nameList),
            _step4;

        try {
          var _loop2 = function _loop2() {
            var name = _step4.value;
            var info = (0, _helpers.parseScopeName)(name);

            var folder = _path2["default"].join(_this5.path, info.scope, info.name);

            if (_fs["default"].existsSync(folder)) {
              (0, _helpers.runShellCmd)(function (shell) {
                return shell.rm('-rf', _path2["default"].join(_this5.path, name));
              });
            }
          };

          for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
            _loop2();
          }
        } catch (err) {
          _iterator4.e(err);
        } finally {
          _iterator4.f();
        }
      }
    }
  }]);

  return LocalRepository;
}();

exports.LocalRepository = LocalRepository;