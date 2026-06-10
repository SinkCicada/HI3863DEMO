"use strict";

require("idempotent-babel-polyfill");

var _commander = _interopRequireDefault(require("commander"));

var _events = _interopRequireDefault(require("events"));

var _package = require("../package.json");

var _config = require("./utils/config");

var _semver = _interopRequireDefault(require("semver"));

var _i18n = _interopRequireWildcard(require("./i18n"));

var _helpers = require("./utils/helpers");

var _commands = require("./commands");

var _log = _interopRequireDefault(require("./core/log"));

var _pluginAPI = _interopRequireDefault(require("./plugin/pluginAPI"));

var _trace = require("./utils/trace");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/*eslint-disable*/
_events["default"].EventEmitter.defaultMaxListeners = 100;

function actionEntrance() {
  return _actionEntrance.apply(this, arguments);
}

function _actionEntrance() {
  _actionEntrance = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
    var _args = arguments;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(_semver["default"].compare(process.version, '12.0.0') === -1)) {
              _context.next = 3;
              break;
            }

            process.exitCode = -1;
            return _context.abrupt("return", _i18n["default"].log('nodejs.version'));

          case 3:
            _context.prev = 3;
            _context.next = 6;
            return (0, _commands.runAction)(this._name, _args, pluginAPI);

          case 6:
            _context.next = 13;
            break;

          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](3);
            process.exitCode = -1;

            _i18n["default"].log("".concat(this._name, ".error"), {
              error: (0, _helpers.getErrorMessage)(_context.t0)
            }); //  暂不开启埋点日志功能
            // const msg = getI18nMessage(`${this._name}.error`, { error: getErrorMessage(err) })
            // traceLogger.write({ action: this._name, msg })


            _log["default"].debug(_context.t0);

          case 13:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[3, 8]]);
  }));
  return _actionEntrance.apply(this, arguments);
}

(0, _config.initConfig)();

_commander["default"].version(_package.version, "-V, --version", (0, _i18n.getI18nMessage)('help.version'));

_commander["default"].helpOption("-h --help", (0, _i18n.getI18nMessage)("help.help"));

_commander["default"].addHelpCommand("help [command]", (0, _i18n.getI18nMessage)("help.help"));

_commander["default"].command('init').description((0, _i18n.getI18nMessage)('help.init')).option('-t, --template <template>', (0, _i18n.getI18nMessage)('help.initTemplate')).option('-d, --dirname <dirname>', (0, _i18n.getI18nMessage)('help.initDir')).option('-s, --scope <scopename>', (0, _i18n.getI18nMessage)('help.initScope')).arguments('[name]').action(actionEntrance);

_commander["default"].command('build').allowUnknownOption(true).description((0, _i18n.getI18nMessage)('help.build')).action(actionEntrance);

_commander["default"].command('pack').description((0, _i18n.getI18nMessage)('help.pack')).action(actionEntrance);

_commander["default"].command('dist').allowUnknownOption(true).description((0, _i18n.getI18nMessage)('help.dist')).action(actionEntrance);

_commander["default"].command('install').alias('i').alias('add').arguments('[name]').description((0, _i18n.getI18nMessage)('help.install')).action(actionEntrance).option('-g, --global', (0, _i18n.getI18nMessage)('help.installGlobal')).option('-d, --save-dev', (0, _i18n.getI18nMessage)('help.installDev')).option('-f, --force', (0, _i18n.getI18nMessage)('help.forceInstall'));

_commander["default"].command('uninstall').alias('rm').alias('remove').arguments('<name>').description((0, _i18n.getI18nMessage)('help.uninstall')).action(actionEntrance).option('-g, --global', (0, _i18n.getI18nMessage)('help.uninstallGlobal')).option('-d, --save-dev', (0, _i18n.getI18nMessage)('help.uninstallDev'));

_commander["default"].command('publish').description((0, _i18n.getI18nMessage)('help.publish')).option('-o, --old', (0, _i18n.getI18nMessage)('help.publishOld')).action(actionEntrance);

_commander["default"].command('run').allowUnknownOption(true).description((0, _i18n.getI18nMessage)('help.run')).arguments('<cmd>').action(actionEntrance);

