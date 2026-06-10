"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Bundle = void 0;
exports.checkRiskManifests = checkRiskManifests;
exports.execInstallHook = execInstallHook;
exports.getNameToBundle = getNameToBundle;

var _fs = _interopRequireDefault(require("fs"));

var _glob = _interopRequireDefault(require("glob"));

var _path2 = _interopRequireDefault(require("path"));

var _manifest2 = require("./manifest");

var _dependency = require("./dependency");

var _variable = require("./variable");

var _dependencyGraph = require("./dependency-graph");

var _repository = require("./repository");

var _bundleLock2 = require("./bundle-lock");

var _helpers = require("../utils/helpers");

var _constant = require("../constant/constant");

var _tar = _interopRequireDefault(require("tar"));

var _i18n = _interopRequireWildcard(require("../i18n"));

var _log = _interopRequireDefault(require("./log"));

var _axios = _interopRequireDefault(require("../utils/axios"));

var _config2 = require("../utils/config");

var _install2 = require("../commands/install");

var _bundleCache2 = require("./bundle-cache");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

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

var _manifest = /*#__PURE__*/new WeakMap();

var _manifests = /*#__PURE__*/new WeakMap();

var _vars = /*#__PURE__*/new WeakMap();

var _bundleLock = /*#__PURE__*/new WeakMap();

var _bundleCache = /*#__PURE__*/new WeakMap();

