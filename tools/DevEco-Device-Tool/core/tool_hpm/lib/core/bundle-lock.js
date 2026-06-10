"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BundleLock = void 0;

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _manifest = require("./manifest");

var _helpers = require("../utils/helpers");

var _i18n = require("../i18n");

var _api = require("../utils/api");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

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

var _name = /*#__PURE__*/new WeakMap();

var _version = /*#__PURE__*/new WeakMap();

var _manifests = /*#__PURE__*/new WeakMap();

var BundleLock = /*#__PURE__*/function () {
  function BundleLock(name, version, manifests) {
    _classCallCheck(this, BundleLock);

    _classPrivateFieldInitSpec(this, _name, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _version, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _manifests, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldSet(this, _name, name);

    _classPrivateFieldSet(this, _version, version);

    _classPrivateFieldSet(this, _manifests, manifests);
  }

  _createClass(BundleLock, [{
    key: "name",
    get: function get() {
      return _classPrivateFieldGet(this, _name);
    }
  }, {
    key: "version",
    get: function get() {
      return _classPrivateFieldGet(this, _version);
    }
  }, {
    key: "manifests",
    get: function get() {
      return _classPrivateFieldGet(this, _manifests) || [];
    }
  }, {
    key: "findManifest",
    value: function findManifest(name) {
      return this.manifests.find(function (m) {
        return m.name === name;
      });
    }
  }, {
    key: "addOrUpdate",
    value: function addOrUpdate() {
      var _this = this;

      var manifests = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      manifests.forEach(function (m) {
        var index = _this.manifests.findIndex(function (mf) {
          return mf.name === m.name;
        });

        if (index >= 0) {
          _this.manifests.splice(index, 1, m);
        } else {
          _this.manifests.push(m);
        }
      });
    }
  }, {
    key: "remove",
    value: function remove() {
      var _this2 = this;

      var names = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      names.forEach(function (name) {
        var index = _this2.manifests.findIndex(function (mf) {
          return mf.name === name;
        });

        if (index >= 0) {
          _this2.manifests.splice(index, 1);
        }
      });
    }
  }, {
    key: "toJson",
    value: function toJson() {
      var json = {
        name: _classPrivateFieldGet(this, _name),
        version: _classPrivateFieldGet(this, _version)
      };
      json.dependencies = this.manifests.reduce(function (acc, manifest) {
        acc[manifest.name] = {
          version: manifest.version.version,
          url: manifest.url,
          checksum: manifest.checksum
        };

        if (manifest.dependencies && manifest.dependencies.length > 0) {
          acc[manifest.name].dependencies = manifest.json().dependencies;
        }

        return acc;
      }, {});
      return json;
    }
  }, {
    key: "saveToFile",
    value: function saveToFile(dir) {
      var json = this.toJson();

      var lockPath = _path["default"].join(dir, 'bundle-lock.json');

      if (_fs["default"].existsSync(lockPath)) {
        (0, _helpers.runShellCmd)(function (shell) {
          return shell.rm('-rf', lockPath);
        });
      }

      _fs["default"].writeFileSync(_path["default"].join(dir, 'bundle-lock.json'), JSON.stringify(json, null, 4));
    }
  }, {
    key: "isCompatible",
    value: function isCompatible() {
      var _this3 = this;

      var dependencies = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var ignoreList = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      if (this.manifests.length === 0) {
        return false;
      } // 检测外层依赖是否均在lock中


      var _iterator = _createForOfIteratorHelper(dependencies),
          _step;

      try {
        var _loop = function _loop() {
          var dep = _step.value;

          var found = _this3.manifests.find(function (m) {
            return m.name === dep.name;
          });

          if (!found || !dep.match(found)) {
            return {
              v: false
            };
          }
        };

        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _ret = _loop();

          if (_typeof(_ret) === "object") return _ret.v;
        } // 检查由外层依赖衍生出的依赖树，是否均在lock中

      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      var allDependencies = {};
      var lockedDependencies = {};
      this.manifests.map(function (m) {
        return m.name;
      }).sort();
      this.manifests.map(function (m) {
        return m.name;
      }).forEach(function (name) {
        return lockedDependencies[name] = true;
      });
      this.manifests.forEach(function (manifest) {
        if (!ignoreList.includes(manifest.name)) {
          allDependencies[manifest.name] = true;

          if (manifest.dependencies && manifest.dependencies.length > 0) {
            Object.keys(manifest.json().dependencies).forEach(function (name) {
              if (!ignoreList.includes(name)) {
                allDependencies[name] = true;
              }
            });
          }
        }
      });
      return Object.keys(allDependencies).sort().join() === Object.keys(lockedDependencies).sort().join();
    }
  }, {
    key: "resolve",
    value: function resolve(manifest, repo, rootManifest) {
      var _this4 = this;

      var localManifests = repo.manifests();
      var globalManifests = repo.globalManifests();
      var dependencies = manifest.getCompositeDependencies(rootManifest);
      var result = dependencies.map(function (d) {
        var found = localManifests && localManifests.find(function (rm) {
          return rm.name === d.name;
        });

        if (!found) {
          found = globalManifests && globalManifests.find(function (r) {
            return r.name === d.name;
          });
        }

        if (!found) {
          found = _this4.findManifest(d.name);
        }

        return found;
      });
      return result.filter(function (r) {
        return r;
      });
    }
  }]);

  return BundleLock;
}();

exports.BundleLock = BundleLock;

BundleLock.fromUrl = function (url) {
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
    return _fs["default"].readFileSync(_path["default"].join(url, 'bundle-lock.json'));
  }, function (e) {
    return new Error((0, _i18n.getI18nMessage)('bundleLock.readJsonError', {
      url: url,
      message: e.message
    }));
  });

  var json = _(function () {
    return JSON.parse(content);
  }, function (e) {
    return new Error((0, _i18n.getI18nMessage)('bundleLock.jsonParseError', {
      message: e.message
    }));
  });

  var manifests = _(function () {
    return Object.keys(json.dependencies || {}).map(function (key) {
      return _manifest.Manifest.json(_objectSpread({
        name: key
      }, json.dependencies[key]), {
        download: {
          addr: json.dependencies[key].url,
          checksum: json.dependencies[key].checksum
        }
      });
    });
  }, function (e) {
    return new Error((0, _i18n.getI18nMessage)('bundleLock.lockError', {
      error: e
    }));
  });

  return new BundleLock(json.name, json.version, getValidLockedManifests(manifests));
};

