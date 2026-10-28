/**
 * 返回一个随机布尔值
 * 用法：
 * boolean()                50% true / 50% false
 * boolean(3, 1)            3:1 概率，true 概率 3/(3+1)
 * boolean(3, 1, false)     3:1 概率，3份取 false，1份取 true
 * boolean('true') / boolean('false') 直接返回对应布尔
 * @param {number|string} [min] 概率权重A
 * @param {number|string} [max] 概率权重B
 * @param {boolean} [cur] 基准值，权重 min:max 对应 !cur : cur
 * @returns {boolean}
 */
function boolean(min, max, cur) {
  // 直接传入 true/false 字符串常量
  if (min === 'true' || min === 'false') {
    return min === 'true';
  }

  // 有权重模式 min:max
  if (typeof cur === 'boolean') {
    const w1 = Number.parseInt(min, 10);
    const w2 = Number.parseInt(max, 10);
    const weightA = Number.isNaN(w1) ? 1 : w1;
    const weightB = Number.isNaN(w2) ? 1 : w2;
    const total = weightA + weightB;
    // 随机落在 [0, weightA) 取 !cur，否则取 cur
    return Math.random() * total < weightA ? !cur : cur;
  }

  // 无权重，默认 50%
  return Math.random() >= 0.5;
}

/**
 * 布尔值别名，和 boolean 完全一致
 * @param {number|string} [min]
 * @param {number|string} [max]
 * @param {boolean} [cur]
 * @returns {boolean}
 */
function bool(min, max, cur) {
  return boolean(min, max, cur);
}

/**
 * 返回随机自然数 [min, max]，≥0 的整数，均匀分布
 * @param {number} [min=0]
 * @param {number} [max=Number.MAX_SAFE_INTEGER]
 * @returns {number}
 */
function natural(min, max) {
  min = Number.parseInt(min, 10);
  max = Number.parseInt(max, 10);

  if (Number.isNaN(min)) {
    min = 0;
    max = Number.MAX_SAFE_INTEGER;
  } else if (Number.isNaN(max)) {
    max = Number.MAX_SAFE_INTEGER;
  }
  // 交换大小
  if (min > max) [min, max] = [max, min];
  // 自然数不能小于0
  min = Math.max(0, min);
  max = Math.max(0, max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 返回随机整数 [min, max]，支持正负，均匀分布
 * @param {number} [min=Number.MIN_SAFE_INTEGER]
 * @param {number} [max=Number.MAX_SAFE_INTEGER]
 * @returns {number}
 */
function integer(min, max) {
  min = Number.parseInt(min, 10);
  max = Number.parseInt(max, 10);

  if (Number.isNaN(min)) {
    min = Number.MIN_SAFE_INTEGER;
    max = Number.MAX_SAFE_INTEGER;
  } else if (Number.isNaN(max)) {
    max = Number.MAX_SAFE_INTEGER;
  }
  if (min > max) [min, max] = [max, min];

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * integer 别名
 * @param {number} [min]
 * @param {number} [max]
 * @returns {number}
 */
function int(min, max) {
  return integer(min, max);
}

/**
 * 返回随机浮点数
 * @param {number} [min] 整数部分下限
 * @param {number} [max] 整数部分上限
 * @param {number} [dmin=0] 最少小数位数
 * @param {number} [dmax=17] 最多小数位数（JS安全上限17）
 * @returns {number}
 */
function float(min, max, dmin, dmax) {
  dmin = dmin === undefined ? 0 : dmin;
  dmax = dmax === undefined ? 17 : dmax;
  // 限制小数位数区间 0~17
  dmin = Math.max(0, Math.min(dmin, 17));
  dmax = Math.max(0, Math.min(dmax, 17));
  if (dmin > dmax) [dmin, dmax] = [dmax, dmin];

  // 整数部分
  const intPart = int(min, max);
  const decCount = int(dmin, dmax);
  if (decCount === 0) return intPart;

  // 小数部分：生成 0 ~ 10^decCount - 1 的随机整数，避免字符串拼接精度问题
  const decMax = 10 ** decCount;
  const decPart = int(0, decMax - 1);
  return intPart + decPart / decMax;
}

/**
 * 返回单个随机字符
 * 内置池：lower / upper / number / symbol / alpha
 * @param {string} [pool] 字符池名称或者自定义字符集
 * @returns {string}
 */
function character(pool) {
  const pools = {
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    number: '0123456789',
    symbol: '!@#$%^&*()[]',
  };
  pools.alpha = pools.lower + pools.upper;
  pools.undefined = pools.lower + pools.upper + pools.number + pools.symbol;

  const key = ('' + pool).toLowerCase();
  const targetPool = pools[key] ?? pool;
  if (!targetPool) return '';

  const idx = int(0, targetPool.length - 1);
  return targetPool.charAt(idx);
}

/**
 * character 别名
 * @param {string} [pool]
 * @returns {string}
 */
function char(pool) {
  return character(pool);
}

/**
 * 返回随机字符串
 * 支持多种调用形式：
 * string()           3~7位，默认字符池
 * string(8)          固定长度8，默认字符池
 * string('abc', 5)   固定长度5，自定义字符池
 * string(2,6)        长度2~6，默认字符池
 * string('abc',2,6)  长度2~6，自定义字符池
 * @param {string|number} [pool] 字符池名称 / 自定义字符集 / 最小长度
 * @param {number} [min] 长度或最小长度
 * @param {number} [max] 最大长度
 * @returns {string}
 */
function string(pool, min, max) {
  let charPool;
  let len;

  if (arguments.length === 0) {
    // string()
    charPool = undefined;
    len = int(3, 7);
  } else if (arguments.length === 1) {
    // string(len)
    charPool = undefined;
    len = Number(pool);
  } else if (arguments.length === 2) {
    if (typeof pool === 'string') {
      // string(pool, len)
      charPool = pool;
      len = Number(min);
    } else {
      // string(minLen, maxLen)
      charPool = undefined;
      len = int(pool, min);
    }
  } else {
    // string(pool, minLen, maxLen)
    charPool = pool;
    len = int(min, max);
  }

  len = Math.max(0, Number.isFinite(len) ? len : 0);
  let text = '';
  for (let i = 0; i < len; i++) {
    text += char(charPool);
  }
  return text;
}

/**
 * string 别名
 * @param {string|number} [pool]
 * @param {number} [min]
 * @param {number} [max]
 * @returns {string}
 */
function str(pool, min, max) {
  return string(pool, min, max);
}

/**
 * 生成等差数字序列数组，类似 range
 * @param {number} [start=0]
 * @param {number} [stop=0]
 * @param {number} [step=1]
 * @returns {number[]}
 */
function range(start = 0, stop = 0, step = 1) {
  start = Number(start);
  stop = Number(stop);
  step = Number(step);

  if (Number.isNaN(start) || Number.isNaN(stop) || Number.isNaN(step) || step === 0) {
    return [];
  }
  const arr = [];
  // 统一方向，step 自动适配正负
  if (start < stop) {
    for (let i = start; i < stop; i += step) arr.push(i);
  } else {
    for (let i = start; i > stop; i += step) arr.push(i);
  }
  return arr;
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
