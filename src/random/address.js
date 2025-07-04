import DICT from './address-dict.js';
import helper from './helper.js';
import basic from './basic.js';

const REGION = ['东北', '华北', '华东', '华中', '华南', '西南', '西北'];

/**
 * 随机生成一个大区
 * @returns {string}
 */
function region() {
  return helper.pick(REGION);
}

/**
 * 随机生成一个省或直辖市、自治区、特别行政区
 * @returns {string}
 */
function province() {
  return helper.pick(DICT).name;
}

/**
 * 随机生成一个市
 * @param {boolean} [prefix]
 * @param {string} [delimiter='-']
 * @returns {string}
 */
function city(prefix, delimiter = '-') {
  let province = helper.pick(DICT);
  let city = helper.pick(province.children);
  return prefix ? [province.name, city.name].join(delimiter) : city.name;
}

/**
 * 随机生成一个区或县
 * @param {boolean} [prefix]
 * @param {string} [delimiter='-']
 * @returns {string}
 */
function county(prefix, delimiter = '-') {
  let province = helper.pick(DICT);
  let city = helper.pick(province.children);
  let county = helper.pick(city.children) ?? {
    name: '-',
  };
  return prefix ? [province.name, city.name, county.name].join(delimiter) : county.name;
}

/**
 * 随机生成一个邮政编码
 * @param {number} [len=6]
 * @returns {string}
 */
function zip(len = 6) {
  let zip = '';
  for (let i = 0; i < len; i++) {
    zip += basic.int(0, 9);
  }
  return zip;
}

export default {
  region,
  province,
  city,
  county,
  zip,
};