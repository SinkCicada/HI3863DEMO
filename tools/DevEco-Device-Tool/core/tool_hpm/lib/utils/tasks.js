"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.runAll = runAll;
exports.runChunks = runChunks;
exports.runSeries = runSeries;

/*
 * Copyright (c) 2020-2021 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * 一次性执行所有任务
 * @param {*} items 任务清单
 * @param {*} fn 执行任务的函数
 * @returns 
 */
function runAll(items, fn) {
  var promises = items.map(function (item) {
    return fn(item);
  });
  return Promise.all(promises);
}
/**
 * 逐条执行任务
 * @param {*} items  任务清单
 * @param {*} fn 执行任务的函数
 * @returns 
 */


function runSeries(items, fn) {
  var result = [];
  return items.reduce(function (acc, item) {
    acc = acc.then(function () {
      return fn(item).then(function (res) {
        return result.push(res);
      });
    });
    return acc;
  }, Promise.resolve()).then(function () {
    return result;
  });
}
/**
 * 分批次执行任务
 * @param {*} items  任务清单
 * @param {*} fn 执行任务的函数
 * @param {*} chunkSize 分批单位数量
 * @returns 
 */


function runChunks(items, fn) {
  var chunkSize = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;
  var result = [];
  var chunks = splitToChunks(items, chunkSize);
  return runSeries(chunks, function (chunk) {
    return runAll(chunk, fn).then(function (res) {
      return result = result.concat(res);
    });
  }).then(function () {
    return result;
  });
}
/**
 * 拆分任务
 * @param {*} items 任务清单
 * @param {*} chunkSize 分批单位数量
 * @returns 
 */


function splitToChunks(items) {
  var chunkSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 4;
  var result = [];

  for (var i = 0; i < items.length; i += chunkSize) {
    result.push(items.slice(i, i + chunkSize));
  }

  return result;
}