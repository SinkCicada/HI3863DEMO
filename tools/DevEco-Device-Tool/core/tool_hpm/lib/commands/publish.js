"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.publish = publish;
exports.publishBundle = publishBundle;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _formData = _interopRequireDefault(require("form-data"));

var _build = require("./build");

var _pack = require("./pack");

var _bundle = require("../core/bundle");

var _axios = require("../utils/axios");

var _helpers = require("../utils/helpers");

var _repository = require("../core/repository");

var _constant = require("../constant/constant");

var _config = require("../utils/config");

var _config2 = _interopRequireDefault(require("../config.json"));

var _crypto = _interopRequireDefault(require("../core/crypto"));

var _i18n = _interopRequireWildcard(require("../i18n"));

var _events = _interopRequireWildcard(require("../utils/events"));

var _preference = _interopRequireDefault(require("../core/preference"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function publish(_x) {
  return _publish.apply(this, arguments);
}

function _publish() {
  _publish = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(_ref) {
    var old, bundle, repo, prePublishCmd, afterPublishCmd;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            old = _ref.old;
            bundle = null;
            _context.prev = 2;
            bundle = _bundle.Bundle.from(process.cwd());

            if (!bundle.isPublishAs('chip-definition')) {
              _context.next = 7;
              break;
            }

            _i18n["default"].log('publish.supportError');

            return _context.abrupt("return");

          case 7:
            repo = new _repository.Repository(_path["default"].join(process.cwd(), _constant.DEP_FOLDER_NAME), (0, _config.getGlobalRepo)());
            prePublishCmd = bundle.scripts(_constant.Hooks.prePublish);

            if (prePublishCmd) {
              (0, _helpers.runCmdWithSpawnSync)(function (spawnSync) {
                return spawnSync(prePublishCmd, {
                  shell: process.env.shellPath,
                  env: bundle.vars.env,
                  cwd: bundle.path,
                  stdio: 'inherit'
                });
              });
            }

            _events["default"].emit('hooks', {
              type: _events.EventTypes.beforePublish,
              name: bundle.name,
              path: bundle.path
            });

            _context.next = 13;
            return loginAndPublish(bundle, repo, {
              old: old
            });

          case 13:
            afterPublishCmd = bundle.scripts(_constant.Hooks.publish) || bundle.scripts(_constant.Hooks.afterPublish);

            if (afterPublishCmd) {
              (0, _helpers.runCmdWithSpawnSync)(function (spawnSync) {
                return spawnSync(afterPublishCmd, {
                  shell: process.env.shellPath,
                  env: bundle.vars.env,
                  cwd: bundle.path,
                  stdio: 'inherit'
                });
              });
            }

            _events["default"].emit('hooks', {
              type: _events.EventTypes.afterPublish,
              name: bundle.name,
              path: bundle.path
            });

            _context.next = 21;
            break;

          case 18:
            _context.prev = 18;
            _context.t0 = _context["catch"](2);
            throw _context.t0;

          case 21:
            _context.prev = 21;
            removePackedBundle(bundle);
            return _context.finish(21);

          case 24:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[2, 18, 21, 24]]);
  }));
  return _publish.apply(this, arguments);
}

function loginAndPublish(_x2, _x3) {
  return _loginAndPublish.apply(this, arguments);
}

