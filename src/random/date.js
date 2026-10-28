import helper from './helper.js';

/**
 * 将 date 转化为指定格式的String
 * 月(M)、周(w)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 * formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss.S') ==> 2006-07-02 08:09:04.423
 * formatDate(new Date(), 'yyyy-M-d h:m:s.S')      ==> 2006-7-2 8:9:4.18
 * @param {Date|string|number} date
 * @param {string} fmt
 * @returns {string}
 */
export function formatDate(date, fmt = 'yyyy-MM-dd hh:mm:ss') {
  if (Object.prototype.toString.call(date) !== '[object Date]') {
    date = new Date(date);
  }
  if (isNaN(date.getTime())) {
    date = new Date();
  }

  const o = {
    M: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    m: date.getMinutes(),
    s: date.getSeconds(),
    q: Math.floor(date.getMonth() / 3) + 1,
    S: date.getMilliseconds(),
  };

  // 计算周数（当年第几周）
  let weekNum = 0;
  if (/w+/.test(fmt)) {
    const year = date.getFullYear();
    const firstDay = new Date(year, 0, 1);
    // 当年第一天是星期几（0=周日, 1=周一, ..., 6=周六）
    const firstDayOfWeek = firstDay.getDay();
    // 当年第一个周一的日期
    const firstMonday = new Date(year, 0, 1 + (firstDayOfWeek === 0 ? 1 : (8 - firstDayOfWeek) % 7));
    // 目标日期与第一个周一之间的毫秒差
    const diffMs = date.getTime() - firstMonday.getTime();
    // 第几周（从1开始）
    weekNum = diffMs < 0 ? 1 : Math.floor(diffMs / 604800000) + 1;
    o.w = weekNum;
  }

  // 年：匹配 1~4 个 y
  const yearMatch = /(y+)/.exec(fmt);
  if (yearMatch) {
    const yearStr = String(date.getFullYear());
    const len = yearMatch[1].length;
    fmt = fmt.replace(yearMatch[1], yearStr.slice(-Math.min(len, 4)));
  }

  // 其他占位符：逐个匹配连续出现的相同字母
  for (const k in o) {
    const reg = new RegExp(`(${k}+)`);
    const match = reg.exec(fmt);
    if (!match) {
      continue;
    }
    const len = match[1].length;
    const val = String(o[k]);
    fmt = fmt.replace(match[1], len === 1 ? val : val.padStart(len, '0'));
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