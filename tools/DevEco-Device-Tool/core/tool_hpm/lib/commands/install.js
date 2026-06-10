"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLogggerPrefix = getLogggerPrefix;
exports.getSourcePaths = getSourcePaths;
exports.install = install;
exports.installBundle = installBundle;
exports.parseInstallParam = parseInstallParam;
exports.traverseDownload = traverseDownload;

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _os = _interopRequireDefault(require("os"));

var _semver = _interopRequireDefault(require("semver"));

var _tar = _interopRequireDefault(require("tar"));

var _repository = require("../core/repository");

var _bundle = require("../core/bundle");

var _i18n = _interopRequireWildcard(require("../i18n"));

var _constant = require("../constant/constant");

var _manifest = require("../core/manifest");

var _dependency = require("../core/dependency");

var _config = require("../utils/config");

var _helpers = require("../utils/helpers");

var _tasks = require("../utils/tasks");

var _pack = require("./pack");

var _variable = require("../core/variable");

var _extract = require("./extract");

var _events = _interopRequireWildcard(require("../utils/events"));

var _log = _interopRequireDefault(require("../core/log"));

var _state = require("../utils/state");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/**
 * 组件安装的入口函数
 *
 * @param {String} bundleDescriptor 组件描述，可以用','分割
 * @param {object} options 参数，有global、saveDev
 */
function install(_x) {
  return _install.apply(this, arguments);
}

