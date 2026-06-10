"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderInfo = exports.renderData = exports.querySolutions = exports.query = exports.pageSearch = void 0;
exports.search = search;

var _inquirer = require("inquirer");

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _semver = _interopRequireDefault(require("semver"));

var _axios = require("../utils/axios");

var _helpers = require("../utils/helpers");

var _i18n = _interopRequireWildcard(require("../i18n"));

var _preference = _interopRequireDefault(require("../core/preference"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

//兼容历史数据
var boardMap = {
  'hispark_pegasus': 'hispark_pegasus,hi3861',
  'hispark_taurus': 'hispark_taurus,hi3516',
  'hispark_aries': 'hispark_aries,hi3518',
  'gr5515_sk': 'gr5515_sk,goodix',
  'v200zr': 'v200zr,fnlink'
};

function search(_x, _x2) {
  return _search.apply(this, arguments);
}

function _search() {
  _search = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(searchKey, _ref) {
    var _ref$pageSize, pageSize, withJson, type, _ref$currentPage, currentPage, ver, kernel, board, osVersion, matchBy, currentPageNum, pageSizeNum, params, queryAction;

    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _ref$pageSize = _ref.pageSize, pageSize = _ref$pageSize === void 0 ? 10 : _ref$pageSize, withJson = _ref.json, type = _ref.type, _ref$currentPage = _ref.currentPage, currentPage = _ref$currentPage === void 0 ? 1 : _ref$currentPage, ver = _ref.ver, kernel = _ref.kernel, board = _ref.board, osVersion = _ref.osVersion;
            matchBy = [];

            if (searchKey) {
              matchBy.push({
                field: 'name',
                opt: 'CONTAIN',
                value: searchKey
              });
            }

            if (type && type != "solution") {
              matchBy.push({
                field: 'publishAs',
                opt: 'EQUAL',
                value: type
              });
            }

            if (type != "solution" && ver && (ver === 'latest' || ver === 'all' || _semver["default"].validRange(ver))) {
              matchBy.push({
                field: 'version',
                opt: 'EQUAL',
                value: ver
              });
            }

            if (kernel) {
              matchBy.push({
                field: 'ohos.kernel',
                opt: 'IN',
                value: kernel
              });
            }

            if (board) {
              matchBy.push({
                field: 'ohos.board',
                opt: 'IN',
                value: boardMap[board] || board
              });
            }

            if (osVersion) {
              matchBy.push({
                field: 'ohos.os',
                opt: 'IN',
                value: osVersion
              });
            }

            currentPageNum = Number(currentPage);
            pageSizeNum = Number(pageSize);
            params = {
              pageSize: pageSizeNum,
              condition: JSON.stringify({
                matchBy: matchBy
              }),
              currentPage: currentPageNum
            };
            queryAction = type === 'solution' ? querySolutions : query;
            _context5.next = 14;
            return pageSearch({
              query: queryAction,
              searchKey: searchKey,
              condition: params.condition,
              currentPage: currentPageNum,
              totalPage: Infinity,
              pageSize: pageSizeNum,
              withJson: withJson,
              type: type
            });

          case 14:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));
  return _search.apply(this, arguments);
}

var query = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(searchKey, params) {
    var _yield$axios$get, data;

    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return _axios.axios.get(_helpers.URL.search(searchKey), {
              params: params
            });

          case 2:
            _yield$axios$get = _context.sent;
            data = _yield$axios$get.data.data;
            return _context.abrupt("return", {
              data: data.datas,
              totalSize: data.total
            });

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function query(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

exports.query = query;

var querySolutions = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(searchKey, params) {
    var _yield$axios$get2, data;

    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return _axios.axios.get(_helpers.URL.searchSolution(searchKey), {
              params: params
            });

          case 2:
            _yield$axios$get2 = _context2.sent;
            data = _yield$axios$get2.data.data;
            return _context2.abrupt("return", {
              data: data.datas,
              totalSize: data.total
            });

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function querySolutions(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

exports.querySolutions = querySolutions;

var pageSearch = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(_ref4) {
    var query, searchKey, condition, currentPage, totalPage, pageSize, withJson, type, nextTotalPage, _yield$query, data, totalSize, mapAction, renderKey, doUserAction;

    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            query = _ref4.query, searchKey = _ref4.searchKey, condition = _ref4.condition, currentPage = _ref4.currentPage, totalPage = _ref4.totalPage, pageSize = _ref4.pageSize, withJson = _ref4.withJson, type = _ref4.type;
            nextTotalPage = totalPage;

            if (!(currentPage <= nextTotalPage)) {
              _context4.next = 13;
              break;
            }

            _context4.next = 5;
            return query(searchKey, {
              pageSize: pageSize,
              condition: condition,
              curPage: currentPage
            });

          case 5:
            _yield$query = _context4.sent;
            data = _yield$query.data;
            totalSize = _yield$query.totalSize;
            addDefaultTemplateIntoData(data, currentPage, type);
            mapAction = type === 'solution' ? mapRenderSolution : mapRender;
            renderKey = type === 'solution' ? ['name', 'bundleName', 'remark'] : ['name', 'version', 'description'];
            renderData(data, searchKey, withJson, mapAction, renderKey);
            nextTotalPage = Math.ceil(totalSize / pageSize);

          case 13:
            doUserAction = /*#__PURE__*/function () {
              var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
                var _yield$prompt, userAction;

                return _regeneratorRuntime().wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        _context3.next = 2;
                        return (0, _inquirer.prompt)([{
                          type: 'input',
                          message: "".concat(renderInfo(currentPage, nextTotalPage)),
                          name: 'userAction'
                        }]);

                      case 2:
                        _yield$prompt = _context3.sent;
                        userAction = _yield$prompt.userAction;
                        _context3.t0 = userAction;
                        _context3.next = _context3.t0 === 'n' ? 7 : _context3.t0 === 'p' ? 16 : _context3.t0 === 'q' ? 25 : 27;
                        break;

                      case 7:
                        if (!(currentPage > nextTotalPage)) {
                          _context3.next = 13;
                          break;
                        }

                        _i18n["default"].log('search.noMoreResult');

                        _context3.next = 11;
                        return doUserAction();

                      case 11:
                        _context3.next = 15;
                        break;

                      case 13:
                        _context3.next = 15;
                        return pageSearch({
                          query: query,
                          searchKey: searchKey,
                          condition: condition,
                          currentPage: Math.max(1, Math.min(currentPage + 1, nextTotalPage + 1)),
                          totalPage: nextTotalPage,
                          pageSize: pageSize,
                          type: type
                        });

                      case 15:
                        return _context3.abrupt("break", 30);

                      case 16:
                        if (!(currentPage === 1)) {
                          _context3.next = 22;
                          break;
                        }

                        _i18n["default"].log('search.onFirstPage');

                        _context3.next = 20;
                        return doUserAction();

                      case 20:
                        _context3.next = 24;
                        break;

                      case 22:
                        _context3.next = 24;
                        return pageSearch({
                          query: query,
                          searchKey: searchKey,
                          condition: condition,
                          currentPage: Math.max(1, Math.min(currentPage - 1, nextTotalPage)),
                          totalPage: nextTotalPage,
                          pageSize: pageSize,
                          type: type
                        });

                      case 24:
                        return _context3.abrupt("break", 30);

                      case 25:
                        _i18n["default"].log('search.quit');

                        return _context3.abrupt("return");

                      case 27:
                        _context3.next = 29;
                        return doUserAction();

                      case 29:
                        return _context3.abrupt("break", 30);

                      case 30:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, _callee3);
              }));

              return function doUserAction() {
                return _ref6.apply(this, arguments);
              };
            }();

            if (withJson) {
              _context4.next = 17;
              break;
            }

            _context4.next = 17;
            return doUserAction();

          case 17:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function pageSearch(_x7) {
    return _ref5.apply(this, arguments);
  };
}();

exports.pageSearch = pageSearch;

var renderInfo = function renderInfo(currentPage, totalPage) {
  if (currentPage > totalPage) {
    return (0, _i18n.getI18nMessage)('search.lastPage');
  }

  if (currentPage === 1) {
    return (0, _i18n.getI18nMessage)('search.firstPage');
  }

  return (0, _i18n.getI18nMessage)('search.middlePage');
};

exports.renderInfo = renderInfo;

var renderData = function renderData(currentResultList, searchKey, withJson) {
  var mapAction = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : mapRender;
  var renderKey = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : ['name', 'version', 'description'];

  if (currentResultList instanceof Array && currentResultList.length > 0) {
    withJson ? console.log(JSON.stringify(currentResultList, null, 4)) : console.table(currentResultList.map(mapAction), renderKey);
  } else {
    _i18n["default"].log('search.noResult', {
      searchKey: searchKey ? "\"".concat(searchKey, "\"") : ''
    });
  }

  withJson ? console.log('') : _i18n["default"].log('search.moreInfo');
};

exports.renderData = renderData;

function mapRender(_ref7) {
  var name = _ref7.name,
      version = _ref7.version,
      description = _ref7.manifest.description;
  return {
    name: (0, _helpers.tableColumnRender)(name, 30),
    version: (0, _helpers.tableColumnRender)(version, 20),
    description: (0, _helpers.tableColumnRender)(description || (0, _i18n.getI18nMessage)('common.noDescription'), 50)
  };
}

function mapRenderSolution(_ref8) {
  var name = _ref8.name,
      enName = _ref8.enName,
      remark = _ref8.remark,
      enRemark = _ref8.enRemark,
      bundleName = _ref8.bundleName;

  var lang = _preference["default"].get('lang');

  var realName = lang === 'en' ? enName || name : name || enName;
  var realRemark = lang === 'en' ? enRemark || remark : remark || enRemark;
  return {
    name: (0, _helpers.tableColumnRender)(realName, 20),
    bundleName: (0, _helpers.tableColumnRender)(bundleName, 30),
    remark: (0, _helpers.tableColumnRender)(realRemark, 22)
  };
}

function addDefaultTemplateIntoData(data, currentPage, type) {
  if (type === 'template' && currentPage === 1 && data instanceof Array) {
    var templatePath = _path["default"].join(__dirname, '..', 'asset', 'template', 'default');

    var dirs = _fs["default"].readdirSync(templatePath);

    dirs.forEach(function (d) {
      var jsonPath = _path["default"].join(templatePath, d);

      var parsed = _path["default"].parse(d);

      if (parsed.name && parsed.ext === ".json" && _fs["default"].existsSync(jsonPath)) {
        var json = JSON.parse(_fs["default"].readFileSync(jsonPath));
        data.unshift({
          name: json.name,
          version: 'latest',
          manifest: {
            description: json.description
          }
        });
      }
    });
  }
}