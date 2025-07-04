import DICT from './address-dict.js';
import basic from './basic.js';
import date from './date.js';
import helper from './helper.js';

// Dice
function d4() {
  return basic.int(1, 4);
}

function d6() {
  return basic.int(1, 6);
}

function d8() {
  return basic.int(1, 8);
}

function d12() {
  return basic.int(1, 12);
}

function d20() {
  return basic.int(1, 20);
}

function d100() {
  return basic.int(1, 100);
}

/**
 * 随机生成一个 GUID
 * @returns {string}
 */
function guid() {
  let pool = 'abcdefABCDEF1234567890';
  return basic.string(pool, 8) + '-' +
    basic.string(pool, 4) + '-' +
    basic.string(pool, 4) + '-' +
    basic.string(pool, 4) + '-' +
    basic.string(pool, 12);
}

function uuid() {
  return guid();
}

/**
 * 随机生成一个 18 位身份证 地址码 6 + 出生日期码 8 + 顺序码 3 + 校验码 1
 * @returns {string}
 */
function id() {
  let id,
    sum = 0,
    rank = [
      '7', '9', '10', '5', '8', '4', '2', '1', '6', '3', '7', '9', '10', '5', '8', '4', '2',
    ],
    last = [
      '1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2',
    ];

  id = helper.pick(DICT).id +
    date.date('yyyyMMdd') +
    basic.string('number', 3);

  for (let i = 0; i < id.length; i++) {
    sum += id[i] * rank[i];
  }
  id += last[sum % 11];

  return id;
}

/**
 * 生成一个全局的自增整数。类似自增主键
 * @type {function(*): *}
 */
const increment = function() {
  let key = 0;
  return function(step) {
    return key += +step || 1;
  };
}();

function inc(step) {
  return increment(step);
}

export default {
  d4,
  d6,
  d8,
  d12,
  d20,
  d100,
  guid,
  uuid,
  id,
  increment,
  inc,
};