function _install() {
  _install = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(bundleDescriptor) {
    var options,
        repo,
        installPath,
        bundle,
        installCount,
        _args = arguments;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            options = _args.length > 1 && _args[1] !== undefined ? _args[1] : {};
            repo = null;

            if (!((options.global || options.saveDev) && !bundleDescriptor)) {
              _context.next = 4;
              break;
            }

            throw (0, _i18n.getI18nMessage)('install.nameIsRequired');

          case 4:
            if (options.global) {
              repo = new _repository.Repository('', (0, _config.getGlobalRepo)());
            } else {
              repo = new _repository.Repository(_path["default"].join(process.cwd(), _constant.DEP_FOLDER_NAME));
            }

            installPath = (0, _config.getRootBundlePath)(options.global);
            bundle = _variable.Variable.compute([_bundle.Bundle.from(installPath)])[0];
            (0, _repository.createDirIfNotExists)(_constant.DEP_FOLDER_NAME, installPath);
            _context.next = 10;
            return installBundle(bundle, repo, bundleDescriptor, {
              isGlobal: options.global,
              type: options.saveDev ? 'dev' : '',
              isForce: options.force ? true : false
            });

          case 10:
            installCount = _context.sent;

            if (installCount > 0) {
              _i18n["default"].log('install.success', {
                count: installCount
              });
            } else {
              _i18n["default"].log('install.nothing');
            }

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _install.apply(this, arguments);
}

function installBundle(_x2, _x3, _x4) {
  return _installBundle.apply(this, arguments);
}

function _installBundle() {
  _installBundle = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(bundle, repo, bundleDescriptor) {
    var _ref,
        isGlobal,
        type,
        isForce,
        dependencies,
        manifests,
        installedManifests,
        failedTasks,
        _args2 = arguments;

    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _ref = _args2.length > 3 && _args2[3] !== undefined ? _args2[3] : {}, isGlobal = _ref.isGlobal, type = _ref.type, isForce = _ref.isForce;
            (0, _repository.createDirIfNotExists)(_constant.DOWNLOAD_TEMP_FOLDER, _path["default"].join((0, _config.getRootBundlePath)(isGlobal), _constant.DEP_FOLDER_NAME));

            _events["default"].emit('hooks', {
              type: _events.EventTypes.beforeAllInstall
            });

            _i18n["default"].log('install.analyzing');

            dependencies = null;

            if (!bundleDescriptor) {
              _context2.next = 10;
              break;
            }

            _context2.next = 8;
            return parseInstallParam(bundleDescriptor, repo, bundle);

          case 8:
            dependencies = _context2.sent;
            bundle.addDependencies(dependencies, type);

          case 10:
            _context2.next = 12;
            return bundle.install(repo, isGlobal);

          case 12:
            manifests = _context2.sent;
            manifests = bundle.resolveSnapshotManifest(manifests, repo, isGlobal, isForce);
            manifests = skipIgnoreBundles(manifests);
            _context2.next = 17;
            return traverseDownload(manifests, isGlobal, bundle);

          case 17:
            installedManifests = _context2.sent;
            failedTasks = _state.State.getInstance().getState(_state.STATE.failedTasks) || [];

            if (failedTasks.length > 0) {
              _log["default"].warnConsole("Bundles that fail to be downloaded:");

              console.log(failedTasks);
            } //边解压，边删除


            extractBundles(installedManifests, isGlobal);

            if (installedManifests.length > 1) {
              _log["default"].infoConsole((0, _i18n.getI18nMessage)('install.installTotal', {
                length: installedManifests.length
              }));
            }

            installedManifests.forEach(function (m, index) {
              var dirPath = m.path;

              var localManifest = _manifest.Manifest.fromPath(dirPath);

              var installCmd = localManifest.scripts(_constant.Hooks.install) || localManifest.scripts(_constant.Hooks.afterInstall);
              var insteadOfHook = false;
              var isCodeSeg = localManifest.publishAs === 'code-segment';
              var destPath = localManifest.segment && localManifest.segment.destPath;
              insteadOfHook = localManifest.segment && localManifest.segment.insteadOfHook; // 执行安装脚本

              _i18n["default"].log('install.installingHook', {
                name: m.name,
                prefix: getLogggerPrefix(installedManifests.length, index + 1)
              });

              if (installCmd && !insteadOfHook) {
                (0, _helpers.runCmdWithSpawnSync)(function (spawnSync) {
                  return spawnSync(installCmd, {
                    shell: process.env.shellPath,
                    env: bundle.vars.env,
                    cwd: dirPath,
                    stdio: 'inherit'
                  });
                });
              } // code-segment类型bundle根据destPath还原路径（根据配置项restoreCodeSegment决定是否立即还原）


              if (isCodeSeg && (0, _config.restoreCodeSegment)() && destPath) {
                var targetPath = _path["default"].join(process.cwd(), destPath);

                var sourcePaths = getSourcePaths(dirPath);

                _i18n["default"].log('install.restoring', {
                  name: m.name,
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

              _events["default"].emit('hooks', {
                type: _events.EventTypes.afterEachInstall,
                name: m.name,
                path: dirPath
              });
            });

            if (dependencies && dependencies.length > 0) {
              bundle.updateDependencies(dependencies, type);
              bundle.updateBundleJson();
            }

            bundle.updateCacheJson(manifests);

            _events["default"].emit('hooks', {
              type: _events.EventTypes.afterAllInstall
            });

            return _context2.abrupt("return", installedManifests.length);

          case 27:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _installBundle.apply(this, arguments);
}

function parseInstallParam(_x5, _x6, _x7) {
  return _parseInstallParam.apply(this, arguments);
}

function _parseInstallParam() {
  _parseInstallParam = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(bundleDescriptor, repo, rootBundle) {
    var list, dependencies, getDependency, _iterator, _step, nameVersion, dep;

    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            list = String(bundleDescriptor).split(',');
            dependencies = [];

            getDependency = /*#__PURE__*/function () {
              var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(nameVersion) {
                var trimed, filePath, bundle, dependency, index, version, name;
                return _regeneratorRuntime().wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        trimed = nameVersion.trim();
                        filePath = checkDependencyPath(trimed);

                        if (!filePath) {
                          _context3.next = 8;
                          break;
                        }

                        _context3.next = 5;
                        return copyBundleToRepo(filePath, repo, rootBundle);

                      case 5:
                        bundle = _context3.sent;
                        dependency = new _dependency.Dependency(bundle.manifest.name, bundle.manifest.version.version);
                        return _context3.abrupt("return", dependency);

                      case 8:
                        if (!(!filePath && !trimed.startsWith('@'))) {
                          _context3.next = 10;
                          break;
                        }

                        throw (0, _i18n.getI18nMessage)("install.pathError", {
                          name: trimed
                        });

                      case 10:
                        index = trimed.lastIndexOf('@');
                        version = (index > 0 ? trimed.substr(index + 1) : '') || '*'; // index === 0 is scoped name

                        name = index > 0 ? trimed.substr(0, index).trim() : trimed;

                        if (!(_manifest.Manifest.Validator.name(name) !== true)) {
                          _context3.next = 15;
                          break;
                        }

                        throw (0, _i18n.getI18nMessage)('install.validator', {
                          name: name,
                          validateMessage: _manifest.Manifest.Validator.name(name)
                        });

                      case 15:
                        if (_semver["default"].validRange(version)) {
                          _context3.next = 17;
                          break;
                        }

                        throw (0, _i18n.getI18nMessage)('install.invalidVersionRange', {
                          name: name
                        });

                      case 17:
                        return _context3.abrupt("return", new _dependency.Dependency(name, version));

                      case 18:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, _callee3);
              }));

              return function getDependency(_x14) {
                return _ref2.apply(this, arguments);
              };
            }();

            _iterator = _createForOfIteratorHelper(list);
            _context4.prev = 4;

            _iterator.s();

          case 6:
            if ((_step = _iterator.n()).done) {
              _context4.next = 14;
              break;
            }

            nameVersion = _step.value;
            _context4.next = 10;
            return getDependency(nameVersion);

          case 10:
            dep = _context4.sent;
            dependencies.push(dep);

          case 12:
            _context4.next = 6;
            break;

          case 14:
            _context4.next = 19;
            break;

          case 16:
            _context4.prev = 16;
            _context4.t0 = _context4["catch"](4);

            _iterator.e(_context4.t0);

          case 19:
            _context4.prev = 19;

            _iterator.f();

            return _context4.finish(19);

          case 22:
            return _context4.abrupt("return", dependencies);

          case 23:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[4, 16, 19, 22]]);
  }));
  return _parseInstallParam.apply(this, arguments);
}

