"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.build = build;
exports.bundleBuild = bundleBuild;
exports.getValidBuildCmd = getValidBuildCmd;
exports.startBuild = startBuild;

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _worker_threads = require("worker_threads");

var _bundle = require("../core/bundle");

var _constant = require("../constant/constant");

var _repository = require("../core/repository");

var _helpers = require("../utils/helpers");

var _config = require("../utils/config");

var _i18n = _interopRequireWildcard(require("../i18n"));

var _log = _interopRequireDefault(require("../core/log"));

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

function build(_x, _x2) {
  return _build.apply(this, arguments);
}

function _build() {
  _build = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(commanderObj, _ref) {
    var customizeArgs, startBundle, repo;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            customizeArgs = _ref.args;
            startBundle = _bundle.Bundle.from(process.cwd());
            repo = new _repository.Repository(_path["default"].join(process.cwd(), _constant.DEP_FOLDER_NAME), (0, _config.getGlobalRepo)());
            _context2.next = 5;
            return startBuild(startBundle, repo, true, customizeArgs);

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _build.apply(this, arguments);
}

var buildCnt = 0;
var needBuildCnt = 0;

function startBuild(startBundle, repo) {
  var useMultipleThread = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var customizeArgs = arguments.length > 3 ? arguments[3] : undefined;
  return new Promise( /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(resolve, reject) {
      var bundles, _initDependenciesMap, dependencies, dependents, nameToBundle, _iterator, _step, bundle;

      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return startBundle.build(repo);

            case 2:
              bundles = _context.sent;
              // 41个组件的情况，从开头到这里都需要很长时间11s，什么情况
              _initDependenciesMap = (0, _helpers.initDependenciesMap)(bundles), dependencies = _initDependenciesMap.dependencies, dependents = _initDependenciesMap.dependents;
              nameToBundle = (0, _bundle.getNameToBundle)(bundles);
              needBuildCnt = bundles.length;

              _events["default"].emit('hooks', {
                type: _events.EventTypes.beforeAllBuild
              });

              _iterator = _createForOfIteratorHelper(bundles);

              try {
                for (_iterator.s(); !(_step = _iterator.n()).done;) {
                  bundle = _step.value;

                  if (useMultipleThread) {
                    if (dependencies.get(bundle.name).size === 0) {
                      startBuildThread(bundle, startBundle.id, dependencies, dependents, nameToBundle, resolve, reject, customizeArgs);
                    }
                  } else {
                    bundleBuild(bundle, bundle.name === startBundle.name, customizeArgs);
                    resolve();
                  }
                }
              } catch (err) {
                _iterator.e(err);
              } finally {
                _iterator.f();
              }

            case 9:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x3, _x4) {
      return _ref2.apply(this, arguments);
    };
  }()).then(function () {
    _i18n["default"].log('build.success');
  }, function (error) {
    process.exitCode = -1;

    _i18n["default"].log('build.error', {
      error: error
    });

    _log["default"].debug(error);
  })["finally"](function () {
    _events["default"].emit('hooks', {
      type: _events.EventTypes.afterAllBuild
    });
  });
}