_commander["default"].command('config').description((0, _i18n.getI18nMessage)('help.config')).action(actionEntrance).option('set <key> <value>', (0, _i18n.getI18nMessage)('help.configSet')).option('delete <key>', (0, _i18n.getI18nMessage)('help.configDelete')).option('get <key>', (0, _i18n.getI18nMessage)('help.configItem')).option('list', (0, _i18n.getI18nMessage)('help.configList')).option('-j, --json', (0, _i18n.getI18nMessage)('help.searchJson'));

_commander["default"].command('search').description((0, _i18n.getI18nMessage)('help.search')).option('-t, --type <type>', (0, _i18n.getI18nMessage)('help.searchType')).option('-j, --json', (0, _i18n.getI18nMessage)('help.searchJson')).option('-p, --pageSize <pageSize>', (0, _i18n.getI18nMessage)('help.searchPagesize')).option('-c, --currentPage <currentPage>', (0, _i18n.getI18nMessage)('help.searchCurrentpage')).option('-v, --ver <latest|all|semver>', (0, _i18n.getI18nMessage)('help.searchVersion')).option('-k, --kernel <kernel>', (0, _i18n.getI18nMessage)('help.searchKernel')).option('-b, --board <board>', (0, _i18n.getI18nMessage)('help.searchBoard')).option('-os, --osVersion <osVersion>', (0, _i18n.getI18nMessage)('help.searchOsVersion')).arguments('[name]').action(actionEntrance);

_commander["default"].command('update').alias('up').alias('upgrade').arguments('[name]').description((0, _i18n.getI18nMessage)('help.update')).action(actionEntrance).option('-g, --global', (0, _i18n.getI18nMessage)('help.updateGlobal')).option('--self', (0, _i18n.getI18nMessage)('help.updateSelf')).option('-f --force', (0, _i18n.getI18nMessage)('help.forceUpdate'));

_commander["default"].command('check-update').description((0, _i18n.getI18nMessage)('help.checkUpdate')).action(actionEntrance).option('-g, --global', (0, _i18n.getI18nMessage)('help.checkUpdateGlobal')).option('-j, --json', (0, _i18n.getI18nMessage)('help.checkUpdateJson'));

_commander["default"].command('list').alias('ls').description((0, _i18n.getI18nMessage)('help.list')).option('-j, --json', (0, _i18n.getI18nMessage)('help.searchJson')).option('-g, --global', (0, _i18n.getI18nMessage)('help.listGlobal')).action(actionEntrance);

_commander["default"].command('gen-keys').description((0, _i18n.getI18nMessage)('help.genKeys')).action(actionEntrance);

_commander["default"].command('extract').alias('x').arguments('<source> [target]').description((0, _i18n.getI18nMessage)('help.extract')).action(actionEntrance);

_commander["default"].command('ui').description((0, _i18n.getI18nMessage)('help.ui')).option('-p, --port <port>', (0, _i18n.getI18nMessage)('help.uiPort')).option('-d, --daemon', (0, _i18n.getI18nMessage)('help.daemon')).action(actionEntrance);

_commander["default"].command('lang').arguments('[lang]').description((0, _i18n.getI18nMessage)('lang.lang')).action(actionEntrance);

_commander["default"].command('code').alias('segment').arguments('<action>').description((0, _i18n.getI18nMessage)('help.code')).action(actionEntrance);

_commander["default"].command('download').alias('d').arguments('<name>').description((0, _i18n.getI18nMessage)('help.download')).action(actionEntrance).option('-o, --output <dir>', (0, _i18n.getI18nMessage)('help.downLoadOutput'));

_commander["default"].command('fetch').description((0, _i18n.getI18nMessage)('help.fetch')).option('-p, --platform <platform>', (0, _i18n.getI18nMessage)('help.platform')).option('-z, --zip', (0, _i18n.getI18nMessage)('help.zip')).action(actionEntrance);

var pluginAPI = new _pluginAPI["default"](process.cwd(), _commands.runAction, _commander["default"]);
pluginAPI.registerPlugins();

_commander["default"].parse(process.argv);