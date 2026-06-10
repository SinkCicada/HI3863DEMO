"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Dependency = void 0;

var _semver = _interopRequireDefault(require("semver"));

var _helpers = require("../utils/helpers");

var _i18n = require("../i18n");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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

var _name = /*#__PURE__*/new WeakMap();

var _versionRange = /*#__PURE__*/new WeakMap();

var _params = /*#__PURE__*/new WeakMap();

var _tag = /*#__PURE__*/new WeakMap();

var _isOptional = /*#__PURE__*/new WeakMap();

var Dependency = /*#__PURE__*/function () {
  function Dependency(name, options, tag, isOptional) {
    _classCallCheck(this, Dependency);

    _classPrivateFieldInitSpec(this, _name, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _versionRange, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _params, {
      writable: true,
      value: {}
    });

    _classPrivateFieldInitSpec(this, _tag, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _isOptional, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldSet(this, _name, name);

    _classPrivateFieldSet(this, _isOptional, isOptional);

    if ((0, _helpers.isObject)(options)) {
      _classPrivateFieldSet(this, _params, _objectSpread({}, options));

      _classPrivateFieldSet(this, _versionRange, _classPrivateFieldGet(this, _params).version);

      delete _classPrivateFieldGet(this, _params).version;
    } else if (_semver["default"].validRange(options)) {
      _classPrivateFieldSet(this, _versionRange, options);
    } else {
      throw (0, _i18n.getI18nMessage)('dependencies.invalidRange', {
        name: name
      });
    }

    _classPrivateFieldSet(this, _tag, tag);
  }

  _createClass(Dependency, [{
    key: "name",
    get: function get() {
      return _classPrivateFieldGet(this, _name);
    }
  }, {
    key: "versionRanges",
    get: function get() {
      return _classPrivateFieldGet(this, _versionRange);
    }
  }, {
    key: "isOptional",
    get: function get() {
      return _classPrivateFieldGet(this, _isOptional);
    }
  }, {
    key: "params",
    get: function get() {
      return _classPrivateFieldGet(this, _params);
    }
  }, {
    key: "tag",
    get: function get() {
      return _classPrivateFieldGet(this, _tag);
    }
  }, {
    key: "toJson",
    value: function toJson() {
      var json = {};
      var key = "".concat(_classPrivateFieldGet(this, _isOptional) ? '?' : '').concat(_classPrivateFieldGet(this, _name));
      var value = (0, _helpers.isEmptyObject)(_classPrivateFieldGet(this, _params)) ? _classPrivateFieldGet(this, _versionRange) : _objectSpread({
        version: _classPrivateFieldGet(this, _versionRange)
      }, _classPrivateFieldGet(this, _params));
      json[key] = value;

      if (_classPrivateFieldGet(this, _tag)) {
        json = _defineProperty({}, _classPrivateFieldGet(this, _tag), json);
      }

      return json;
    }
  }, {
    key: "match",
    value: function match(bundle) {
      if (bundle.manifest) {
        return _classPrivateFieldGet(this, _name) === bundle.manifest.name && _semver["default"].satisfies(bundle.manifest.version, _classPrivateFieldGet(this, _versionRange), {
          includePrerelease: true
        });
      }

      return _classPrivateFieldGet(this, _name) === bundle.name && _semver["default"].satisfies(bundle.version, _classPrivateFieldGet(this, _versionRange), {
        includePrerelease: true
      }) && !(0, _helpers.isSnapshot)(bundle.version.version);
    }
  }]);

  return Dependency;
}();

exports.Dependency = Dependency;

Dependency.merge = function (oldDep, newDep) {
  if (oldDep.name !== newDep.name) {
    return null;
  }

  var version = newDep.versionRanges || oldDep.versionRanges;
  var params = newDep.params || oldDep.params;
  var tag = newDep.tag || oldDep.tag;
  var isOptional = newDep.isOptional || oldDep.isOptional;
  return new Dependency(newDep.name, _objectSpread(_objectSpread({}, params), {}, {
    version: version
  }), tag, isOptional);
};