function startBuildThread(couldStartBundle, firstStartBundleId, dependencies, dependents, nameToBundle, resolve, reject, customizeArgs) {
  var threadEntryFile = _path["default"].join(__dirname, '..', 'thread', 'buildEntry.js');

  _events["default"].emit('hooks', {
    type: _events.EventTypes.beforeEachBuild,
    name: couldStartBundle.name,
    path: couldStartBundle.path
  });

  var worker = new _worker_threads.Worker(threadEntryFile, {
    workerData: {
      // 不可以直接传整个bundle进去，因为没法clone给子对象
      bundlePath: couldStartBundle.path,
      isStartBundle: couldStartBundle.id === firstStartBundleId,
      bundleVarValues: couldStartBundle.vars.values,
      customizeArgs: customizeArgs
    }
  });
  worker.on('exit', function (errCode) {
    if (errCode === 0) {
      _events["default"].emit('hooks', {
        type: _events.EventTypes.afterEachBuild,
        name: couldStartBundle.name,
        path: couldStartBundle.path
      });

      if (++buildCnt === needBuildCnt) {
        resolve();
        return;
      }

      var _iterator2 = _createForOfIteratorHelper(dependents.get(couldStartBundle.name)),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var dependentBuncle = _step2.value;
          // 遍历所有依赖此bundle的bundle
          dependencies.get(dependentBuncle)["delete"](couldStartBundle.name);

          if (dependencies.get(dependentBuncle).size === 0) {
            // 所有依赖都安装好了
            startBuildThread(nameToBundle.get(dependentBuncle), firstStartBundleId, dependencies, dependents, nameToBundle, resolve, reject, customizeArgs);
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    } else {
      reject((0, _i18n.getI18nMessage)('error.workerStop', {
        errCode: errCode
      }));
    }
  });
}

function bundleBuild(bundle, isStartBundle, customizeArgs) {
  var build = getValidBuildCmd(bundle);

  if (build) {
    var preBuildCmd = bundle.scripts(_constant.Hooks.preBuild);

    if (preBuildCmd) {
      (0, _helpers.runCmdWithSpawnSync)(function (spawnSync) {
        return spawnSync(preBuildCmd, {
          shell: process.env.shellPath,
          env: bundle.vars.env,
          cwd: bundle.path,
          stdio: 'inherit'
        });
      });
    }

    _i18n["default"].log('build.building', {
      name: bundle.manifest.name
    });

    copySegment(bundle);
    linkSegment(bundle);

    if (isStartBundle && customizeArgs && customizeArgs.length > 0) {
      build = "".concat(build, " ").concat(customizeArgs.join(" "));
    }

    (0, _helpers.runCmdWithSpawnSync)(function (spawnSync) {
      return spawnSync(build, {
        cwd: bundle.path,
        env: bundle.vars.env,
        shell: process.env.shellPath,
        stdio: 'inherit'
      });
    });

    if (!process.exitCode) {
      _i18n["default"].log('build.complete', {
        name: bundle.manifest.name
      });

      var afterBuildCmd = bundle.scripts(_constant.Hooks.afterBuild);

      if (afterBuildCmd) {
        (0, _helpers.runCmdWithSpawnSync)(function (spawnSync) {
          return spawnSync(afterBuildCmd, {
            shell: process.env.shellPath,
            env: bundle.vars.env,
            cwd: bundle.path,
            stdio: 'inherit'
          });
        });
      }
    }
  }
}

function getValidBuildCmd(bundle) {
  if (bundle.isPublishAs('code-segment')) return null;
  var build = bundle.scripts('build');
  if (!build && bundle.isPublishAs('source')) throw (0, _i18n.getI18nMessage)('build.needScripts', {
    name: bundle.manifest.name
  });
  if (build && typeof build !== 'string') throw (0, _i18n.getI18nMessage)('build.shouldBeCommand', {
    name: bundle.manifest.name
  });
  return build;
}

function copySegment(bundle) {
  var dirs = bundle.copy();
  Object.keys(dirs).forEach(function (key) {
    _i18n["default"].log('build.copyDir', {
      from: dirs[key],
      to: key
    });

    if (!bundle.vars.env || !bundle.vars.env[_constant.DEP_OHOS_BUNDLES] && !bundle.vars.env.globalRepo) {
      throw (0, _i18n.getI18nMessage)('common.noFolder', {
        folderPath: _constant.DEP_FOLDER_NAME
      });
    }

    var source = _path["default"].join(bundle.vars.env[_constant.DEP_OHOS_BUNDLES], dirs[key]);

    if (!_fs["default"].existsSync(source)) {
      source = _path["default"].join(bundle.vars.env.globalRepo, _constant.DEP_FOLDER_NAME, dirs[key]);
    }

    if (_fs["default"].lstatSync(source).isDirectory()) {
      source = _path["default"].join(source, _path["default"].sep, '*');
    }

    var target = _path["default"].join(bundle.path, key);

    (0, _helpers.runShellCmd)(function (shell) {
      return shell.mkdir('-p', target);
    });
    (0, _helpers.runShellCmd)(function (shell) {
      return shell.cp('-R', source, target);
    });
  });
}

function linkSegment(bundle) {
  var dirs = bundle.link();
  dirs.forEach(function (_ref3) {
    var source = _ref3.source,
        target = _ref3.target;

    _i18n["default"].log('build.linkDir', {
      from: source,
      to: target
    });

    if (!bundle.vars.env || !bundle.vars.env[_constant.DEP_OHOS_BUNDLES] && !bundle.vars.env.globalRepo) {
      throw (0, _i18n.getI18nMessage)('common.noFolder', {
        folderPath: _constant.DEP_FOLDER_NAME
      });
    }

    var sourcePath = _path["default"].join(bundle.vars.env[_constant.DEP_OHOS_BUNDLES], source);

    if (!_fs["default"].existsSync(sourcePath)) {
      sourcePath = _path["default"].join(bundle.vars.env.globalRepo, _constant.DEP_FOLDER_NAME, source);
    }

    var targetPath = _path["default"].join(bundle.path, target);

    var targetParent = _path["default"].parse(targetPath);

    if (targetParent.dir) {
      (0, _helpers.runShellCmd)(function (shell) {
        return shell.mkdir('-p', targetParent.dir);
      });
    }

    (0, _helpers.runShellCmd)(function (shell) {
      return shell.ln('-sf', sourcePath, targetPath);
    });
  });
}