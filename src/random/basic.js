/**
 * 返回一个随机的布尔值
 * @param {number|string} [min]
 * @param {number|string} [max]
 * @param {boolean} [cur]
 * @returns {boolean}
 */
function boolean(min, max, cur) {
  if (/^(true|false)$/.test(min)) {
    return min !== 'false' && min !== false;
  }
  if (/^(true|false)$/.test(cur)) {
    min = Number.parseInt(min);
    if (isNaN(min)) {
      min = 1;
    }
    max = Number.parseInt(max);
    if (isNaN(max)) {
      max = 1;
    }
    return Math.random() > min / (min + max) ? !cur : !!cur;
  }
  return Math.random() >= 0.5;
}

function bool(min, max, cur) {
  return boolean(min, max, cur);
}

/**
 * 返回一个随机的自然数(≥0的整数)
 * @param {number} [min]
 * @param {number} [max]
 * @returns {number}
 */
function natural(min, max) {
  min = Number.parseInt(min + '');
  max = Number.parseInt(max + '');
  if (isNaN(min)) {
    min = 0;
    max = 9007199254740992;
  } else if (isNaN(max)) {
    max = 9007199254740992;
  } else {
    if (min > max) {
      [min, max] = [max, min];
    }
  }
  if (min < 0) {
    min = 0;
  }
  if (max < 0) {
    max = 0;
  }
  return Math.round(Math.random() * (max - min)) + min;
}

/**
 * 返回一个随机的整数
 * @param {number} [min]
 * @param {number} [max]
 * @returns {number}
 */
function integer(min, max) {
  min = Number.parseInt(min + '');
  max = Number.parseInt(max + '');
  if (isNaN(min)) {
    min = -9007199254740992;
    max = 9007199254740992;
  } else if (isNaN(max)) {
    max = 9007199254740992;
  } else {
    if (min > max) {
      [min, max] = [max, min];
    }
  }
  return Math.round(Math.random() * (max - min)) + min;
}

function int(min, max) {
  return integer(min, max);
}

/**
 * 返回一个随机的浮点数
 * @param {number} [min]
 * @param {number} [max]
 * @param {number} [dmin]
 * @param {number} [dmax]
 * @returns {number}
 */
function float(min, max, dmin, dmax) {
  dmin = dmin === undefined ? 0 : dmin;
  dmin = Math.max(Math.min(dmin, 17), 0);
  dmax = dmax === undefined ? 17 : dmax;
  dmax = Math.max(Math.min(dmax, 17), 0);
  let ret = int(min, max) + '.';
  let dcount = int(dmin, dmax);
  for (let i = 0; i < dcount; i++) {
    // 最后一位不能为 0：如果最后一位为 0，会被 JS 引擎忽略掉。
    ret += i < dcount - 1 ? character('number') : character('123456789');
  }
  return Number.parseFloat(ret);
}

/**
 * 返回一个随机字符
 * @param {string} [pool]
 * @returns {string}
 */
function character(pool) {
  let pools = {
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    number: '0123456789',
    symbol: '!@#$%^&*()[]',
  };
  pools.alpha = pools.lower + pools.upper;
  pools['undefined'] = pools.lower + pools.upper + pools.number + pools.symbol;

  pool = pools[('' + pool).toLowerCase()] || pool;
  return pool.charAt(int(0, pool.length - 1));
}

function char(pool) {
  return character(pool);
}

/**
 * 返回一个随机字符串
 * @param {string|number} [pool]
 * @param {number} [min]
 * @param {number} [max]
 * @returns {string}
 */
function string(pool, min, max) {
  let len;
  switch (arguments.length) {
    case 0: // ()
      len = int(3, 7);
      break;
    case 1: // ( length )
      len = pool;
      pool = undefined;
      break;
    case 2:
      // ( pool, length )
      if (typeof arguments[0] === 'string') {
        len = min;
      } else {
        // ( min, max )
        len = int(pool, min);
        pool = undefined;
      }
      break;
    case 3:
      len = int(min, max);
      break;
    default:
      break;
  }
  let text = '';
  for (let i = 0; i < len; i++) {
    text += character(pool);
  }
  return text;
}

function str(pool, min, max) {
  return string(pool, min, max);
}

/**
 * 返回一个整型数组
 * @param {number} [start=0]
 * @param {number} [stop=0]
 * @param {number} [step=1]
 * @returns {number[]}
 */
function range(start = 0, stop = 0, step = 1) {
  start = Number(start);
  stop = Number(stop);
  step = Number(step);
  if (isNaN(start) || isNaN(stop) || isNaN(step)) {
    return [];
  }
  if (start > stop) {
    [stop, start] = [start, stop];
  }
  let range = [];
  for (let i = start; i < stop; i += step) {
    range.push(i);
  }
  return range;
}

export default {
  boolean,
  bool,
  natural,
  integer,
  int,
  character,
  char,
  string,
  str,
  range,
};