function _loginAndPublish() {
  _loginAndPublish = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(bundle, repo) {
    var _ref2,
        old,
        inputJson,
        _args2 = arguments;

    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _ref2 = _args2.length > 2 && _args2[2] !== undefined ? _args2[2] : {}, old = _ref2.old;
            inputJson = {
              old: old
            };
            _context2.next = 4;
            return publishBundle(bundle, repo, inputJson);

          case 4:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _loginAndPublish.apply(this, arguments);
}

function publishBundle(_x4, _x5) {
  return _publishBundle.apply(this, arguments);
}

function _publishBundle() {
  _publishBundle = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(bundle, repo) {
    var inputJson,
        _args3 = arguments;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            inputJson = _args3.length > 2 && _args3[2] !== undefined ? _args3[2] : {};

            if (!bundle.isPublishAs('binary')) {
              _context3.next = 4;
              break;
            }

            _context3.next = 4;
            return buildBeforePublish(bundle, repo);

          case 4:
            _context3.next = 6;
            return packAndUpload(bundle, repo, inputJson);

          case 6:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _publishBundle.apply(this, arguments);
}

function buildBeforePublish(_x6, _x7) {
  return _buildBeforePublish.apply(this, arguments);
}

function _buildBeforePublish() {
  _buildBeforePublish = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(bundle, repo) {
    var buildCmd;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            buildCmd = bundle.scripts('build');

            if (!buildCmd) {
              _context4.next = 4;
              break;
            }

            _context4.next = 4;
            return (0, _build.startBuild)(bundle, repo);

          case 4:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _buildBeforePublish.apply(this, arguments);
}

function packAndUpload(_x8, _x9) {
  return _packAndUpload.apply(this, arguments);
}

function _packAndUpload() {
  _packAndUpload = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(bundle, repo) {
    var inputJson,
        _args5 = arguments;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            inputJson = _args5.length > 2 && _args5[2] !== undefined ? _args5[2] : {};
            (0, _pack.packBundle)(bundle, {
              silent: true
            });

            if (!inputJson.old) {
              _context5.next = 7;
              break;
            }

            _context5.next = 5;
            return uploadByBundles(bundle, repo, inputJson);

          case 5:
            _context5.next = 9;
            break;

          case 7:
            _context5.next = 9;
            return uploadByContentCenter(bundle, repo, inputJson);

          case 9:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));
  return _packAndUpload.apply(this, arguments);
}

function uploadByBundles(_x10, _x11) {
  return _uploadByBundles.apply(this, arguments);
}

function _uploadByBundles() {
  _uploadByBundles = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(bundle, repo) {
    var inputJson,
        filePath,
        stat,
        formData,
        stream,
        headers,
        res,
        code,
        _args6 = arguments;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            inputJson = _args6.length > 2 && _args6[2] !== undefined ? _args6[2] : {};
            filePath = "".concat(bundle.id, ".tgz");
            stat = _fs["default"].statSync(filePath);

            if (!(stat.size > _config2["default"].maxUploadSize)) {
              _context6.next = 5;
              break;
            }

            throw (0, _i18n.getI18nMessage)('publish.overlimit', {
              size: Math.floor(_config2["default"].maxUploadSize / 1024 / 1024)
            });

          case 5:
            formData = new _formData["default"]({
              maxDataSize: _config2["default"].maxUploadSize
            });
            stream = _fs["default"].createReadStream(filePath);
            formData.append('file', stream);

            if (inputJson.user || inputJson.pwd) {
              formData.append('user', inputJson.user);
              formData.append('pwd', inputJson.pwd);
            }

            headers = formData.getHeaders(); // 上传组件

            _context6.next = 12;
            return _axios.axios.post(_helpers.URL.bundles(bundle.manifest.name), formData, {
              headers: _objectSpread(_objectSpread({}, headers), {}, {
                lang: _preference["default"].get('lang')
              }),
              maxContentLength: _config2["default"].maxUploadSize,
              maxBodyLength: _config2["default"].maxUploadSize,
              needAuth: true
            });

          case 12:
            res = _context6.sent;
            code = res && res.data && res.data.code;

            if (!(code === 200)) {
              _context6.next = 18;
              break;
            }

            _i18n["default"].log('publish.success');

            _context6.next = 19;
            break;

          case 18:
            throw res;

          case 19:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));
  return _uploadByBundles.apply(this, arguments);
}

function uploadByContentCenter(_x12, _x13) {
  return _uploadByContentCenter.apply(this, arguments);
}

function _uploadByContentCenter() {
  _uploadByContentCenter = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(bundle, repo) {
    var inputJson,
        filePath,
        stat,
        fileName,
        checksum,
        uploadRes,
        data,
        _data$data,
        url,
        storageKey,
        header,
        file,
        cRes,
        statusRes,
        statusCode,
        _args7 = arguments;

    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            inputJson = _args7.length > 2 && _args7[2] !== undefined ? _args7[2] : {};
            filePath = "".concat(bundle.id, ".tgz");
            stat = _fs["default"].statSync(filePath);

            if (!(stat.size > _config2["default"].maxUploadSize)) {
              _context7.next = 5;
              break;
            }

            throw (0, _i18n.getI18nMessage)('publish.overlimit', {
              size: Math.floor(_config2["default"].maxUploadSize / 1024 / 1024)
            });

          case 5:
            fileName = bundle.manifest.name;
            checksum = _crypto["default"].digest(filePath); // 获取内容中心地址

            _context7.next = 9;
            return _axios.axios.post(_helpers.URL.upload(fileName), {
              fileName: filePath,
              checksum: checksum,
              fileSize: stat.size
            }, {
              headers: {
                'Content-Type': 'application/json',
                lang: _preference["default"].get('lang')
              },
              maxContentLength: Math.pow(1024, 3),
              maxBodyLength: Math.pow(1024, 3),
              needAuth: true
            });

          case 9:
            uploadRes = _context7.sent;
            data = uploadRes && uploadRes.data;

            if (!(data && data.code)) {
              _context7.next = 34;
              break;
            }

            if (!(data.code === 200)) {
              _context7.next = 33;
              break;
            }

            _data$data = data.data, url = _data$data.url, storageKey = _data$data.storageKey, header = _data$data.header;
            file = _fs["default"].readFileSync(filePath); // 上传至内容中心

            _context7.next = 17;
            return _axios.axios.put(url, file, {
              headers: header,
              maxContentLength: Math.pow(1024, 3),
              maxBodyLength: Math.pow(1024, 3)
            });

          case 17:
            cRes = _context7.sent;

            if (!(cRes && cRes.status === 200)) {
              _context7.next = 30;
              break;
            }

            _context7.next = 21;
            return _axios.axios.post(_helpers.URL.uploadStatus(fileName, storageKey), {}, {
              maxContentLength: Math.pow(1024, 3),
              maxBodyLength: Math.pow(1024, 3),
              needAuth: true,
              headers: {
                lang: _preference["default"].get('lang')
              }
            });

          case 21:
            statusRes = _context7.sent;
            statusCode = statusRes && statusRes.data && statusRes.data.code;

            if (!(statusCode === 200)) {
              _context7.next = 27;
              break;
            }

            _i18n["default"].log('publish.success');

            _context7.next = 28;
            break;

          case 27:
            throw statusRes;

          case 28:
            _context7.next = 31;
            break;

          case 30:
            throw cRes;

          case 31:
            _context7.next = 34;
            break;

          case 33:
            throw uploadRes;

          case 34:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));
  return _uploadByContentCenter.apply(this, arguments);
}

function removePackedBundle(bundle) {
  if (bundle) {
    (0, _helpers.runShellCmd)(function (shell) {
      return shell.rm('-rf', "".concat(bundle.id, ".tgz"));
    });
  }
}