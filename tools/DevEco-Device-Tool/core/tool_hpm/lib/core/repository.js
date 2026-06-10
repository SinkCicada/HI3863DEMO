"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Repository = void 0;
exports.bundleDownload = bundleDownload;
exports.createDirIfNotExists = createDirIfNotExists;
exports.extract = extract;

require("idempotent-babel-polyfill");

var _tar = _interopRequireDefault(require("tar"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _remoteRepository = require("./remote-repository");

var _helpers = require("../utils/helpers");

var _helpers2 = require("./helpers");

var _localRepository = require("./local-repository");

var _constant = require("../constant/constant");

var _i18n = _interopRequireWildcard(require("../i18n"));

var _variable = require("./variable");

var _events = _interopRequireWildcard(require("../utils/events"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

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

var _localRepo = /*#__PURE__*/new WeakMap();

var _globalRepo = /*#__PURE__*/new WeakMap();

var _remoteRepo = /*#__PURE__*/new WeakMap();

var Repository = /*#__PURE__*/function () {
  function Repository(localRepoPath, globalRepoPath) {
    _classCallCheck(this, Repository);

    _classPrivateFieldInitSpec(this, _localRepo, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _globalRepo, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _remoteRepo, {
      writable: true,
      value: void 0
    });

    if (localRepoPath) {
      _classPrivateFieldSet(this, _localRepo, new _localRepository.LocalRepository(localRepoPath));
    }

    if (globalRepoPath) {
      _classPrivateFieldSet(this, _globalRepo, new _localRepository.LocalRepository(globalRepoPath));
    }

    _classPrivateFieldSet(this, _remoteRepo, new _remoteRepository.RemoteRepository());
  }

  _createClass(Repository, [{
    key: "remoteRepo",
    get: function get() {
      return _classPrivateFieldGet(this, _remoteRepo);
    }
  }, {
    key: "path",
    get: function get() {
      return _classPrivateFieldGet(this, _localRepo) && _classPrivateFieldGet(this, _localRepo).path;
    }
  }, {
    key: "globalRepoPath",
    get: function get() {
      return _classPrivateFieldGet(this, _globalRepo) && _classPrivateFieldGet(this, _globalRepo).path;
    }
  }, {
    key: "manifests",
    value: function manifests() {
      return _classPrivateFieldGet(this, _localRepo) ? _classPrivateFieldGet(this, _localRepo).manifests() : [];
    }
  }, {
    key: "globalManifests",
    value: function globalManifests() {
      return _classPrivateFieldGet(this, _globalRepo) ? _classPrivateFieldGet(this, _globalRepo).manifests() : [];
    }
  }, {
    key: "resolve",
    value: function () {
      var _resolve = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(manifest, rootManifest) {
        var result, depManifest, dependencies, _iterator, _step, dependency, name, versionRanges, suffix;

        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                result = [];
                depManifest = null;
                dependencies = manifest.getCompositeDependencies(rootManifest);
                _iterator = _createForOfIteratorHelper(dependencies);
                _context.prev = 4;

                _iterator.s();

              case 6:
                if ((_step = _iterator.n()).done) {
                  _context.next = 24;
                  break;
                }

                dependency = _step.value;
                name = dependency.name, versionRanges = dependency.versionRanges;

                if (_classPrivateFieldGet(this, _localRepo)) {
                  depManifest = _classPrivateFieldGet(this, _localRepo).manifest(name, versionRanges);
                }

                if (!depManifest && _classPrivateFieldGet(this, _globalRepo)) {
                  depManifest = _classPrivateFieldGet(this, _globalRepo).manifest(name, versionRanges);
                }

                if (!(!depManifest && this.remoteRepo)) {
                  _context.next = 15;
                  break;
                }

                _context.next = 14;
                return this.remoteRepo.manifest(name, versionRanges);

              case 14:
                depManifest = _context.sent;

              case 15:
                if (depManifest) {
                  _context.next = 20;
                  break;
                }

                suffix = versionRanges === '*' ? '' : "-".concat(versionRanges);
                throw (0, _i18n.getI18nMessage)('repository.unResolved', {
                  name: dependency.name,
                  suffix: suffix
                });

              case 20:
                result.push(depManifest);

              case 21:
                depManifest = null;

              case 22:
                _context.next = 6;
                break;

              case 24:
                _context.next = 29;
                break;

              case 26:
                _context.prev = 26;
                _context.t0 = _context["catch"](4);

                _iterator.e(_context.t0);

              case 29:
                _context.prev = 29;

                _iterator.f();

                return _context.finish(29);

              case 32:
                return _context.abrupt("return", result);

              case 33:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[4, 26, 29, 32]]);
      }));

      function resolve(_x, _x2) {
        return _resolve.apply(this, arguments);
      }

      return resolve;
    }()
  }, {
    key: "suspend",
    value: function suspend(nameList, isGlobal) {
      this.delegate('suspend', isGlobal, nameList);
    }
  }, {
    key: "deleteSuspend",
    value: function deleteSuspend(isGlobal) {
      this.delegate('deleteSuspend', isGlobal);
    }
  }, {
    key: "restoreSuspend",
    value: function restoreSuspend(isGlobal) {
      this.delegate('restoreSuspend', isGlobal);
    }
  }, {
    key: "remove",
    value: function remove(nameList, isGlobal) {
      this.delegate('remove', isGlobal, nameList);
    }
  }, {
    key: "removeSnapshot",
    value: function removeSnapshot(manifests, isGlobal) {
      var nameList = manifests.map(function (m) {
        //  除了删除ohos_bundles里snapshot版本bundle,还需要提前清理bundle还原的目录
        var targetPath = m.segment && m.segment.insteadOfHook && _path["default"].join(process.cwd(), m.segment.destPath);

        if (targetPath) {
          (0, _helpers.runShellCmd)(function (shell) {
            return shell.rm('-rf', targetPath);
          });
        }

        return m.name;
      });
      this.remove(nameList, isGlobal);
    }
  }, {
    key: "delegate",
    value: function delegate(methodName, isGlobal) {
      for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      if (isGlobal && _classPrivateFieldGet(this, _globalRepo)) {
        var _classPrivateFieldGet2;

        (_classPrivateFieldGet2 = _classPrivateFieldGet(this, _globalRepo))[methodName].apply(_classPrivateFieldGet2, args);
      } else if (!isGlobal && _classPrivateFieldGet(this, _localRepo)) {
        var _classPrivateFieldGet3;

        (_classPrivateFieldGet3 = _classPrivateFieldGet(this, _localRepo))[methodName].apply(_classPrivateFieldGet3, args);
      } else {
        throw (0, _i18n.getI18nMessage)('repository.depFolderNotExisted', {
          name: _constant.DEP_FOLDER_NAME
        });
      }
    }
  }]);

  return Repository;
}();

