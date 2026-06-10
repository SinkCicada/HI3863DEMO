"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _os = _interopRequireDefault(require("os"));

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

var _path = /*#__PURE__*/new WeakMap();

var _contentList = /*#__PURE__*/new WeakMap();

var _config = /*#__PURE__*/new WeakMap();

var RcParser = /*#__PURE__*/function () {
  function RcParser(filePath) {
    _classCallCheck(this, RcParser);

    _classPrivateFieldInitSpec(this, _path, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _contentList, {
      writable: true,
      value: []
    });

    _classPrivateFieldInitSpec(this, _config, {
      writable: true,
      value: {}
    });

    _classPrivateFieldSet(this, _path, filePath);
  }

  _createClass(RcParser, [{
    key: "parse",
    value: function parse() {
      var _this = this;

      if (!_fs["default"].existsSync(_classPrivateFieldGet(this, _path))) {
        throw (0, _i18n.getI18nMessage)('parser.noFile');
      }

      var content = _fs["default"].readFileSync(_classPrivateFieldGet(this, _path), 'utf-8');

      var lines = content.split(_os["default"].EOL);
      lines.forEach(function (line) {
        if (line.startsWith('#')) {
          _classPrivateFieldGet(_this, _contentList).push(line);
        } else {
          var index = line.indexOf('=');

          if (index >= 0) {
            var key = line.substr(0, index).trim();
            var value = line.substr(index + 1).trim();

            _classPrivateFieldGet(_this, _contentList).push(key);

            _classPrivateFieldGet(_this, _config)[key] = value;
          }
        }
      });
    }
  }, {
    key: "get",
    value: function get(key) {
      return _classPrivateFieldGet(this, _config)[key];
    }
  }, {
    key: "set",
    value: function set(key, value) {
      _classPrivateFieldGet(this, _config)[key] = value;

      if (!_classPrivateFieldGet(this, _contentList).includes(key)) {
        _classPrivateFieldGet(this, _contentList).push(key);
      }
    }
  }, {
    key: "delete",
    value: function _delete(key) {
      delete _classPrivateFieldGet(this, _config)[key];

      var index = _classPrivateFieldGet(this, _contentList).indexOf(key);

      if (index >= 0) {
        _classPrivateFieldGet(this, _contentList).splice(index, 1);
      }
    }
  }, {
    key: "setJson",
    value: function setJson(json) {
      var _this2 = this;

      if (!json) {
        throw (0, _i18n.getI18nMessage)('parser.invalidFormat');
      }

      Object.keys(json).forEach(function (key) {
        _this2.set(key, json[key]);
      });
    }
  }, {
    key: "toJson",
    value: function toJson() {
      return _classPrivateFieldGet(this, _config);
    }
  }, {
    key: "toString",
    value: function toString() {
      var _this3 = this;

      var content = _classPrivateFieldGet(this, _contentList).map(function (c) {
        if (!c.startsWith('#')) {
          if (_classPrivateFieldGet(_this3, _config)[c] !== undefined) {
            return "".concat(c, " = ").concat(_classPrivateFieldGet(_this3, _config)[c]);
          }

          return '';
        }

        return c;
      });

      return content.join(_os["default"].EOL);
    }
  }, {
    key: "save",
    value: function save() {
      _fs["default"].writeFileSync(_classPrivateFieldGet(this, _path), this.toString());
    }
  }]);

  return RcParser;
}();

exports["default"] = RcParser;

RcParser.fromJson = function (json, filePath) {
  var parser = new RcParser(filePath);
  parser.setJson(json);
  return parser;
};

RcParser.fromPath = function (filePath) {
  var parser = new RcParser(filePath);
  parser.parse();
  return parser;
};

RcParser.saveJsonToFile = function (json, filePath) {
  var parser = RcParser.fromJson(json, filePath);
  parser.save();
  return parser;
};