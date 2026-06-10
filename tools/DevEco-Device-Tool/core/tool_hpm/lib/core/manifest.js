"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Manifest = void 0;

var _semver = _interopRequireDefault(require("semver"));

var _path2 = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _url = _interopRequireDefault(require("url"));

var _helpers = require("../utils/helpers");

var _dependency = require("./dependency");

var _i18n = require("../i18n");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get"); return _classApplyDescriptorGet(receiver, descriptor); }

function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set"); _classApplyDescriptorSet(receiver, descriptor, value); return value; }

function _classExtractFieldDescriptor(receiver, privateMap, action) { if (!privateMap.has(receiver)) { throw new TypeError("attempted to " + action + " private field on non-instance"); } return privateMap.get(receiver); }

function _classApplyDescriptorSet(receiver, descriptor, value) { if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var Manifest = {
  Validator: /*#__PURE__*/function () {
    function Validator() {
      _classCallCheck(this, Validator);
    }

    _createClass(Validator, null, [{
      key: "name",
      value: function name(_name) {
        if (!_name) return (0, _i18n.getI18nMessage)('validate.nameIsNotNull');
        if ((0, _helpers.memorySizeOf)(_name) > 256) return (0, _i18n.getI18nMessage)('validate.nameLengthLess256');
        var info = (0, _helpers.parseScopeName)(_name);

        if (info.scope) {
          if (!/^@[0-9a-z_]+$/g.test(info.scope)) return (0, _i18n.getI18nMessage)('validate.nameContain');
          if (!/^@[0-9a-z]/g.test(info.scope)) return (0, _i18n.getI18nMessage)('validate.nameStartWith');
        }

        if (!/^[0-9a-z_]+$/g.test(info.name)) return (0, _i18n.getI18nMessage)('validate.nameContain');
        if (!/^[0-9a-z]/g.test(info.name)) return (0, _i18n.getI18nMessage)('validate.nameStartWith');
        return true;
      }
    }, {
      key: "version",
      value: function version(_version) {
        if (_version === null || _version === undefined) return (0, _i18n.getI18nMessage)('validate.versionIsNotNull');
        if (!_semver["default"].valid(_version)) return (0, _i18n.getI18nMessage)('validate.versionSemantic');
        if ((0, _helpers.memorySizeOf)(_version) > 64) return (0, _i18n.getI18nMessage)('validate.versionLengthLess64');
        return true;
      }
    }, {
      key: "nameVersion",
      value: function nameVersion(name, version) {
        if (name.length + version.length > 200) {
          return (0, _i18n.getI18nMessage)('validate.nameVersionLengthLess200');
        }

        return true;
      }
    }, {
      key: "publishAs",
      value: function publishAs(_publishAs) {
        var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
            permission = _ref.permission;

        if (['binary', 'chip-definition', 'code-segment', 'distribution', 'model', 'plugin', 'source', 'template'].indexOf(_publishAs) === -1) return (0, _i18n.getI18nMessage)('validate.publishAsType');

        if (_publishAs === 'chip-definition') {
          var isValid = Manifest.Validator.permission(permission);

          if (isValid !== true) {
            return isValid;
          }

          if (permission.authServer !== 'devicePartner') {
            return (0, _i18n.getI18nMessage)('validate.authServerIsFault');
          }
        }

        return true;
      }
    }, {
      key: "dirs",
      value: function dirs(_dirs) {
        if (_typeof(_dirs) !== 'object') return (0, _i18n.getI18nMessage)('validate.dirsInvalid');

        for (var dir in _dirs) {
          var pattern = _dirs[dir];

          if (typeof pattern === 'string' && pattern.startsWith('@')) {
            dir = dir.split(_path2["default"].sep).join('');
          }

          if (/[~'?()*]/.test(dir) || encodeURI(dir) !== dir) return (0, _i18n.getI18nMessage)('validate.dirNameInvalid', {
            dir: dir
          });
          if (typeof pattern !== 'string' && !Array.isArray(pattern)) return (0, _i18n.getI18nMessage)('validate.dirPatternInvalid', {
            dir: dir
          });
          if (Array.isArray(pattern) && pattern.find(function (p) {
            return typeof p !== 'string';
          })) return (0, _i18n.getI18nMessage)('validate.dirPatternInvalid', {
            dir: dir
          });
        }

        return true;
      }
    }, {
      key: "scripts",
      value: function scripts(_scripts) {
        if (_scripts === null || _scripts === undefined) return (0, _i18n.getI18nMessage)('validate.scriptIsNotNull');
        if (_typeof(_scripts) !== 'object') return (0, _i18n.getI18nMessage)('validate.scriptIsObject');
        return true;
      }
    }, {
      key: "dependencies",
      value: function dependencies(_dependencies) {
        if (_dependencies === null || _dependencies === undefined) return (0, _i18n.getI18nMessage)('validate.dependenciesIsNotNull');
        if (!(0, _helpers.isObject)(_dependencies)) return (0, _i18n.getI18nMessage)('validate.dependenciesIsObject');

        for (var bundle in _dependencies) {
          var normalized = normalizeDependencyName(bundle);
          if (normalized.isTag) return true;
          if (Manifest.Validator.name(normalized.name) !== true) return (0, _i18n.getI18nMessage)('validate.dependencyInvalid', {
            bundle: bundle
          });
          var version = (0, _helpers.isObject)(_dependencies[bundle]) ? _dependencies[bundle].version : _dependencies[bundle];
          if (!_semver["default"].validRange(version)) return (0, _i18n.getI18nMessage)('validate.dependencyInvalidRange', {
            bundle: bundle
          });
        }

        return true;
      }
    }, {
      key: "base",
      value: function base(_base) {
        if (_base === null || _base === undefined) return (0, _i18n.getI18nMessage)('validate.baseIsNotNull');
        if (!(0, _helpers.isObject)(_base)) return (0, _i18n.getI18nMessage)('validate.baseIsObject');
        if (Manifest.Validator.name(_base.name) !== true) return (0, _i18n.getI18nMessage)('validate.baseNameInvalid');
        if (!_semver["default"].validRange(_base.version)) return (0, _i18n.getI18nMessage)('validate.baseRangeInvalid');
        return true;
      }
    }, {
      key: "excludes",
      value: function excludes(_excludes) {
        if (!Array.isArray(_excludes)) return (0, _i18n.getI18nMessage)('validate.excludeNameArray');
        if (!_excludes.every(function (name) {
          return typeof name === 'string' && Manifest.Validator.name(name) === true;
        })) return (0, _i18n.getI18nMessage)('validate.excludeNameArray');
        return true;
      }
    }, {
      key: "envs",
      value: function envs(_envs) {
        if (!(0, _helpers.isObject)(_envs)) return (0, _i18n.getI18nMessage)('validate.envsIsObject');
        return true;
      }
    }, {
      key: "description",
      value: function description(_description) {
        if (typeof _description !== 'string') return (0, _i18n.getI18nMessage)('validate.descriptionIsString');
        if (_description.length > 500) return (0, _i18n.getI18nMessage)('validate.descriptionLengthLess500');
        return true;
      }
    }, {
      key: "rom",
      value: function rom(_rom) {
        if (typeof _rom === 'number') return true;

        if (typeof _rom === 'string') {
          if (_rom.match(/^\d{1,}(k|m|K|M|\d)$/)) {
            return true;
          }
        }

        return (0, _i18n.getI18nMessage)('validate.rom');
      }
    }, {
      key: "ram",
      value: function ram(_ram) {
        if (typeof _ram === 'number') return true;

        if (typeof _ram === 'string') {
          if (_ram.match(/^\d{1,}(k|m|K|M|\d)$/)) {
            return true;
          }
        }

        return (0, _i18n.getI18nMessage)('validate.ram');
      }
    }, {
      key: "ohos",
      value: function ohos(_ohos) {
        if (_typeof(_ohos) === 'object' && Object.keys(_ohos).includes('os') && Object.keys(_ohos).includes('board') && Object.keys(_ohos).includes('kernel')) {
          if (typeof _ohos.os !== 'string') {
            return (0, _i18n.getI18nMessage)('validate.osIsString');
          }

          if (typeof _ohos.board !== 'string') {
            return (0, _i18n.getI18nMessage)('validate.board');
          }

          if (typeof _ohos.kernel !== 'string') {
            return (0, _i18n.getI18nMessage)('validate.kernel');
          }

          return true;
        }

        return (0, _i18n.getI18nMessage)('validate.ohos');
      }
    }, {
      key: "author",
      value: function author(_author) {
        if (!_author) return (0, _i18n.getI18nMessage)('validate.authorIsNotNull');

        if (!(0, _helpers.isObject)(_author)) {
          return (0, _i18n.getI18nMessage)('validate.authorIsObject');
        }

        var validKeys = ['name', 'email', 'url', 'id'];

        for (var key in _author) {
          if (!validKeys.includes(key)) return (0, _i18n.getI18nMessage)('validate.author');
        }

        return true;
      }
    }, {
      key: "contributors",
      value: function contributors(_contributors) {
        if (!_contributors) return (0, _i18n.getI18nMessage)('validate.contributorsIsNotNull');

        if (!(_contributors instanceof Array) && !(0, _helpers.isObject)(_contributors)) {
          return (0, _i18n.getI18nMessage)('validate.contributorsIsArrayOrObject');
        }

        if (_contributors instanceof Array) {
          var validKeys = ['name', 'email', 'url'];

          var _iterator = _createForOfIteratorHelper(_contributors),
              _step;

          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var contributor = _step.value;
              if (!(0, _helpers.isObject)(contributor)) return (0, _i18n.getI18nMessage)('validate.contributorsContent');

              for (var key in contributor) {
                if (!validKeys.includes(key)) return (0, _i18n.getI18nMessage)('validate.contributorsContent');
              }
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
        }

        return true;
      }
    }, {
      key: "keywords",
      value: function keywords(_keywords) {
        if (!(_keywords instanceof Array)) return (0, _i18n.getI18nMessage)('validate.keywordsIsArray');
        if (_keywords.length > 20) return (0, _i18n.getI18nMessage)('validate.keywordsLengthLess20');
        if ((0, _helpers.memorySizeOf)(_keywords) > 255) return (0, _i18n.getI18nMessage)('validate.keywordsLengthLess255');

        var _iterator2 = _createForOfIteratorHelper(_keywords),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var word = _step2.value;
            if (typeof word !== 'string') return (0, _i18n.getI18nMessage)('validate.keywordIsString');
            if (!/^[0-9A-Za-z-\s]+$/g.test(word)) return (0, _i18n.getI18nMessage)('validate.keywordContent');
            if (word.length > 100) return (0, _i18n.getI18nMessage)('validate.lengthLess', {
              key: 'keyword',
              length: 100
            });
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }

        return true;
      }
    }, {
      key: "tags",
      value: function tags(_tags) {
        if (!(_tags instanceof Array)) return (0, _i18n.getI18nMessage)('validate.tagsIsArray');
        if ((0, _helpers.memorySizeOf)(_tags) > 128) return (0, _i18n.getI18nMessage)('validate.tagsLengthLess128');

        var _iterator3 = _createForOfIteratorHelper(_tags),
            _step3;

        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var tag = _step3.value;
            if (typeof tag !== 'string') return (0, _i18n.getI18nMessage)('validate.tagIsString');
            if (tag.length > 100) return (0, _i18n.getI18nMessage)('validate.lengthLess', {
              key: 'tag',
              length: 100
            });
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }

        return true;
      }
    }, {
      key: "homepage",
      value: function homepage(_homepage) {
        if (typeof _homepage !== 'string') return (0, _i18n.getI18nMessage)('validate.homepageIsString');
        if (!/^https?:\/\//.test(_homepage)) return (0, _i18n.getI18nMessage)('validate.homepageStartWith');
        return true;
      }
    }, {
      key: "repository",
      value: function repository(_repository) {
        if (typeof _repository !== 'string') return (0, _i18n.getI18nMessage)('validate.repositoryIsString');
        if (!/^https?:\/\//.test(_repository)) return (0, _i18n.getI18nMessage)('validate.repositoryStartWith');
        return true;
      }
    }, {
      key: "license",
      value: function license(_license) {
        if (typeof _license !== 'string') return (0, _i18n.getI18nMessage)('validate.licenseIsString');
        if ((0, _helpers.memorySizeOf)(_license) > 256) return (0, _i18n.getI18nMessage)('validate.licenseLengthLess256');
        return true;
      }
    }, {
      key: "noticeFile",
      value: function noticeFile(_noticeFile) {
        if (typeof _noticeFile !== 'string') return (0, _i18n.getI18nMessage)('validate.noticeFileIsString');
        if (_noticeFile.length > 100) return (0, _i18n.getI18nMessage)('validate.noticeFileLengthLess100');
        return true;
      }
    }, {
      key: "plugin",
      value: function plugin(_plugin) {
        return true;
      }
    }, {
      key: "isPrivate",
      value: function isPrivate(_isPrivate) {
        if (typeof _isPrivate !== 'boolean') return (0, _i18n.getI18nMessage)('validate.privateIsBoolean');
        return true;
      } //  增加segment字段的校验

    }, {
      key: "segment",
      value: function segment(_segment) {
        var keys = Object.keys(_segment);

        if (_typeof(_segment) === 'object' && keys.includes('destPath')) {
          if (keys.includes('insteadOfHook') && typeof _segment.insteadOfHook !== 'boolean') {
            return (0, _i18n.getI18nMessage)('validate.insteadOfHookIsBoolean');
          }

          if (typeof _segment.destPath !== 'string') {
            return (0, _i18n.getI18nMessage)('validate.destPathIsString');
          }

          return true;
        }

        return (0, _i18n.getI18nMessage)('validate.segmentContent');
      }
    }, {
      key: "permission",
      value: function permission(_permission) {
        if (_typeof(_permission) === 'object' && Object.keys(_permission).includes('authServer')) {
          if (typeof _permission.authServer !== 'string') {
            return (0, _i18n.getI18nMessage)('validate.authServerIsString');
          }

          return true;
        }

        return (0, _i18n.getI18nMessage)('validate.permission');
      }
    }, {
      key: "readmePath",
      value: function readmePath(_readmePath) {
        if (!(0, _helpers.isObject)(_readmePath)) {
          return (0, _i18n.getI18nMessage)('validate.readmePathIsObject');
        }

        return true;
      }
    }, {
      key: "licensePath",
      value: function licensePath(_licensePath) {
        if (typeof _licensePath !== "string") {
          return (0, _i18n.getI18nMessage)('validate.licensePathIsString');
        }

        return true;
      }
    }, {
      key: "chipDefinition",
      value: function chipDefinition(_chipDefinition) {
        if (_typeof(_chipDefinition) === 'object' && Object.keys(_chipDefinition).includes('baseInfo')) {
          var isValidBaseInfo = Manifest.Validator.baseInfo(_chipDefinition.baseInfo);

          if (isValidBaseInfo !== true) {
            return isValidBaseInfo;
          }

          return true;
        }

        return (0, _i18n.getI18nMessage)('validate.chipDefinition');
      }
    }, {
      key: "baseInfo",
      value: function baseInfo(_baseInfo) {
        if (!(0, _helpers.isObject)(_baseInfo)) {
          return (0, _i18n.getI18nMessage)('validate.baseInfo');
        }

        for (var key in _baseInfo) {
          if (typeof _baseInfo[key] !== 'string') return (0, _i18n.getI18nMessage)('validate.keyIsString', {
            key: key
          });
          var callBack = Manifest.Validator[key];

          if (callBack && typeof callBack === 'function') {
            var isValidKey = callBack(_baseInfo[key], _baseInfo);

            if (isValidKey !== true) {
              return isValidKey;
            }
          }
        }

        return true;
      }
    }, {
      key: "productName",
      value: function productName(_productName) {
        var length = 255;
        var key = 'productName';
        if (!/^[a-zA-Z]+/g.test(_productName)) return (0, _i18n.getI18nMessage)('validate.productNameStartWith');
        if (!/^[a-zA-Z_0-9]+$/g.test(_productName)) return (0, _i18n.getI18nMessage)('validate.productNameContain');
        if ((0, _helpers.memorySizeOf)(_productName) > length) return (0, _i18n.getI18nMessage)('validate.lengthLess', {
          key: key,
          length: length
        });
        return true;
      }
    }, {
      key: "productCompany",
      value: function productCompany(_productCompany) {
        var length = 200;
        var key = 'productCompany';
        if ((0, _helpers.memorySizeOf)(_productCompany) > length) return (0, _i18n.getI18nMessage)('validate.lengthLess', {
          key: key,
          length: length
        });
        return true;
      }
    }, {
      key: "boardName",
      value: function boardName(_boardName) {
        var length = 200;
        var key = 'boardName';
        if ((0, _helpers.memorySizeOf)(_boardName) > length) return (0, _i18n.getI18nMessage)('validate.lengthLess', {
          key: key,
          length: length
        });
        if (!/^[a-zA-Z0-9_.-]+$/g.test(_boardName)) return (0, _i18n.getI18nMessage)('validate.keyContain', {
          key: key
        });
        return true;
      }
    }, {
      key: "boardCompany",
      value: function boardCompany(_boardCompany) {
        var length = 200;
        var key = 'boardCompany';
        if ((0, _helpers.memorySizeOf)(_boardCompany) > length) return (0, _i18n.getI18nMessage)('validate.lengthLess', {
          key: key,
          length: length
        });
        return true;
      }
    }, {
      key: "socName",
      value: function socName(_socName) {
        var length = 200;
        var key = 'socName';
        if ((0, _helpers.memorySizeOf)(_socName) > length) return (0, _i18n.getI18nMessage)('validate.lengthLess', {
          key: key,
          length: length
        });
        if (!/^[a-zA-Z0-9_.-]+$/g.test(_socName)) return (0, _i18n.getI18nMessage)('validate.keyContain', {
          key: key
        });
        return true;
      }
    }, {
      key: "socCompany",
      value: function socCompany(_socCompany) {
        var length = 200;
        var key = 'socCompany';
        if ((0, _helpers.memorySizeOf)(_socCompany) > length) return (0, _i18n.getI18nMessage)('validate.lengthLess', {
          key: key,
          length: length
        });
        return true;
      }
    }, {
      key: "chipType",
      value: function chipType(_chipType) {
        var length = 32;
        var key = 'chipType';
        if ((0, _helpers.memorySizeOf)(_chipType) > length) return (0, _i18n.getI18nMessage)('validate.lengthLess', {
          key: key,
          length: length
        });
        return true;
      }
    }, {
      key: "cpuArc",
      value: function cpuArc(_cpuArc) {
        var length = 32;
        var key = 'cpuArc';
        if ((0, _helpers.memorySizeOf)(_cpuArc) > length) return (0, _i18n.getI18nMessage)('validate.lengthLess', {
          key: key,
          length: length
        });
        return true;
      }
    }, {
      key: "ohosVersion",
      value: function ohosVersion(_ohosVersion) {
        var length = 64;
        var key = 'ohosVersion';
        if ((0, _helpers.memorySizeOf)(_ohosVersion) > length) return (0, _i18n.getI18nMessage)('validate.lengthLess', {
          key: key,
          length: length
        });
        return true;
      }
    }, {
      key: "systemType",
      value: function systemType(_systemType) {
        var length = 32;
        var key = 'systemType';
        if ((0, _helpers.memorySizeOf)(_systemType) > length) return (0, _i18n.getI18nMessage)('validate.lengthLess', {
          key: key,
          length: length
        });
        return true;
      }
    }, {
      key: "kernel",
      value: function kernel(_kernel) {
        var length = 64;
        var key = 'kernel';
        if ((0, _helpers.memorySizeOf)(_kernel) > length) return (0, _i18n.getI18nMessage)('validate.lengthLess', {
          key: key,
          length: length
        });
        return true;
      }
    }, {
      key: "kernelVersion",
      value: function kernelVersion(_kernelVersion) {
        var length = 64;
        var key = 'kernelVersion';
        if ((0, _helpers.memorySizeOf)(_kernelVersion) > length) return (0, _i18n.getI18nMessage)('validate.lengthLess', {
          key: key,
          length: length
        });
        return true;
      }
    }, {
      key: "communicationType",
      value: function communicationType(_communicationType) {
        var length = 32;
        var key = 'communicationType';
        if ((0, _helpers.memorySizeOf)(_communicationType) > length) return (0, _i18n.getI18nMessage)('validate.lengthLess', {
          key: key,
          length: length
        });
        return true;
      }
    }]);

    return Validator;
  }(),
  json: function json(_json, options) {
    var bundleName = _json.name;

    function _(name, validator, filter) {
      var result = validator(_json[name], _json);
      if (typeof result !== 'boolean') throw (0, _i18n.getI18nMessage)('manifest.error', {
        name: bundleName,
        message: result
      });
      return filter ? filter(_json[name]) : _json[name];
    }

    var manifest = {
      name: _('name', Manifest.Validator.name),
      version: _('version', Manifest.Validator.version, function (v) {
        return _semver["default"].parse(v);
      })
    };
    var nameVersionResult = Manifest.Validator.nameVersion(_json.name, _json.version);

    if (nameVersionResult !== true) {
      throw nameVersionResult;
    }

    if (_json.publishAs) manifest.publishAs = _('publishAs', Manifest.Validator.publishAs);
    if (_json.dirs && !Array.isArray(_json.dirs)) manifest.dirs = _('dirs', Manifest.Validator.dirs);
    if (_json.scripts) manifest.scripts = _('scripts', Manifest.Validator.scripts);
    if (_json.dependencies) manifest.dependencies = _('dependencies', Manifest.Validator.dependencies);
    if (_json.devDependencies) manifest.devDependencies = _('devDependencies', Manifest.Validator.dependencies);
    if (_json.base) manifest.base = _('base', Manifest.Validator.base);
    if (_json.excludes) manifest.excludes = _('excludes', Manifest.Validator.excludes);
    if (_json.envs && !Array.isArray(_json.envs)) manifest.envs = _('envs', Manifest.Validator.envs);
    if (_json.description) manifest.description = _('description', Manifest.Validator.description);
    if (_json.rom) manifest.rom = _('rom', Manifest.Validator.rom);
    if (_json.ram) manifest.ram = _('ram', Manifest.Validator.ram);
    if (_json.ohos) manifest.ohos = _('ohos', Manifest.Validator.ohos);
    if (_json.author) manifest.author = _('author', Manifest.Validator.author);
    if (_json.contributors) manifest.contributors = _('contributors', Manifest.Validator.contributors);
    if (_json.keywords) manifest.keywords = _('keywords', Manifest.Validator.keywords);
    if (_json.tags) manifest.tags = _('tags', Manifest.Validator.tags);
    if (_json.homepage) manifest.homepage = _('homepage', Manifest.Validator.homepage);
    if (_json.repository) manifest.repository = _('repository', Manifest.Validator.repository);
    if (_json.license) manifest.license = _('license', Manifest.Validator.license);
    if (_json.noticeFile) manifest.noticeFile = _('noticeFile', Manifest.Validator.noticeFile);
    if (_json.plugin) manifest.plugin = _('plugin', Manifest.Validator.plugin);
    if (_json["private"] !== undefined) manifest["private"] = _('private', Manifest.Validator.isPrivate);
    if (_json.segment) manifest.segment = _('segment', Manifest.Validator.segment); // 增加segment字段

    if (_json.permission) manifest.permission = _('permission', Manifest.Validator.permission); // 增加permission字段

    if (_json.readmePath) manifest.readmePath = _('readmePath', Manifest.Validator.readmePath); // 增加readmePath字段

    if (_json.licensePath) manifest.licensePath = _('licensePath', Manifest.Validator.licensePath); // 增加licensePath字段

    if (_json.chipDefinition) manifest.chipDefinition = _('chipDefinition', Manifest.Validator.chipDefinition); // 增加licensePath字段

    return new BundleManifest(manifest, options);
  },
  fromPath: function fromPath(dir) {
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

    var content = _(function () {
      return _fs["default"].readFileSync(_path2["default"].join(dir, 'bundle.json'));
    }, function (e) {
      return (0, _i18n.getI18nMessage)('manifest.readJsonError', {
        dir: dir,
        message: e.message
      });
    });

    var json = _(function () {
      return JSON.parse(content);
    }, function (e) {
      return (0, _i18n.getI18nMessage)('manifest.malformedJsonError', {
        message: e.message
      });
    });

    var manifest = _(function () {
      return Manifest.json(json);
    }, function (e) {
      return (0, _i18n.getI18nMessage)('manifest.illegalJsonError', {
        error: e
      });
    });

    return manifest;
  }
};
exports.Manifest = Manifest;

var _manifest = /*#__PURE__*/new WeakMap();

var _path = /*#__PURE__*/new WeakMap();

var _dependencies2 = /*#__PURE__*/new WeakMap();

var _devDependencies = /*#__PURE__*/new WeakMap();

var _download = /*#__PURE__*/new WeakMap();

var BundleManifest = /*#__PURE__*/function () {
  function BundleManifest(manifest) {
    var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        download = _ref2.download;

    _classCallCheck(this, BundleManifest);

    _classPrivateFieldInitSpec(this, _manifest, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _path, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _dependencies2, {
      writable: true,
      value: []
    });

    _classPrivateFieldInitSpec(this, _devDependencies, {
      writable: true,
      value: []
    });

    _classPrivateFieldInitSpec(this, _download, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldSet(this, _manifest, manifest);

    _classPrivateFieldSet(this, _download, download);

    if (manifest.dependencies) {
      _classPrivateFieldSet(this, _dependencies2, _classPrivateFieldGet(this, _dependencies2).concat(parseDependencies(manifest.dependencies)));
    }

    if (manifest.devDependencies) {
      _classPrivateFieldSet(this, _devDependencies, _classPrivateFieldGet(this, _devDependencies).concat(parseDependencies(manifest.devDependencies)));
    }

    if (manifest.base) {
      _classPrivateFieldGet(this, _dependencies2).push(new _dependency.Dependency(manifest.base.name, {
        version: manifest.base.version
      }));
    }
  }

  _createClass(BundleManifest, [{
    key: "name",
    get: function get() {
      return _classPrivateFieldGet(this, _manifest).name;
    }
  }, {
    key: "id",
    get: function get() {
      var info = (0, _helpers.parseScopeName)(_classPrivateFieldGet(this, _manifest).name);
      return "".concat(info.scope ? "".concat(info.scope, "-") : '').concat(info.name, "-").concat(_classPrivateFieldGet(this, _manifest).version.version);
    }
  }, {
    key: "version",
    get: function get() {
      return _classPrivateFieldGet(this, _manifest).version;
    }
  }, {
    key: "publishAs",
    get: function get() {
      return _classPrivateFieldGet(this, _manifest).publishAs;
    }
  }, {
    key: "dependencies",
    get: function get() {
      return _classPrivateFieldGet(this, _dependencies2);
    }
  }, {
    key: "devDependencies",
    get: function get() {
      return _classPrivateFieldGet(this, _devDependencies);
    }
  }, {
    key: "base",
    get: function get() {
      return _classPrivateFieldGet(this, _manifest).base;
    }
  }, {
    key: "excludes",
    get: function get() {
      return _classPrivateFieldGet(this, _manifest).excludes;
    }
  }, {
    key: "envs",
    get: function get() {
      return _classPrivateFieldGet(this, _manifest).envs;
    }
  }, {
    key: "isRemote",
    get: function get() {
      return !!isRemote;
    }
  }, {
    key: "isPrivate",
    get: function get() {
      return _classPrivateFieldGet(this, _manifest)["private"];
    }
  }, {
    key: "url",
    get: function get() {
      if (_classPrivateFieldGet(this, _download)) {
        if (this.isPrivate) {
          var parseAddr = _url["default"].parse(_classPrivateFieldGet(this, _download).addr);

          if (parseAddr.protocol) {
            return "".concat(_classPrivateFieldGet(this, _download).addr);
          } else {
            return "".concat((0, _helpers.getRegistryHost)(_classPrivateFieldGet(this, _manifest).name)).concat(_classPrivateFieldGet(this, _download).addr);
          }
        }

        return _classPrivateFieldGet(this, _download).addr;
      }

      return '';
    }
  }, {
    key: "checksum",
    get: function get() {
      return _classPrivateFieldGet(this, _download) && _classPrivateFieldGet(this, _download).checksum;
    }
  }, {
    key: "noticeFile",
    get: function get() {
      return _classPrivateFieldGet(this, _manifest).noticeFile || 'NOTICE';
    }
  }, {
    key: "license",
    get: function get() {
      return _classPrivateFieldGet(this, _manifest).license || '';
    }
  }, {
    key: "path",
    get: function get() {
      return _classPrivateFieldGet(this, _path);
    },
    set: function set(manifestPath) {
      _classPrivateFieldSet(this, _path, manifestPath);
    } //  增加segment字段

  }, {
    key: "plugin",
    get: function get() {
      return _classPrivateFieldGet(this, _manifest).plugin;
    }
  }, {
    key: "segment",
    get: function get() {
      return _classPrivateFieldGet(this, _manifest).segment;
    }
  }, {
    key: "chipDefinition",
    get: function get() {
      return _classPrivateFieldGet(this, _manifest).chipDefinition;
    }
  }, {
    key: "readmePath",
    get: function get() {
      return _classPrivateFieldGet(this, _manifest).readmePath;
    }
  }, {
    key: "licensePath",
    get: function get() {
      return _classPrivateFieldGet(this, _manifest).licensePath;
    }
  }, {
    key: "isSnapshot",
    value: function isSnapshot() {
      var prereleaseList = _semver["default"].prerelease(_classPrivateFieldGet(this, _manifest).version);

      return !!(prereleaseList && prereleaseList.length && prereleaseList[0].toString().toUpperCase() === "SNAPSHOT");
    }
  }, {
    key: "dirs",
    value: function dirs(name) {
      if (name) {
        return _classPrivateFieldGet(this, _manifest).dirs && _classPrivateFieldGet(this, _manifest).dirs[name];
      }

      return _classPrivateFieldGet(this, _manifest).dirs;
    }
  }, {
    key: "scripts",
    value: function scripts(name) {
      return _classPrivateFieldGet(this, _manifest).scripts && _classPrivateFieldGet(this, _manifest).scripts[name];
    }
  }, {
    key: "json",
    value: function json() {
      var innerUse = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      var baseName = _classPrivateFieldGet(this, _manifest).base && _classPrivateFieldGet(this, _manifest).base.name;

      var dependenciesJson = {};

      var _iterator4 = _createForOfIteratorHelper(this.dependencies),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var dep = _step4.value;

          if (dep.name !== baseName) {
            dependenciesJson = Object.assign(dependenciesJson, dep.toJson());
          }
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }

      var devDependenciesJson = {};

      var _iterator5 = _createForOfIteratorHelper(this.devDependencies),
          _step5;

      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var _dep = _step5.value;

          if (_dep.name !== baseName) {
            devDependenciesJson = Object.assign(devDependenciesJson, _dep.toJson());
          }
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }

      var json = _objectSpread(_objectSpread({}, _classPrivateFieldGet(this, _manifest)), {}, {
        version: _classPrivateFieldGet(this, _manifest).version.version
      });

      json.dependencies = (0, _helpers.isEmptyObject)(dependenciesJson) ? undefined : dependenciesJson;
      json.devDependencies = (0, _helpers.isEmptyObject)(devDependenciesJson) ? undefined : devDependenciesJson; // 如果download的时候需要用到别的字段，需要在此处补充！因为传给子线程的是这个JSON而不是原生的BundleManifest对象

      json.name = this.name;
      json.url = this.url;
      json.checksum = this.checksum;

      if (innerUse) {
        json.id = this.id;
        json.scripts = _classPrivateFieldGet(this, _manifest).scripts || {};
      }

      return json;
    }
  }, {
    key: "addDependencies",
    value: function addDependencies() {
      var dependencies = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var type = arguments.length > 1 ? arguments[1] : undefined;
      this.updateDependencies(dependencies, type);
    }
  }, {
    key: "updateDependencies",
    value: function updateDependencies() {
      var dependencies = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var type = arguments.length > 1 ? arguments[1] : undefined;

      if (dependencies.length > 0) {
        if (type === 'dev') {
          _classPrivateFieldSet(this, _devDependencies, mergeDependencies(_classPrivateFieldGet(this, _devDependencies), dependencies));
        } else {
          _classPrivateFieldSet(this, _dependencies2, mergeDependencies(_classPrivateFieldGet(this, _dependencies2), dependencies));
        }
      }
    }
  }, {
    key: "removeDependencies",
    value: function removeDependencies() {
      var names = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var type = arguments.length > 1 ? arguments[1] : undefined;

      if (names.length === 0) {
        return;
      }

      var dependencies = type === 'dev' ? _classPrivateFieldGet(this, _devDependencies) : _classPrivateFieldGet(this, _dependencies2);

      var _iterator6 = _createForOfIteratorHelper(names),
          _step6;

      try {
        var _loop = function _loop() {
          var name = _step6.value;
          var index = dependencies.findIndex(function (d) {
            return d.name === name;
          });

          if (index >= 0) {
            dependencies.splice(index, 1);
          }
        };

        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          _loop();
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }
    }
  }, {
    key: "removeBase",
    value: function removeBase(base) {
      if (_classPrivateFieldGet(this, _manifest).base && base && _classPrivateFieldGet(this, _manifest).base.name === base.name) {
        delete _classPrivateFieldGet(this, _manifest).base;
      }
    }
  }, {
    key: "updateBase",
    value: function updateBase(base) {
      _classPrivateFieldGet(this, _manifest).base = base;
    }
  }, {
    key: "getCompositeDependencies",
    value: function getCompositeDependencies(rootManifest) {
      // 1. 依赖包的devDependencies不会被安装
      // 2. 所有的distribution的devDependencies都会被安装
      if (this.name === (rootManifest && rootManifest.name) || this.publishAs === 'distribution') {
        return this.dependencies.concat(this.devDependencies);
      }

      return this.dependencies;
    }
  }]);

  return BundleManifest;
}();

