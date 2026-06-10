"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
exports.isPlugin = isPlugin;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _constant = require("../constant/constant");

var _bundle = require("../core/bundle");

var _helpers = require("../utils/helpers");

var _manifest = require("../core/manifest");

var _repository = require("../core/repository");

var _config = require("../utils/config");

var _register = require("./register");

var _commands = require("../commands");

var _events = require("../utils/events");

var _axios = _interopRequireDefault(require("../utils/axios"));

var _rcParser = _interopRequireDefault(require("../core/rc-parser"));

var _preference = _interopRequireDefault(require("../core/preference"));

var _shelljs = _interopRequireDefault(require("shelljs"));

var _semver = _interopRequireDefault(require("semver"));

var _i18n = _interopRequireWildcard(require("../i18n"));

var _dependency = require("../core/dependency");

var _i18nAPI = _interopRequireDefault(require("./i18nAPI"));

var _log = _interopRequireDefault(require("../core/log"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

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

var compressingApi = require('compressing');

var _cmdPlugins = /*#__PURE__*/new WeakMap();

var _hooks = /*#__PURE__*/new WeakMap();

var _cwd = /*#__PURE__*/new WeakMap();

var _runAction = /*#__PURE__*/new WeakMap();

var _program = /*#__PURE__*/new WeakMap();

var _defaultCommands = /*#__PURE__*/new WeakMap();

var PluginAPI = /*#__PURE__*/function () {
  function PluginAPI(cwd, runAction, program) {
    _classCallCheck(this, PluginAPI);

    _classPrivateFieldInitSpec(this, _cmdPlugins, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _hooks, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _cwd, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _runAction, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _program, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _defaultCommands, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldSet(this, _cmdPlugins, {});

    _classPrivateFieldSet(this, _hooks, {});

    _classPrivateFieldSet(this, _cwd, cwd);

    _classPrivateFieldSet(this, _program, program);

    _classPrivateFieldSet(this, _runAction, runAction);

    _classPrivateFieldSet(this, _defaultCommands, _toConsumableArray(program.commands));
  }

  _createClass(PluginAPI, [{
    key: "registerPlugins",
    value: function registerPlugins() {
      var api = this;

      var _classPrivateFieldGet2 = _classPrivateFieldGet(this, _program),
          program = _classPrivateFieldGet2.program;

      program.commands = _classPrivateFieldGet(this, _defaultCommands);
      (0, _register.resolveNpmPlugins)(api);
      (0, _register.resolveCmdPlugins)(api);
      var plugins = api.getCmdPlugins();
      Object.keys(plugins).forEach(function (name) {
        var plugin = plugins[name];

        if (plugin.action) {
          var allNames = program.commands.map(function (c) {
            return c.name();
          });

          if (allNames.includes(name)) {
            console.log((0, _i18n.getI18nMessage)('plugin.registerCmdError', {
              name: name
            }));
          } else {
            var command = program.command(name).action(function () {
              for (var _len = arguments.length, argsWithCommander = new Array(_len), _key = 0; _key < _len; _key++) {
                argsWithCommander[_key] = arguments[_key];
              }

              var commanderArg = argsWithCommander.find(function (argWithCommander) {
                return argWithCommander && typeof argWithCommander.opts === 'function';
              });
              plugin.action(commanderArg.opts(), commanderArg.args);
            });

            var _ref = plugin.options || {},
                description = _ref.description,
                options = _ref.options,
                args = _ref.args;

            if (description) {
              command.description(description);
            }

            if (options) {
              Object.keys(options).forEach(function (key) {
                command.option(key, options[key]);
              });
            }

            if (args) {
              command.arguments(args);
            }
          }
        }
      });
      (0, _register.registerPluginHooks)(api);
    }
  }, {
    key: "eventTypes",
    get: function get() {
      return _events.EventTypes;
    }
  }, {
    key: "i18n",
    get: function get() {
      return _i18nAPI["default"];
    }
  }, {
    key: "shelljs",
    get: function get() {
      return _shelljs["default"];
    }
  }, {
    key: "compressing",
    get: function get() {
      return compressingApi;
    }
  }, {
    key: "_bundle",
    get: function get() {
      this.cwdCheck();

      var jsonFile = _path["default"].join(this.cwd(), 'bundle.json');

      if (_fs["default"].existsSync(jsonFile)) {
        return _bundle.Bundle.from(this.cwd());
      }

      return null;
    }
  }, {
    key: "_repo",
    get: function get() {
      this.cwdCheck();
      return new _repository.Repository(_path["default"].join(this.cwd(), _constant.DEP_FOLDER_NAME), (0, _config.getGlobalRepo)());
    }
  }, {
    key: "cwdCheck",
    value: function cwdCheck() {
      var cwd = process.cwd();

      if (_classPrivateFieldGet(this, _cwd) !== cwd) {
        _classPrivateFieldSet(this, _cmdPlugins, {});

        _classPrivateFieldSet(this, _hooks, {});

        _classPrivateFieldSet(this, _cwd, cwd);

        (0, _register.resolveCmdPlugins)(this);
        (0, _register.resolveNpmPlugins)(this);
        (0, _register.registerPluginHooks)(this);
      }
    }
  }, {
    key: "registerCmd",
    value: function registerCmd(name, options, action, isUiTask) {
      this.cwdCheck();

      if (!_classPrivateFieldGet(this, _cmdPlugins)[name]) {
        _classPrivateFieldGet(this, _cmdPlugins)[name] = {};
      }

      _classPrivateFieldGet(this, _cmdPlugins)[name]['options'] = options;
      _classPrivateFieldGet(this, _cmdPlugins)[name]['action'] = action;
      _classPrivateFieldGet(this, _cmdPlugins)[name]['isUiTask'] = isUiTask;
    }
  }, {
    key: "on",
    value: function on(type, action) {
      this.cwdCheck();

      if (!_classPrivateFieldGet(this, _hooks)[type]) {
        _classPrivateFieldGet(this, _hooks)[type] = [];
      }

      if (this.eventTypes[type]) {
        _classPrivateFieldGet(this, _hooks)[type].push(action);
      }
    }
  }, {
    key: "bundlesDir",
    value: function bundlesDir(isGlobal) {
      if (isGlobal) {
        return (0, _config.getGlobalRepo)();
      }

      return _path["default"].resolve(_path["default"].join(process.cwd(), _constant.DEP_FOLDER_NAME));
    }
  }, {
    key: "clean",
    value: function clean() {
      var ohosFolder = this.bundlesDir();
      (0, _helpers.cleanBundlesFolder)(ohosFolder);
    }
  }, {
    key: "save",
    value: function save(manifest) {
      var bundlePath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : process.cwd();

      if (!_fs["default"].existsSync(bundlePath)) {
        _shelljs["default"].mkdir('-p', bundlePath);
      }

      var bundle = new _bundle.Bundle(bundlePath, _manifest.Manifest.json(manifest));
      bundle.updateBundleJson();
    }
  }, {
    key: "cwd",
    value: function cwd() {
      return _classPrivateFieldGet(this, _cwd);
    }
  }, {
    key: "init",
    value: function () {
      var _init = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        var _ref2,
            name,
            template,
            scope,
            dirname,
            _args = arguments;

        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _ref2 = _args.length > 0 && _args[0] !== undefined ? _args[0] : {}, name = _ref2.name, template = _ref2.template, scope = _ref2.scope, dirname = _ref2.dirname;
                _context.next = 3;
                return _classPrivateFieldGet(this, _runAction).call(this, "init", [name, {
                  template: template,
                  scope: scope,
                  dirname: dirname
                }]);

              case 3:
                return _context.abrupt("return", _context.sent);

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function init() {
        return _init.apply(this, arguments);
      }

      return init;
    }()
  }, {
    key: "install",
    value: function () {
      var _install = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(names) {
        var _ref3,
            global,
            saveDev,
            namesString,
            _args2 = arguments;

        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _ref3 = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : {}, global = _ref3.global, saveDev = _ref3.saveDev;

                if (!(names && names.length > 0)) {
                  _context2.next = 8;
                  break;
                }

                namesString = names.join(',');
                _context2.next = 5;
                return _classPrivateFieldGet(this, _runAction).call(this, "install", [namesString, {
                  global: global,
                  saveDev: saveDev
                }]);

              case 5:
                return _context2.abrupt("return", _context2.sent);

              case 8:
                _context2.next = 10;
                return _classPrivateFieldGet(this, _runAction).call(this, "install", []);

              case 10:
                return _context2.abrupt("return", _context2.sent);

              case 11:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function install(_x) {
        return _install.apply(this, arguments);
      }

      return install;
    }()
  }, {
    key: "remove",
    value: function () {
      var _remove = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(names) {
        var _ref4,
            global,
            saveDev,
            namesString,
            _args3 = arguments;

        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _ref4 = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : {}, global = _ref4.global, saveDev = _ref4.saveDev;

                if (names && names.length > 0) {
                  namesString = names.join(',');
                }

                _context3.next = 4;
                return _classPrivateFieldGet(this, _runAction).call(this, "uninstall", [namesString, {
                  global: global,
                  saveDev: saveDev
                }]);

              case 4:
                return _context3.abrupt("return", _context3.sent);

              case 5:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function remove(_x2) {
        return _remove.apply(this, arguments);
      }

      return remove;
    }()
  }, {
    key: "update",
    value: function () {
      var _update = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(names) {
        var _ref5,
            global,
            namesString,
            _args4 = arguments;

        return _regeneratorRuntime().wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _ref5 = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : {}, global = _ref5.global;

                if (names && names.length > 0) {
                  namesString = names.join(',');
                }

                _context4.next = 4;
                return _classPrivateFieldGet(this, _runAction).call(this, "update", [namesString, {
                  global: global
                }]);

              case 4:
                return _context4.abrupt("return", _context4.sent);

              case 5:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function update(_x3) {
        return _update.apply(this, arguments);
      }

      return update;
    }()
  }, {
    key: "run",
    value: function () {
      var _run = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(name) {
        return _regeneratorRuntime().wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return _classPrivateFieldGet(this, _runAction).call(this, "run", [name]);

              case 2:
                return _context5.abrupt("return", _context5.sent);

              case 3:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function run(_x4) {
        return _run.apply(this, arguments);
      }

      return run;
    }()
  }, {
    key: "getConfig",
    value: function getConfig() {
      var rcParser = _rcParser["default"].fromPath(_constant.DEFAULT_CONFIG_FILE);

      return rcParser.toJson();
    }
  }, {
    key: "setConfig",
    value: function setConfig(config) {
      var rcParser = _rcParser["default"].fromPath(_constant.DEFAULT_CONFIG_FILE);

      Object.keys(config).forEach(function (key) {
        rcParser.set(key, config[key].toString());
      });
      rcParser.save();
    }
  }, {
    key: "deleteConfig",
    value: function deleteConfig(configKeys) {
      var rcParser = _rcParser["default"].fromPath(_constant.DEFAULT_CONFIG_FILE);

      configKeys.forEach(function (key) {
        rcParser["delete"](key);
      });
      rcParser.save();
    }
  }, {
    key: "getScriptHooks",
    value: function getScriptHooks() {
      return Object.values(_constant.Hooks);
    }
  }, {
    key: "list",
    value: function () {
      var _list = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(deep) {
        var _yield$this$_bundle$t, manifests, dependencies;

        return _regeneratorRuntime().wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                if (!this._bundle) {
                  _context6.next = 9;
                  break;
                }

                _context6.next = 3;
                return this._bundle.traverse(this._repo);

              case 3:
                _yield$this$_bundle$t = _context6.sent;
                manifests = _yield$this$_bundle$t.manifests;

                if (!deep) {
                  _context6.next = 7;
                  break;
                }

                return _context6.abrupt("return", manifests);

              case 7:
                dependencies = this._bundle.manifest.dependencies;
                return _context6.abrupt("return", dependencies.map(function (d) {
                  return manifests.find(function (m) {
                    return m.name === d.name;
                  });
                }).concat(this._bundle.manifest));

              case 9:
                return _context6.abrupt("return", []);

              case 10:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function list(_x5) {
        return _list.apply(this, arguments);
      }

      return list;
    }()
  }, {
    key: "getManifest",
    value: function getManifest() {
      if (this._bundle) {
        return this._bundle.manifest;
      }

      return null;
    }
  }, {
    key: "getPluginManifests",
    value: function getPluginManifests() {
      var localManifests = this.getManifests();
      var global = this.getManifests(true);
      var total = global.filter(function (manifest) {
        return !localManifests.find(function (m) {
          return m.name === manifest.name;
        });
      }).concat(localManifests).concat((0, _register.getNpmManifests)());
      ;
      var filtered = total.filter(isPlugin);
      return filtered;
    }
  }, {
    key: "checkUpdate",
    value: function () {
      var _checkUpdate = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7() {
        var global,
            needUpdate,
            globalRepo,
            bundle,
            _args7 = arguments;
        return _regeneratorRuntime().wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                global = _args7.length > 0 && _args7[0] !== undefined ? _args7[0] : false;

                if (!this._bundle) {
                  _context7.next = 14;
                  break;
                }

                if (!global) {
                  _context7.next = 10;
                  break;
                }

                globalRepo = new _repository.Repository('', (0, _config.getGlobalRepo)());
                bundle = _bundle.Bundle.from((0, _config.getRootBundlePath)(global));
                _context7.next = 7;
                return bundle.update(globalRepo);

              case 7:
                needUpdate = _context7.sent;
                _context7.next = 13;
                break;

              case 10:
                _context7.next = 12;
                return this._bundle.update(this._repo);

              case 12:
                needUpdate = _context7.sent;

              case 13:
                return _context7.abrupt("return", needUpdate);

              case 14:
                return _context7.abrupt("return", []);

              case 15:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function checkUpdate() {
        return _checkUpdate.apply(this, arguments);
      }

      return checkUpdate;
    }()
  }, {
    key: "getManifests",
    value: function getManifests(isGlobal) {
      if (isGlobal) {
        return this._repo.globalManifests();
      }

      return this._repo.manifests();
    }
  }, {
    key: "getDependencies",
    value: function () {
      var _getDependencies = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(name, allManifests) {
        var manifests, manifest;
        return _regeneratorRuntime().wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.t0 = allManifests;

                if (_context8.t0) {
                  _context8.next = 5;
                  break;
                }

                _context8.next = 4;
                return this.list(true);

              case 4:
                _context8.t0 = _context8.sent;

              case 5:
                manifests = _context8.t0;
                manifest = manifests.find(function (m) {
                  return m.name === name;
                });

                if (!manifest) {
                  _context8.next = 9;
                  break;
                }

                return _context8.abrupt("return", manifest.dependencies.filter(function (d) {
                  return d instanceof _dependency.Dependency;
                }));

              case 9:
                return _context8.abrupt("return", []);

              case 10:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function getDependencies(_x6, _x7) {
        return _getDependencies.apply(this, arguments);
      }

      return getDependencies;
    }()
  }, {
    key: "getCmdPlugins",
    value: function getCmdPlugins() {
      this.cwdCheck();
      return _classPrivateFieldGet(this, _cmdPlugins);
    }
  }, {
    key: "getHooks",
    value: function getHooks() {
      this.cwdCheck();
      return _classPrivateFieldGet(this, _hooks);
    }
  }, {
    key: "getTemplates",
    value: function getTemplates() {
      return _shelljs["default"].ls('-l', _path["default"].join(__dirname, '..', 'asset', 'template', 'default')).map(function (fstat) {
        return _path["default"].join(__dirname, '..', 'asset', 'template', 'default', fstat.name);
      });
    }
  }, {
    key: "getVersion",
    value: function getVersion() {
      return JSON.parse(_fs["default"].readFileSync(_path["default"].join(__dirname, '..', '..', 'package.json')).toString()).version;
    }
  }, {
    key: "getValidator",
    value: function getValidator() {
      return _objectSpread({}, _manifest.Manifest.Validator);
    }
  }, {
    key: "search",
    value: function () {
      var _search = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9(_ref6) {
        var searchKey, publishAs, curPage, pageSize, ver, matchBy, currentPageNum, pageSizeNum, params;
        return _regeneratorRuntime().wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                searchKey = _ref6.searchKey, publishAs = _ref6.publishAs, curPage = _ref6.curPage, pageSize = _ref6.pageSize, ver = _ref6.ver;
                matchBy = [];

                if (searchKey) {
                  matchBy.push({
                    field: 'name',
                    opt: 'CONTAIN',
                    value: searchKey
                  });
                }

                if (publishAs) {
                  matchBy.push({
                    field: 'publishAs',
                    opt: 'EQUAL',
                    value: publishAs
                  });
                }

                if (ver && (ver === 'latest' || ver === 'all' || _semver["default"].validRange(ver))) {
                  matchBy.push({
                    field: 'version',
                    opt: 'EQUAL',
                    value: ver
                  });
                }

                currentPageNum = Number(curPage);
                pageSizeNum = Number(pageSize);
                params = {
                  pageSize: pageSizeNum,
                  condition: JSON.stringify({
                    matchBy: matchBy
                  }),
                  curPage: currentPageNum
                };
                _context9.next = 10;
                return _axios["default"].get(_helpers.URL.search(searchKey), {
                  params: params
                });

              case 10:
                return _context9.abrupt("return", _context9.sent);

              case 11:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9);
      }));

      function search(_x8) {
        return _search.apply(this, arguments);
      }

      return search;
    }()
  }, {
    key: "setRecentProject",
    value: function setRecentProject(name, projectPath, isDelete) {
      _preference["default"].setRecentProject(name, projectPath, isDelete);
    }
  }, {
    key: "getRecentProject",
    value: function getRecentProject() {
      return _preference["default"].getRecentProject();
    }
  }, {
    key: "getThemeOrLang",
    value: function getThemeOrLang(key) {
      return _preference["default"].getThemeOrLang(key);
    }
  }, {
    key: "setThemeOrLang",
    value: function setThemeOrLang(key, value) {
      _preference["default"].setThemeOrLang(key, value);
    }
  }, {
    key: "addDisabledPlugin",
    value: function addDisabledPlugin(name) {
      _preference["default"].addDisabledPlugin(name);

      (0, _register.resolveCmdPlugins)(this);
      (0, _register.registerPluginHooks)(this);
    }
  }, {
    key: "removeDisabledPlugin",
    value: function removeDisabledPlugin(name) {
      _preference["default"].removeDisabledPlugin(name);

      (0, _register.resolveCmdPlugins)(this);
      (0, _register.registerPluginHooks)(this);
    }
  }, {
    key: "getDisabledPlugins",
    value: function getDisabledPlugins() {
      return _preference["default"].getDisabledPlugins();
    }
  }, {
    key: "getScopeRegistry",
    value: function getScopeRegistry(name) {
      return (0, _helpers.getScopeRegistry)(name);
    }
  }, {
    key: "getRemoteBundleDetails",
    value: function () {
      var _getRemoteBundleDetails = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee10(name) {
        var apiUrl, _yield$axios$get, data;

        return _regeneratorRuntime().wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                apiUrl = this.getScopeRegistry(name);
                _context10.next = 3;
                return _axios["default"].get("".concat(apiUrl, "/detail/").concat(name));

              case 3:
                _yield$axios$get = _context10.sent;
                data = _yield$axios$get.data;
                return _context10.abrupt("return", data);

              case 6:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function getRemoteBundleDetails(_x9) {
        return _getRemoteBundleDetails.apply(this, arguments);
      }

      return getRemoteBundleDetails;
    }()
  }, {
    key: "getLocalBundle",
    value: function getLocalBundle(name) {
      var manifests = this.getManifests().concat(this.getManifests(true));

      if (this._bundle) {
        this._bundle.manifest.path = this._bundle.path;
        manifests.push(this._bundle.manifest);
      }

      return manifests.find(function (m) {
        return m.name === name;
      });
    }
  }, {
    key: "getRemoteReadme",
    value: function () {
      var _getRemoteReadme = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee11(url) {
        var _yield$axios$get2, data;

        return _regeneratorRuntime().wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                _context11.next = 2;
                return _axios["default"].get(url);

              case 2:
                _yield$axios$get2 = _context11.sent;
                data = _yield$axios$get2.data;
                return _context11.abrupt("return", data);

              case 5:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11);
      }));

      function getRemoteReadme(_x10) {
        return _getRemoteReadme.apply(this, arguments);
      }

      return getRemoteReadme;
    }()
  }, {
    key: "setLanguage",
    value: function setLanguage(value) {
      var supportLanguages = (0, _i18n.getSupportLang)();

      if (!supportLanguages.includes(value)) {
        throw (0, _i18n.getI18nMessage)('lang.err', {
          supportLanguages: supportLanguages
        });
      }

      return _preference["default"].set('lang', value, true);
    }
  }, {
    key: "getLanguage",
    value: function getLanguage() {
      return _preference["default"].get('lang');
    }
  }, {
    key: "getOutputDir",
    value: function getOutputDir(pluginName) {
      var _parseScopeName = (0, _helpers.parseScopeName)(pluginName),
          scope = _parseScopeName.scope,
          name = _parseScopeName.name;

      var outputPath = _path["default"].join(this.cwd(), _constant.DEP_FOLDER_NAME, _constant.DATA_OUTPUT_FOLDER, scope, name);

      if (_fs["default"].existsSync(outputPath)) {
        return outputPath;
      }

      _shelljs["default"].mkdir('-p', outputPath);

      return outputPath;
    }
  }, {
    key: "getDefaultCmds",
    value: function getDefaultCmds(publishAs) {
      return _commands.defaultCmdConfigs.filter(function (_ref7) {
        var isBundleDefaultCmd = _ref7.isBundleDefaultCmd;
        return isBundleDefaultCmd(publishAs);
      }).map(function (_ref8) {
        var name = _ref8.name,
            description = _ref8.description;
        return {
          name: name,
          description: description
        };
      });
    }
  }]);

  return PluginAPI;
}();

exports["default"] = PluginAPI;

function isPlugin(manifest) {
  return manifest.publishAs === "plugin";
}