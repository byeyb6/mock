import {typeOf} from '../util.js';
import helper from './helper.js';

/**
 * 将 date 转化为指定格式的String
 * 月(M)、周(w)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 * formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss.S') ==> 2006-07-02 08:09:04.423
 * formatDate(new Date(), 'yyyy-M-d h:m:s.S')      ==> 2006-7-2 8:9:4.18
 * @param [date]
 * @param [fmt]
 * @returns String
 */
export function formatDate(date, fmt = 'yyyy-MM-dd hh:mm:ss') {
  if (typeOf(date) !== 'date') {
    date = new Date(date);
  }
  if (Number.isNaN(date.getTime())) {
    date = new Date();
  }
  let obj = {
    'y+': date.getFullYear(),
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    'S': date.getMilliseconds(),
  };
  if (/w+/.test(fmt)) {
    const firstDate = new Date(obj['y+'], 0, 1);
    let firstDayWeek = firstDate.getDay() + 1;
    const firstWeekMs = (7 - firstDayWeek) * 24 * 60 * 60 * 1000;
    const ms = date.getTime() - firstDate.getTime() - firstWeekMs;
    obj['w+'] = Math.floor(ms / 604800000) + 2;
  }
  for (let k in obj) {
    const rst = new RegExp(k).exec(fmt);
    if (!rst) {
      continue;
    }
    if (k === 'S') {
      fmt = fmt.replace('S', obj.S + '');
    } else {
      const str = (obj[k] + '').padStart(4, '0');
      fmt = fmt.replace(rst[0], str.substring(4 - rst[0].length, 4));
    }
  }
  return fmt;
}

/**
 * 生成一个随机的 Date 对象
 * @param {Date} [min]
 * @param {Date} [max]
 * @returns {Date}
 * @private
 */
function _randomDate(min, max) {
  min = min === undefined ? new Date(0) : min;
  max = max === undefined ? new Date() : max;
  return new Date(min.getTime() + Math.random() * (max.getTime() - min.getTime()));
}

/**
 * 返回一个随机的日期字符串
 * @param {string} [format]
 * @returns {String}
 */
function date(format = 'yyyy-MM-dd') {
  return formatDate(_randomDate(), format);
}

/**
 * 返回一个随机的时间字符串
 * @param {string} [format]
 * @returns {String}
 */
function time(format = 'hh:mm:ss') {
  return formatDate(_randomDate(), format);
}

/**
 * 返回一个随机的日期和时间字符串
 * @param {string} [format]
 * @returns {String}
 */
function datetime(format = 'yyyy-MM-dd hh:mm:ss') {
  return formatDate(_randomDate(), format);
}

/**
 * 返回当前的日期和时间字符串
 * @param {string} [format]
 * @returns {String}
 */
function now(format = 'yyyy-MM-dd hh:mm:ss') {
  return formatDate(new Date(), format);
}

/**
 * 返回一个随机星座
 * @returns {string}
 */
function constellation() {
  const constellations = [
    '白羊座',
    '金牛座',
    '双子座',
    '巨蟹座',
    '狮子座',
    '处女座',
    '天秤座',
    '天蝎座',
    '射手座',
    '摩羯座',
    '水瓶座',
    '双鱼座',
  ];
  return helper.pick(constellations);
}

export default {
  date,
  time,
  datetime,
  now,
  constellation,
};