function parseDependencies(dependencies) {
  var result = [];

  var _loop2 = function _loop2(name) {
    var normalized = normalizeDependencyName(name);

    if (normalized.isTag) {
      Object.keys(dependencies[name]).forEach(function (key) {
        return result.push(new _dependency.Dependency(key, dependencies[name][key], name));
      });
    } else {
      result.push(new _dependency.Dependency(normalized.name, dependencies[name], undefined, normalized.isOptional));
    }
  };

  for (var name in dependencies) {
    _loop2(name);
  }

  return result;
}

function mergeDependencies(oldDeps, newDeps) {
  var merged = _toConsumableArray(oldDeps);

  var _iterator7 = _createForOfIteratorHelper(newDeps),
      _step7;

  try {
    var _loop3 = function _loop3() {
      var dep = _step7.value;
      var index = merged.findIndex(function (d) {
        return d.name === dep.name;
      });

      if (index >= 0) {
        merged[index] = _dependency.Dependency.merge(merged[index], dep);
      } else {
        merged.push(dep);
      }
    };

    for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
      _loop3();
    }
  } catch (err) {
    _iterator7.e(err);
  } finally {
    _iterator7.f();
  }

  return merged;
}

function normalizeDependencyName(name) {
  if (name.match(/^#/)) {
    return {
      isTag: true,
      name: name
    };
  }

  var matchOptional = name.match(/^\?([\S\s]*)/);

  if (matchOptional) {
    return {
      isOptional: true,
      name: matchOptional[1]
    };
  }

  return {
    name: name
  };
}