exports.Repository = Repository;

function bundleDownload(_x3, _x4, _x5) {
  return _bundleDownload.apply(this, arguments);
}

function _bundleDownload() {
  _bundleDownload = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(manifest, isGlobal, envs) {
    var installPath, nameInfo, dirTemp, dirPath, tempfile, preInstallCmd;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            installPath = isGlobal ? process.env.globalRepo : process.cwd();
            nameInfo = (0, _helpers.parseScopeName)(manifest.name);
            dirTemp = _path["default"].resolve(_path["default"].join(installPath, _constant.DEP_FOLDER_NAME, _constant.DOWNLOAD_TEMP_FOLDER));
            dirPath = _path["default"].resolve(_path["default"].join(installPath, _constant.DEP_FOLDER_NAME, nameInfo.scope, nameInfo.name));
            tempfile = _path["default"].resolve(dirTemp, "".concat(manifest.id, ".tgz"));
            createDirIfNotExists(dirPath);
            preInstallCmd = manifest.scripts(_constant.Hooks.preInstall);

            if (preInstallCmd) {
              (0, _helpers.runCmdWithSpawnSync)(function (spawnSync) {
                return spawnSync(preInstallCmd, {
                  shell: process.env.shellPath,
                  env: envs || _variable.Variable.basicEnv(installPath),
                  cwd: dirPath,
                  stdio: 'inherit'
                });
              });
            }

            _events["default"].emit('hooks', {
              type: _events.EventTypes.beforeEachInstall,
              name: manifest.name
            });

            _context2.next = 11;
            return (0, _helpers2.download)(manifest, dirTemp);

          case 11:
            return _context2.abrupt("return", dirPath);

          case 12:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _bundleDownload.apply(this, arguments);
}

function createDirIfNotExists(dirName, basePath) {
  var targetDir = _path["default"].join(basePath || '', dirName);

  if (!_fs["default"].existsSync(targetDir)) {
    (0, _helpers.runShellCmd)(function (shell) {
      return shell.mkdir('-p', targetDir);
    });
  }
}

function extract(manifestPath, dirPath) {
  _tar["default"].extract({
    file: manifestPath,
    cwd: dirPath,
    sync: true
  });
}