"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Variable = void 0;

var _path = _interopRequireDefault(require("path"));

var _constant = require("../constant/constant");

var _helpers = require("../utils/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

var _vars = /*#__PURE__*/new WeakMap();

var Variable = /*#__PURE__*/function () {
  function Variable(vars) {
    _classCallCheck(this, Variable);

    _classPrivateFieldInitSpec(this, _vars, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldSet(this, _vars, _objectSpread({}, vars));
  }

  _createClass(Variable, [{
    key: "merge",
    value: function merge(vars) {
      _classPrivateFieldSet(this, _vars, _objectSpread(_objectSpread({}, vars), _classPrivateFieldGet(this, _vars)));
    }
  }, {
    key: "values",
    get: function get() {
      return _classPrivateFieldGet(this, _vars);
    }
  }, {
    key: "env",
    get: function get() {
      return mergeEnv(process.env, _classPrivateFieldGet(this, _vars));
    }
  }], [{
    key: "basicEnv",
    value: function basicEnv(bundlePath) {
      var solidEnvs = getSolidEnvs(bundlePath);
      return mergeEnv(process.env, solidEnvs);
    }
  }]);

  return Variable;
}();

exports.Variable = Variable;

Variable.compute = function () {
  var bundles = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  if (!bundles.length) {
    return;
  }

  var globalEnv = new Variable();
  var solidEnvs = getSolidEnvs(bundles[bundles.length - 1].path);
  var paths = {};
  var _tags = {};
  var _dependencies = {};
  var _config = {};

  function computeTags(bundle) {
    for (var _i = 0, _Object$keys = Object.keys(bundle.dependencies.tags); _i < _Object$keys.length; _i++) {
      var tag = _Object$keys[_i];
      if (!_tags[tag]) _tags[tag] = [];
      _tags[tag] = _tags[tag].concat(bundle.dependencies.tags[tag]);
    }
  }

  function computeConfig(bundle) {
    for (var _i2 = 0, _Object$keys2 = Object.keys(bundle.dependencies.config); _i2 < _Object$keys2.length; _i2++) {
      var b = _Object$keys2[_i2];
      // merge config
      if (!_config[b]) _config[b] = new Variable();

      _config[b].merge(bundle.dependencies.config[b]);
    }
  }

  function computeDependencies(bundle) {
    _dependencies[bundle.manifest.name] = bundle.dependencies.map(function (_) {
      return _.name;
    });
  }

  function computeGlobalEnvVariables(bundle) {
    globalEnv.merge(bundle.manifest.envs);
  }

  function computeBinaryPath(bundle) {
    if (bundle.binary) paths[bundle.manifest.name] = bundle.binary;
  }

  var _iterator = _createForOfIteratorHelper([].concat(bundles).reverse()),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var bundle = _step.value;
      computeGlobalEnvVariables(bundle);
      computeBinaryPath(bundle);
      computeDependencies(bundle);
      computeTags(bundle);
      computeConfig(bundle);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  var tagPaths = {};

  for (var _i3 = 0, _Object$keys3 = Object.keys(_tags); _i3 < _Object$keys3.length; _i3++) {
    var tag = _Object$keys3[_i3];
    tagPaths[tag] = _tags[tag].map(function (_) {
      return paths[_];
    }).join(' ');
  }

  var _iterator2 = _createForOfIteratorHelper(bundles),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var _bundle = _step2.value;

      _bundle.vars.merge(solidEnvs);

      _bundle.vars.merge(globalEnv.values);

      var dependencyPaths = {};

      var _iterator3 = _createForOfIteratorHelper(_dependencies[_bundle.manifest.name]),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var dependency = _step3.value;
          var parsed = (0, _helpers.parseScopeName)(dependency);
          var scopeKey = parsed.scope ? "_".concat(parsed.scope.substr(1).toUpperCase()) : '';
          dependencyPaths["DEP".concat(scopeKey, "_").concat(parsed.name)] = paths[dependency];
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      _bundle.vars.merge(dependencyPaths);

      _bundle.vars.merge(tagPaths);

      if (_config[_bundle.manifest.name]) _bundle.vars.merge(_config[_bundle.manifest.name].values);
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }

  var extendedDistEnvs = null;
  bundles.forEach(function (bundle) {
    if (bundle.isPublishAs('distribution')) {
      bundle.vars.merge(extendedDistEnvs);
      extendedDistEnvs = bundle.vars.values;
    }
  });
  return bundles;
};

function getSolidEnvs(bundlePath) {
  var envs = {};
  var index = bundlePath.indexOf(_constant.DEP_FOLDER_NAME);
  envs[_constant.DEP_OHOS_BUNDLES] = index >= 0 ? bundlePath.substr(0, index + _constant.DEP_FOLDER_NAME.length) : _path["default"].join(bundlePath, _constant.DEP_FOLDER_NAME);
  envs[_constant.DEP_BUNDLE_BASE] = index >= 0 ? bundlePath.substr(0, index) : bundlePath;
  return envs;
}

function mergeEnv(env1, env2) {
  var env = {};
  Object.keys(env1).forEach(function (key) {
    if (env1[key]) {
      env[key] = env1[key];
    }
  });
  Object.keys(env2).forEach(function (key) {
    if (env2[key]) {
      env[key] = env2[key];
    }
  });
  return env;
}