var Bundle = /*#__PURE__*/function () {
  function Bundle(bundlePath, manifest) {
    _classCallCheck(this, Bundle);

    _classPrivateFieldInitSpec(this, _path, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _manifest, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _manifests, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _vars, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _bundleLock, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _bundleCache, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldSet(this, _path, bundlePath);

    _classPrivateFieldSet(this, _manifest, manifest);

    var _tags = {};
    var _config = {};

    var _iterator = _createForOfIteratorHelper(this.dependencies),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var dependency = _step.value;

        if (dependency.tag) {
          _tags[dependency.tag] = (_tags[dependency.tag] ? _tags[dependency.tag] : []).concat([dependency.name]);
        }

        if (dependency.params) _config[dependency.name] = dependency.params;
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    this.dependencies.tags = _tags;
    this.dependencies.config = _config;
    _classPrivateFieldGet(this, _manifest).path = bundlePath;

    _classPrivateFieldSet(this, _vars, new _variable.Variable());

    if (_fs["default"].existsSync(_path2["default"].join(_classPrivateFieldGet(this, _path), 'bundle-lock.json'))) {
      _classPrivateFieldSet(this, _bundleLock, _bundleLock2.BundleLock.fromUrl(_classPrivateFieldGet(this, _path)));
    }

    if (_bundleCache2.BundleCache.isExisted(bundlePath)) {
      _classPrivateFieldSet(this, _bundleCache, _bundleCache2.BundleCache.fromPath(bundlePath));
    }
  }

  _createClass(Bundle, [{
    key: "vars",
    get: function get() {
      return _classPrivateFieldGet(this, _vars);
    }
  }, {
    key: "manifest",
    get: function get() {
      return _classPrivateFieldGet(this, _manifest);
    }
  }, {
    key: "name",
    get: function get() {
      return _classPrivateFieldGet(this, _manifest).name;
    }
  }, {
    key: "id",
    get: function get() {
      return this.manifest.id;
    }
  }, {
    key: "scripts",
    value: function scripts(name) {
      return _classPrivateFieldGet(this, _manifest).scripts(name);
    }
  }, {
    key: "dependencies",
    get: function get() {
      return _classPrivateFieldGet(this, _manifest).dependencies;
    }
  }, {
    key: "path",
    get: function get() {
      return _classPrivateFieldGet(this, _path);
    }
  }, {
    key: "binary",
    get: function get() {
      return _classPrivateFieldGet(this, _path);
    }
  }, {
    key: "lock",
    get: function get() {
      return _classPrivateFieldGet(this, _bundleLock);
    }
  }, {
    key: "copy",
    value: function copy() {
      var dirs = _classPrivateFieldGet(this, _manifest).dirs();

      var result = {};

      if (dirs) {
        Object.keys(dirs).forEach(function (key) {
          var pattern = dirs[key];

          if (typeof pattern === 'string' && pattern.startsWith('@')) {
            result[key] = pattern.substr(1);
          }
        });
      }

      return result;
    }
  }, {
    key: "link",
    value: function link() {
      var dirs = _classPrivateFieldGet(this, _manifest).dirs();

      var result = [];

      if (dirs) {
        Object.keys(dirs).forEach(function (key) {
          var pattern = dirs[key];

          if (typeof pattern === 'string' && pattern.startsWith('&')) {
            result.push({
              source: pattern.substring(1),
              target: key
            });
          }
        });
      }

      return result;
    }
  }, {
    key: "files",
    value: function files(dir) {
      var _this = this;

      var patterns = _classPrivateFieldGet(this, _manifest).dirs(dir);

      if (patterns) {
        return (Array.isArray(patterns) ? patterns : [patterns]).flatMap(function (pattern) {
          return _glob["default"].sync(_path2["default"].normalize("".concat(_classPrivateFieldGet(_this, _path), "/").concat(pattern)));
        });
      }

      return [];
    }
  }, {
    key: "copyReadme",
    value: function copyReadme() {
      var _this2 = this;

      var langToReadme = {
        en: "README.md",
        cn: "README_CN.md"
      };

      if (_classPrivateFieldGet(this, _manifest).readmePath) {
        var _loop = function _loop(lang) {
          var sourcePath = _path2["default"].join(_classPrivateFieldGet(_this2, _path), _classPrivateFieldGet(_this2, _manifest).readmePath[lang]);

          var destPath = _path2["default"].join(_classPrivateFieldGet(_this2, _path), langToReadme[lang] || "README.md");

          if (!_fs["default"].existsSync(destPath) && _fs["default"].existsSync(sourcePath)) {
            (0, _helpers.runShellCmd)(function (shell) {
              return shell.cp("-R", sourcePath, destPath);
            });
          }
        };

        for (var lang in _classPrivateFieldGet(this, _manifest).readmePath) {
          _loop(lang);
        }
      }
    }
  }, {
    key: "pack",
    value: function pack() {
      var _this3 = this;

      if (!_classPrivateFieldGet(this, _manifest).publishAs) {
        throw (0, _i18n.getI18nMessage)('bundle.missingPublishAs');
      }

      if (!_classPrivateFieldGet(this, _manifest).license.trim()) {
        throw (0, _i18n.getI18nMessage)('bundle.missingLicense');
      }

      var licensePath = _classPrivateFieldGet(this, _manifest).licensePath;

      var packConfig = getDefaultPackConfig(_classPrivateFieldGet(this, _path), licensePath);

      if (['source', 'distribution', 'binary', 'plugin', 'model', 'chip-definition'].some(this.isPublishAs.bind(this))) {
        var dirs = _classPrivateFieldGet(this, _manifest).dirs();

        if (dirs) {
          Object.keys(dirs).forEach(function (key) {
            if (typeof dirs[key] === 'string' && (dirs[key].startsWith('@') || dirs[key].startsWith('&'))) {
              return;
            }

            packConfig[key] = (packConfig[key] || []).concat(_this3.files(key));
          });
        }

        return packConfig;
      }

      return null; // code-segment
    }
  }, {
    key: "build",
    value: function () {
      var _build = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(repo) {
        var manifests, bundles, dirTemp, _iterator2, _step2, manifest, bundle;

        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.install(repo, false);

              case 2:
                manifests = _context.sent;
                manifests = this.resolveSnapshotManifest(manifests, repo, false, false);
                bundles = [];
                dirTemp = _path2["default"].resolve(_path2["default"].join(process.cwd(), _constant.DEP_FOLDER_NAME, _constant.DOWNLOAD_TEMP_FOLDER));
                (0, _repository.createDirIfNotExists)(dirTemp);
                _iterator2 = _createForOfIteratorHelper(manifests);
                _context.prev = 8;

                _iterator2.s();

              case 10:
                if ((_step2 = _iterator2.n()).done) {
                  _context.next = 18;
                  break;
                }

                manifest = _step2.value;
                _context.next = 14;
                return Bundle.mapManifestToBundle(manifest, dirTemp);

              case 14:
                bundle = _context.sent;
                bundles.push(bundle);

              case 16:
                _context.next = 10;
                break;

              case 18:
                _context.next = 23;
                break;

              case 20:
                _context.prev = 20;
                _context.t0 = _context["catch"](8);

                _iterator2.e(_context.t0);

              case 23:
                _context.prev = 23;

                _iterator2.f();

                return _context.finish(23);

              case 26:
                this.updateCacheJson(manifests);
                return _context.abrupt("return", _variable.Variable.compute(bundles));

              case 28:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[8, 20, 23, 26]]);
      }));

      function build(_x) {
        return _build.apply(this, arguments);
      }

      return build;
    }()
  }, {
    key: "isPublishAs",
    value: function isPublishAs(publishAs) {
      return this.manifest.publishAs === publishAs;
    }
  }, {
    key: "install",
    value: function () {
      var _install = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(repo, isGlobal) {
        var _yield$this$traverse, manifests, isFromBundleLock;

        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.traverse(repo, isGlobal);

              case 2:
                _yield$this$traverse = _context2.sent;
                manifests = _yield$this$traverse.manifests;
                isFromBundleLock = _yield$this$traverse.isFromBundleLock;

                if (!(!isFromBundleLock && !isGlobal)) {
                  _context2.next = 8;
                  break;
                }

                _context2.next = 8;
                return this.updateLockJsonForInstall(manifests);

              case 8:
                if ((0, _config2.ignoreLicenseCheck)()) {
                  _context2.next = 11;
                  break;
                }

                _context2.next = 11;
                return checkRiskManifests(manifests);

              case 11:
                _classPrivateFieldSet(this, _manifests, manifests);

                return _context2.abrupt("return", manifests);

              case 13:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function install(_x2, _x3) {
        return _install.apply(this, arguments);
      }

      return install;
    }()
  }, {
    key: "traverse",
    value: function () {
      var _traverse = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(repo) {
        var manifests, isFromBundleLock, manifestGraph, _manifestGraph;

        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                manifests = [];
                isFromBundleLock = false;

                if (!(_classPrivateFieldGet(this, _bundleLock) && _classPrivateFieldGet(this, _bundleLock).isCompatible(this.dependencies, repo.globalManifests().map(function (m) {
                  return m.name;
                })))) {
                  _context3.next = 10;
                  break;
                }

                _context3.next = 5;
                return _dependencyGraph.DependencyGraph.buildFromLock(this, _classPrivateFieldGet(this, _bundleLock), repo);

              case 5:
                manifestGraph = _context3.sent;
                manifests = manifestGraph.traverse();
                isFromBundleLock = true;
                _context3.next = 14;
                break;

              case 10:
                _context3.next = 12;
                return _dependencyGraph.DependencyGraph.build(this, repo);

              case 12:
                _manifestGraph = _context3.sent;
                manifests = _manifestGraph.traverse();

              case 14:
                return _context3.abrupt("return", {
                  manifests: manifests,
                  isFromBundleLock: isFromBundleLock
                });

              case 15:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function traverse(_x4) {
        return _traverse.apply(this, arguments);
      }

      return traverse;
    }()
  }, {
    key: "update",
    value: function () {
      var _update = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(repo) {
        var _this4 = this;

        var localManifests, globalManifests, manifestGraph, remoteManifests, needUpdate;
        return _regeneratorRuntime().wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                localManifests = repo.manifests();
                globalManifests = repo.globalManifests();
                _context4.next = 4;
                return _dependencyGraph.DependencyGraph.build(this, repo.remoteRepo);

              case 4:
                manifestGraph = _context4.sent;
                remoteManifests = manifestGraph.traverse();
                needUpdate = [];
                remoteManifests.forEach(function (remote) {
                  if (remote.name === _this4.manifest.name) {
                    return;
                  }

                  var local = localManifests.find(function (localManifest) {
                    return localManifest.name === remote.name;
                  });

                  if (local) {
                    if (local.version.version !== remote.version.version || local.isSnapshot()) {
                      remote.local = local.version.version;
                      remote.global = 'miss';
                      needUpdate.push(remote);
                    }
                  } else {
                    var global = globalManifests.find(function (m) {
                      return m.name === remote.name;
                    });

                    if (global) {
                      if (global.version.version !== remote.version.version) {
                        remote.local = 'miss';
                        remote.global = global.version.version;
                        needUpdate.push(remote);
                      }
                    } else {
                      remote.local = 'miss';
                      remote.global = 'miss';
                      needUpdate.push(remote);
                    }
                  }
                });
                return _context4.abrupt("return", needUpdate);

              case 9:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function update(_x5) {
        return _update.apply(this, arguments);
      }

      return update;
    }()
  }, {
    key: "resolveSnapshotManifest",
    value: function resolveSnapshotManifest(manifests, repo, isGlobal, isForce) {
      var _this5 = this;

      if (!_classPrivateFieldGet(this, _bundleCache)) {
        return manifests;
      }

      var snapShotManifests = [];
      var m = manifests.map(function (manifest) {
        if (!!manifest.url && manifest.isSnapshot()) {
          if (_classPrivateFieldGet(_this5, _bundleCache).isManifestTimeout(manifest) || isForce) {
            snapShotManifests.push(manifest);
          } else {
            manifest = _manifest2.Manifest.json(manifest.json());
          }

          var info = (0, _helpers.parseScopeName)(manifest.name);

          var folder = _path2["default"].join(repo.path, info.scope, info.name);

          if (_fs["default"].existsSync(_path2["default"].join(folder, 'bundle.json'))) {
            manifest.path = folder;
          }
        }

        return manifest;
      });
      repo.removeSnapshot(snapShotManifests, isGlobal);
      return m;
    }
  }, {
    key: "isDirectDep",
    value: function isDirectDep(depName) {
      return !!this.dependencies.find(function (dep) {
        return depName === dep.name;
      });
    }
  }, {
    key: "addDependencies",
    value: function addDependencies(dependencies, type) {
      _classPrivateFieldGet(this, _manifest).addDependencies(dependencies, type);
    }
  }, {
    key: "removeDependencies",
    value: function removeDependencies(names, type) {
      var _this6 = this;

      var baseName = names.find(function (name) {
        var bName = _this6.manifest.base && _this6.manifest.base.name;
        return bName === name;
      });

      if (baseName) {
        _classPrivateFieldGet(this, _manifest).removeBase({
          name: baseName
        });

        this.removeLocalBase();
      }

      _classPrivateFieldGet(this, _manifest).removeDependencies(names, type);
    }
  }, {
    key: "removeLocalBase",
    value: function removeLocalBase() {
      var jsonPath = _path2["default"].join(_classPrivateFieldGet(this, _path), 'bundle.json');

      if (_fs["default"].existsSync(jsonPath)) {
        var oldBundleJson = JSON.parse(_fs["default"].readFileSync(jsonPath));
        delete oldBundleJson.base;

        _fs["default"].writeFileSync(jsonPath, JSON.stringify(oldBundleJson, null, 4));
      }
    }
  }, {
    key: "updateDependencies",
    value: function updateDependencies(dependencies, type) {
      var _this7 = this;

      var newDependencies = [];
      var base = null;

      var _iterator3 = _createForOfIteratorHelper(dependencies),
          _step3;

      try {
        var _loop2 = function _loop2() {
          var dep = _step3.value;

          var manifest = _classPrivateFieldGet(_this7, _manifests).find(function (m) {
            return m.name === dep.name;
          });

          if (manifest) {
            var versionRanges = dep.versionRanges && dep.versionRanges !== '*' ? dep.versionRanges : "~".concat(manifest.version.version);

            if (manifest.publishAs === 'distribution') {
              base = {
                name: dep.name,
                version: versionRanges
              };
            } else {
              newDependencies.push(new _dependency.Dependency(dep.name, versionRanges));
            }
          }
        };

        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          _loop2();
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      if (base) {
        _classPrivateFieldGet(this, _manifest).updateBase(base);
      }

      if (newDependencies.length > 0) {
        _classPrivateFieldGet(this, _manifest).updateDependencies(newDependencies, type);
      }
    }
  }, {
    key: "updateBundleJson",
    value: function updateBundleJson() {
      var json = this.manifest.json();

      var jsonPath = _path2["default"].join(_classPrivateFieldGet(this, _path), 'bundle.json');

      var oldBundleJson = {};

      if (_fs["default"].existsSync(jsonPath)) {
        oldBundleJson = JSON.parse(_fs["default"].readFileSync(jsonPath));
      }

      _fs["default"].writeFileSync(jsonPath, JSON.stringify(_objectSpread(_objectSpread({}, oldBundleJson), json), null, 4));
    }
  }, {
    key: "updateLockJsonForInstall",
    value: function () {
      var _updateLockJsonForInstall = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(manifests) {
        var needUpdateManifests;
        return _regeneratorRuntime().wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (!_classPrivateFieldGet(this, _bundleLock)) {
                  _context5.next = 5;
                  break;
                }

                needUpdateManifests = manifests.filter(function (m) {
                  return !!m.url && !m.isSnapshot();
                });

                _classPrivateFieldGet(this, _bundleLock).addOrUpdate(needUpdateManifests);

                _context5.next = 12;
                break;

              case 5:
                _context5.t0 = _classPrivateFieldSet;
                _context5.t1 = this;
                _context5.t2 = _bundleLock;
                _context5.next = 10;
                return _bundleLock2.BundleLock.fromManifests(manifests);

              case 10:
                _context5.t3 = _context5.sent;
                (0, _context5.t0)(_context5.t1, _context5.t2, _context5.t3);

              case 12:
                if (_classPrivateFieldGet(this, _bundleLock)) {
                  _classPrivateFieldGet(this, _bundleLock).saveToFile(_classPrivateFieldGet(this, _path));
                }

              case 13:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function updateLockJsonForInstall(_x6) {
        return _updateLockJsonForInstall.apply(this, arguments);
      }

      return updateLockJsonForInstall;
    }()
  }, {
    key: "updateLockJsonForUnInstall",
    value: function updateLockJsonForUnInstall(manifestNameList) {
      if (_classPrivateFieldGet(this, _bundleLock)) {
        _classPrivateFieldGet(this, _bundleLock).remove(manifestNameList);

        _classPrivateFieldGet(this, _bundleLock).saveToFile(_classPrivateFieldGet(this, _path));
      }
    }
  }, {
    key: "updateCacheJson",
    value: function updateCacheJson(manifests) {
      var _this8 = this;

      var snapshotManifests = manifests.filter(function (manifest) {
        return manifest.isSnapshot() && manifest.name !== _this8.name;
      });

      if (_classPrivateFieldGet(this, _bundleCache)) {
        _classPrivateFieldGet(this, _bundleCache).addOrUpdate(snapshotManifests);
      } else {
        _classPrivateFieldSet(this, _bundleCache, _bundleCache2.BundleCache.fromManifests(snapshotManifests));
      }

      _classPrivateFieldGet(this, _bundleCache).saveToFile(_classPrivateFieldGet(this, _path));
    }
  }, {
    key: "updateCacheJsonForUninstall",
    value: function updateCacheJsonForUninstall(manifestNameList) {
      if (_classPrivateFieldGet(this, _bundleCache)) {
        _classPrivateFieldGet(this, _bundleCache).removeCache(manifestNameList);

        _classPrivateFieldGet(this, _bundleCache).saveToFile(_classPrivateFieldGet(this, _path));
      }
    }
  }]);

  return Bundle;
}();

exports.Bundle = Bundle;

Bundle.from = function (dir) {
  var manifest = _manifest2.Manifest.fromPath(dir);

  return new Bundle(dir, manifest);
};

Bundle.mapManifestToBundle = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(manifest, dirTemp) {
    var bundlePath, tarfile;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            bundlePath = manifest.path;

            if (!manifest.url) {
              _context6.next = 10;
              break;
            }

            tarfile = _path2["default"].resolve(dirTemp, "".concat(manifest.id, ".tgz"));
            _context6.next = 5;
            return (0, _repository.bundleDownload)(manifest, false);

          case 5:
            bundlePath = _context6.sent;
            manifest.path = bundlePath;

            _tar["default"].extract({
              file: tarfile,
              cwd: bundlePath,
              sync: true
            });

            (0, _helpers.runShellCmd)(function (shell) {
              return shell.rm(tarfile);
            });
            execInstallHook(manifest, false);

          case 10:
            return _context6.abrupt("return", Bundle.from(bundlePath));

          case 11:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function (_x7, _x8) {
    return _ref.apply(this, arguments);
  };
}();

function execInstallHook(manifest, isGlobal) {
  var installPath = isGlobal ? process.env.globalRepo : process.cwd();
  var dirPath = manifest.path;
  var installCmd = manifest.scripts(_constant.Hooks.install) || manifest.scripts(_constant.Hooks.afterInstall);
  var insteadOfHook = false;
  var isCodeSeg = manifest.publishAs === 'code-segment';
  var destPath = manifest.segment && manifest.segment.destPath;
  insteadOfHook = manifest.segment && manifest.segment.insteadOfHook; // 执行安装脚本

  if (installCmd && !insteadOfHook) {
    (0, _helpers.runCmdWithSpawnSync)(function (spawnSync) {
      return spawnSync(installCmd, {
        shell: process.env.shellPath,
        env: _variable.Variable.basicEnv(installPath),
        cwd: dirPath,
        stdio: 'inherit'
      });
    });
  } // code-segment类型bundle根据destPath还原路径（根据配置项restoreCodeSegment决定是否立即还原）


  if (isCodeSeg && (0, _config2.restoreCodeSegment)() && destPath) {
    var targetPath = _path2["default"].join(process.cwd(), destPath);

    var sourcePaths = (0, _install2.getSourcePaths)(dirPath);

    _i18n["default"].log('install.restoring', {
      name: manifest.name,
      path: targetPath,
      prefix: "...  "
    });

    (0, _helpers.runShellCmd)(function (shell) {
      return shell.mkdir('-p', targetPath);
    });
    (0, _helpers.runShellCmd)(function (shell) {
      return shell.cp('-R', sourcePaths, targetPath);
    });
  }
}

function getNameToBundle(bundles) {
  var result = new Map();

  var _iterator4 = _createForOfIteratorHelper(bundles),
      _step4;

  try {
    for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
      var bundle = _step4.value;
      result.set(bundle.name, bundle);
    }
  } catch (err) {
    _iterator4.e(err);
  } finally {
    _iterator4.f();
  }

  return result;
}

function getDefaultPackConfig(bundlePath) {
  var licensePath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
  var packConfig = {
    '.': []
  };

  _constant.autoPackFiles.forEach(function (_ref2) {
    var name = _ref2.name,
        required = _ref2.required;
    var filePath = "";

    if (name === "LICENSE" && licensePath) {
      filePath = _path2["default"].join(bundlePath, licensePath);
    } else {
      filePath = _path2["default"].join(bundlePath, name);
    }

    if (_fs["default"].existsSync(filePath)) {
      packConfig['.'].push(filePath);

      var stats = _fs["default"].statSync(filePath);

      if (stats.size === 0) {
        throw (0, _i18n.getI18nMessage)('bundle.fileShouldNotEmpty', {
          name: name
        });
      }
    } else if (required) {
      throw (0, _i18n.getI18nMessage)('bundle.fileRequired', {
        name: name
      });
    }
  });

  return packConfig;
}

function checkRiskManifests(_x9) {
  return _checkRiskManifests.apply(this, arguments);
}

function _checkRiskManifests() {
  _checkRiskManifests = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(manifests) {
    var otherManifests, licenses, response, riskManifests;
    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            if (manifests) {
              _context7.next = 2;
              break;
            }

            return _context7.abrupt("return");

          case 2:
            otherManifests = manifests.slice(0, manifests.length - 1); // 最后一个manifest为root manifest

            licenses = [];
            _context7.prev = 4;
            _context7.next = 7;
            return _axios["default"].get(_helpers.URL.licenses(""));

          case 7:
            response = _context7.sent;

            if (!(response && response.data && response.data.code === 200)) {
              _context7.next = 15;
              break;
            }

            licenses = response.data.data && response.data.data.license || [];
            riskManifests = otherManifests.filter(function (m) {
              var licenseName = m.license || '';
              var isMatch = false;
              licenses.forEach(function (licenseReg) {
                if (!isMatch) {
                  var reg = new RegExp(licenseReg, 'gi');
                  isMatch = reg.test(licenseName.trim());
                }
              });
              return !isMatch;
            });
            printRiskWarn(riskManifests);
            return _context7.abrupt("return", riskManifests);

          case 15:
            throw -1;

          case 16:
            _context7.next = 22;
            break;

          case 18:
            _context7.prev = 18;
            _context7.t0 = _context7["catch"](4);

            _log["default"].warnConsole((0, _i18n.getI18nMessage)('license.uncheck'));

            return _context7.abrupt("return", _context7.t0);

          case 22:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[4, 18]]);
  }));
  return _checkRiskManifests.apply(this, arguments);
}

function printRiskWarn(riskManifests) {
  riskManifests.forEach(function (rm) {
    _log["default"].warnConsole((0, _i18n.getI18nMessage)('license.warn', {
      bundleName: rm.name,
      license: rm.license || 'empty'
    }));
  });
}