function getLogggerPrefix(length, index) {
  return length > 1 ? "".concat(index, "/").concat(length, "\uFF1A") : '';
} // cp拷贝文件夹如果当前目录下存在以.开头的文件或者文件夹需要显式添加${dir}/.* + ${dir}/* 两种模式


function getSourcePaths(dirPath) {
  var list = _fs["default"].readdirSync(dirPath);

  return list.some(function (item) {
    return item.startsWith('.');
  }) ? [_path["default"].join(dirPath, _path["default"].sep, '*'), _path["default"].join(dirPath, _path["default"].sep, '.*')] : [_path["default"].join(dirPath, _path["default"].sep, '*')];
}

function extractBundles(downlowedBundles, isGlobal) {
  if (downlowedBundles.length > 1) {
    _log["default"].infoConsole((0, _i18n.getI18nMessage)('install.extractTotal', {
      length: downlowedBundles.length
    }));
  }

  var installPath = (0, _config.getRootBundlePath)(isGlobal);

  var dirTemp = _path["default"].resolve(_path["default"].join(installPath, _constant.DEP_FOLDER_NAME, _constant.DOWNLOAD_TEMP_FOLDER));

  downlowedBundles.forEach(function (m, index) {
    var dirPath = m.path;

    var tarfile = _path["default"].resolve(dirTemp, "".concat(m.id, ".tgz"));

    _i18n["default"].log('install.extracting', {
      filePath: "".concat(m.id, ".tgz"),
      prefix: getLogggerPrefix(downlowedBundles.length, index + 1)
    });

    _tar["default"].extract({
      file: tarfile,
      cwd: dirPath,
      sync: true
    });

    (0, _helpers.runShellCmd)(function (shell) {
      return shell.rm(tarfile);
    });
  });
}

function skipIgnoreBundles(manifests) {
  var ignoreBundles = process.env.ignoreBundles && process.env.ignoreBundles.split(',').map(function (item) {
    return item.trim();
  }) || [];
  return manifests.filter(function (manifest) {
    if (ignoreBundles.length && ignoreBundles.includes(manifest.name)) {
      _log["default"].warnConsole((0, _i18n.getI18nMessage)('install.ignore', {
        name: manifest.name
      }));

      return false;
    }

    return true;
  });
}

function traverseDownload(_x8, _x9, _x10) {
  return _traverseDownload.apply(this, arguments);
}

function _traverseDownload() {
  _traverseDownload = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(manifests, isGlobal, rootBundle) {
    var needDownload, installPath, items, limit;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            needDownload = [].concat(manifests).filter(function (manifest) {
              return !!manifest.url;
            });

            if (!(needDownload.length === 0)) {
              _context5.next = 3;
              break;
            }

            return _context5.abrupt("return", []);

          case 3:
            if (needDownload.length > 1) {
              _log["default"].infoConsole((0, _i18n.getI18nMessage)('install.downloadTotal', {
                length: needDownload.length
              }));
            }

            _state.State.getInstance().setState(_state.STATE.downloadCount, 0);

            _state.State.getInstance().setState(_state.STATE.downloadTotal, needDownload.length);

            installPath = isGlobal ? process.env.globalRepo : process.cwd();
            items = [];
            needDownload.forEach(function (manifest, i) {
              _events["default"].emit('hooks', {
                type: _events.EventTypes.beforeEachInstall,
                name: manifest.name
              });

              var nameInfo = (0, _helpers.parseScopeName)(manifest.name);

              var dirPath = _path["default"].resolve(_path["default"].join(installPath, _constant.DEP_FOLDER_NAME, nameInfo.scope, nameInfo.name));

              (0, _repository.createDirIfNotExists)(dirPath);
              manifest.path = dirPath;
              items.push([manifest, isGlobal]);
            }); // //默认4个批量执行(1~10之间)

            limit = process.env.batchDownloadLimit ? process.env.batchDownloadLimit : 4;
            limit = parseInt(limit) ? parseInt(limit) : 4;
            limit = limit > 10 ? 10 : limit < 1 ? 1 : limit;
            _context5.next = 14;
            return (0, _tasks.runChunks)(items, downloadTask, limit);

          case 14:
            return _context5.abrupt("return", needDownload);

          case 15:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));
  return _traverseDownload.apply(this, arguments);
}

