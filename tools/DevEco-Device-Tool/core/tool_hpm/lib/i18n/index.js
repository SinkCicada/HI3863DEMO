"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
exports.getI18nMessage = getI18nMessage;
exports.getSupportLang = getSupportLang;

var _preference = _interopRequireDefault(require("../core/preference"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var supporttedLang = {
  en: "en",
  zh: "zh",
  "default": "en"
};
var additionResource = {};
var i18n = {
  log: function log(key, params) {
    var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
        _ref$silent = _ref.silent,
        silent = _ref$silent === void 0 ? false : _ref$silent;

    if (!silent) {
      var logMessage = parse(key, params);

      if (logMessage) {
        process.stdout.write("".concat(logMessage, "\n"));
      }
    }
  },
  addLocalization: function addLocalization(lang, resource, meta) {
    var supportLangs = getSupportLang();

    if (!supportLangs.includes(lang)) {
      throw getI18nMessage("lang.supportError", {
        supportLanguages: supportLangs.join('|')
      });
    }

    if (!meta || !meta.pluginName) {
      throw getI18nMessage("i18n.metaError");
    }

    additionResource[lang] = _objectSpread(_objectSpread({}, additionResource[lang]), {}, _defineProperty({}, meta.pluginName, resource));
  }
};

function parse(key, params) {
  var lang = _preference["default"].get('lang');

  var resource = getResource(lang);
  var keys = key.split('.');
  var res = resource;

  while (keys.length > 0 && res) {
    var shift = keys.shift();
    res = res[shift] || null;
  }

  if (typeof res === 'string' && params) {
    var message = parseMessage(res, params);
    return message;
  }

  return res || '';
}

function parseMessage(message, params) {
  var start = -1;
  var captures = [];

  for (var i = 0; i < message.length; i += 1) {
    var msg = message[i];
    var msgNext = message[i + 1];

    if (msg === '{' && msgNext && msgNext === '{') {
      start = i;
    }

    if (start >= 0 && msg === '}' && msgNext && msgNext === '}') {
      captures.push({
        start: start,
        end: i + 2,
        word: message.substr(start + 2, i - start - 2).trim()
      });
      start = -1;
    }
  }

  var result = message;

  for (var _i = captures.length - 1; _i >= 0; _i -= 1) {
    var capture = captures[_i];

    if (capture.word && params[capture.word] !== undefined && capture.start >= 0 && capture.end >= 0) {
      result = result.substr(0, capture.start) + params[capture.word] + result.substr(capture.end);
    }
  }

  return result;
}

function getResource(lang) {
  var defaultLang = supporttedLang[lang] || supporttedLang["default"];
  var defaultResource;

  if (defaultLang === supporttedLang.en) {
    defaultResource = require("./res/en")["default"];
  } else {
    defaultResource = require("./res/zh")["default"];
  }

  return _objectSpread(_objectSpread({}, additionResource[defaultLang]), defaultResource);
}

function getSupportLang() {
  return Object.keys(supporttedLang).filter(function (lang) {
    return lang !== 'default';
  });
}

function getI18nMessage(key, params) {
  return parse(key, params);
}

var _default = i18n;
exports["default"] = _default;