BundleLock.fromManifests = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(manifests) {
    var clone, mainManifest, completeManifests, inCompleteManifests, _i, _inCompleteManifests, manifest, remote;

    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(manifests && manifests.length > 0)) {
              _context.next = 17;
              break;
            }

            clone = [].concat(manifests);
            mainManifest = clone.pop();
            completeManifests = [];
            inCompleteManifests = [];
            clone.forEach(function (m) {
              if (!m.url || !m.checksum) {
                inCompleteManifests.push(m);
              } else {
                completeManifests.push(m);
              }
            });
            _i = 0, _inCompleteManifests = inCompleteManifests;

          case 7:
            if (!(_i < _inCompleteManifests.length)) {
              _context.next = 16;
              break;
            }

            manifest = _inCompleteManifests[_i];
            _context.next = 11;
            return (0, _api.getBundle)(manifest.name, manifest.version.version);

          case 11:
            remote = _context.sent;

            if (remote && remote[0]) {
              completeManifests.push(_manifest.Manifest.json(remote[0].manifest, {
                download: remote[0].download
              }));
            }

          case 13:
            _i++;
            _context.next = 7;
            break;

          case 16:
            return _context.abrupt("return", new BundleLock(mainManifest.name, mainManifest.version.version, getValidLockedManifests(completeManifests)));

          case 17:
            return _context.abrupt("return", null);

          case 18:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();

BundleLock.isExisted = function (dir) {
  return _fs["default"].existsSync(_path["default"].join(dir, 'bundle-lock.json'));
};

function getValidLockedManifests() {
  var manifests = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  return manifests.filter(function (m) {
    return m.name && m.version.version && m.url && m.checksum && !m.isSnapshot();
  });
}