function downloadTask(args) {
  return _repository.bundleDownload.apply(void 0, _toConsumableArray(args));
}

function checkDependencyPath(filePath) {
  if (_fs["default"].existsSync(_path["default"].resolve(filePath))) {
    return filePath;
  }

  return '';
}

function copyBundleToRepo(_x11, _x12, _x13) {
  return _copyBundleToRepo.apply(this, arguments);
}

function _copyBundleToRepo() {
  _copyBundleToRepo = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(filePath, repo, rootBundle) {
    var newTmpDir, resolvedPath, bundle, manifest, fileName, nameInfo, repoPath, dirPath, preInstallCmd, installCmd;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            resolvedPath = _path["default"].resolve(filePath);

            if (!_fs["default"].lstatSync(resolvedPath).isFile()) {
              _context6.next = 8;
              break;
            }

            newTmpDir = _path["default"].join(_os["default"].tmpdir(), "dependency-".concat(Date.now()));
            (0, _helpers.runShellCmd)(function (shell) {
              return shell.mkdir('-p', newTmpDir);
            });
            _context6.next = 6;
            return (0, _extract.extract)(resolvedPath, newTmpDir, {
              silent: true
            });

          case 6:
            _context6.next = 9;
            break;

          case 8:
            newTmpDir = resolvedPath;

          case 9:
            bundle = _bundle.Bundle.from(newTmpDir);
            manifest = bundle.manifest;

            _i18n["default"].log('install.installingTar', {
              name: manifest.name
            });

            (0, _pack.packBundle)(bundle, {
              silent: true
            });
            fileName = "".concat(bundle.id, ".tgz");
            nameInfo = (0, _helpers.parseScopeName)(manifest.name);
            repoPath = repo.path || repo.globalRepoPath;
            dirPath = _path["default"].resolve(_path["default"].join(repoPath, nameInfo.scope, nameInfo.name));
            (0, _repository.createDirIfNotExists)(dirPath);
            preInstallCmd = manifest.scripts(_constant.Hooks.preInstall);

            if (preInstallCmd) {
              (0, _helpers.runCmdWithSpawnSync)(function (spawnSync) {
                return spawnSync(preInstallCmd, {
                  shell: process.env.shellPath,
                  env: rootBundle.vars.env,
                  cwd: dirPath,
                  stdio: 'inherit'
                });
              });
            }

            _events["default"].emit('hooks', {
              type: _events.EventTypes.beforeEachInstall,
              name: manifest.name
            });

            _context6.next = 23;
            return (0, _extract.extract)(fileName, dirPath, {
              silent: true
            });

          case 23:
            (0, _helpers.runShellCmd)(function (shell) {
              return shell.rm('-rf', fileName);
            });
            installCmd = manifest.scripts('install') || manifest.scripts(_constant.Hooks.afterInstall);

            if (installCmd) {
              (0, _helpers.runCmdWithSpawnSync)(function (spawnSync) {
                return spawnSync(installCmd, {
                  shell: process.env.shellPath,
                  env: rootBundle.vars.env,
                  cwd: dirPath,
                  stdio: 'inherit'
                });
              });
            }

            _events["default"].emit('hooks', {
              type: _events.EventTypes.afterEachInstall,
              name: manifest.name,
              path: dirPath
            });

            _i18n["default"].log('install.installTarFinished', {
              name: manifest.name
            });

            if (_fs["default"].lstatSync(resolvedPath).isFile() && _fs["default"].existsSync(newTmpDir)) {
              (0, _helpers.runShellCmd)(function (shell) {
                return shell.rm('-rf', newTmpDir);
              });
            }

            return _context6.abrupt("return", bundle);

          case 30:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));
  return _copyBundleToRepo.apply(this, arguments);
}