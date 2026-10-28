import DICT from './address-dict.js';
import basic from './basic.js';
import date from './date.js';
import helper from './helper.js';

/**
 * 随机生成 GUID（非标准RFC4122，仅占位随机串）
 * @returns {string}
 */
function guid() {
  const pool = 'abcdefABCDEF1234567890';
  return [
    basic.string(pool, 8),
    basic.string(pool, 4),
    basic.string(pool, 4),
    basic.string(pool, 4),
    basic.string(pool, 12),
  ].join('-');
}

/**
 * guid 别名
 * @returns {string}
 */
function uuid() {
  return guid();
}

/**
 * 随机生成18位中国大陆身份证号
 * 结构：6位地址码 + 8位出生日期 + 3位顺序码 + 1位校验码
 * @returns {string}
 */
function id() {
  // 加权因子
  const weight = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  // 校验码映射表
  const checkCodeMap = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

  const addrItem = helper.pick(DICT);
  const prefix = addrItem.id;
  const birth = date.date('yyyyMMdd');
  const serial = basic.string('number', 3);
  const id17 = prefix + birth + serial;

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += Number(id17[i]) * weight[i];
  }
  const checkCode = checkCodeMap[sum % 11];

  return id17 + checkCode;
}

/**
 * 全局自增id，类似数据库自增主键
 * @param {number} [step=1] 步长
 * @returns {number}
 */
const increment = (() => {
  let current = 0;
  return (step) => {
    current += Number(step) || 1;
    return current;
  };
})();

/**
 * increment 别名
 * @param {number} [step=1]
 * @returns {number}
 */
function inc(step) {
  return increment(step);
}

export default {
  guid,
  uuid,
  id,
  increment,
  inc,
};
