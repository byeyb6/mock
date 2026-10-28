/**
 * 把字符串的第一个字母转换为大写
 * @param {string} str
 * @returns {string}
 */
function capitalize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * 把字符串转换为大写
 * @param {string} str
 * @returns {string}
 */
function upper(str) {
  if (typeof str !== 'string') return '';
  return str.toUpperCase();
}

/**
 * 把字符串转换为小写
 * @param {string} str
 * @returns {string}
 */
function lower(str) {
  if (typeof str !== 'string') return '';
  return str.toLowerCase();
}

/**
 * 范围内随机整数 [min, max]，闭区间，均匀分布
 * @param {number} [min=0]
 * @param {number} [max=1]
 * @returns {number}
 */
function intRandom(min = 0, max = 1) {
  min = Math.floor(Number(min) || 0);
  max = Math.floor(Number(max) || 1);
  if (min > max) [min, max] = [max, min];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 从数组随机选取元素
 * 支持两种调用：
 * pick([1,2,3]) 随机取1个
 * pick([1,2,3], 2,3) 随机取 2~3 个
 * pick(1,2,3) 多参数传入，随机取1个
 * @param {*} arr
 * @param {number} [min=1]
 * @param {number} [max=min]
 * @returns {* | *[]}
 */
function pick(arr, min = 1, max = min) {
  // 多参数形式 pick(a,b,c)
  if (!Array.isArray(arr)) {
    arr = [...arguments];
    min = 1;
    max = 1;
  }
  if (!arr.length) return undefined;

  // 只取单个
  if (min === 1 && max === 1) {
    return arr[intRandom(0, arr.length - 1)];
  }
  // 取多个，交给 shuffle
  return shuffle(arr, min, max);
}

/**
 * 洗牌（Fisher–Yates 简易实现），返回打乱后的数组切片
 * 支持：shuffle([1,2,3])、shuffle(1,2,3)、shuffle([1,2,3], 2,3)
 * @param {*} arr
 * @param {number} [min=1] 最少返回数量
 * @param {number} [max] 最多返回数量
 * @returns {*[]}
 */
function shuffle(arr = [], min = 1, max) {
  // 多参数形式 shuffle(a,b,c)
  if (!Array.isArray(arr)) {
    arr = [...arguments];
    min = 1;
    max = arr.length;
  }

  const source = [...arr];
  const len = source.length;
  if (len === 0) {
    return [];
  }

  // 修正边界 max要大于0, 0直接赋值最大值
  if (!max || max > len) max = len;
  min = Math.max(1, Number(min) || 1);
  max = Math.max(min, Number(max) || min);
  if (min > max) {
    [min, max] = [max, min];
  }

  // Fisher-Yates 洗牌
  for (let i = source.length - 1; i > 0; i--) {
    const j = intRandom(0, i);
    [source[i], source[j]] = [source[j], source[i]];
  }

  const takeCount = intRandom(min, max);
  return source.slice(0, takeCount);
}

/**
 * 顺序轮询数组元素（list|+step 使用）
 * ⚠️ 重要：不再用全局静态缓存，缓存挂载在 context 上，每一轮 gen 独立，刷新会重置
 * 调用方式：order([1,2,3])，依赖注入 options
 * @param {*} array
 * @returns {*}
 */
function order(array) {
  if (!Array.isArray(array)) {
    array = [...arguments];
  }
  if (!array.length) return undefined;

  // 由调用方注入上下文（handler里调用时赋值 order.options）
  const options = order.options;
  if (!options?.context) {
    return array[0];
  }

  // 用 context.incMap 做批次隔离，替代全局静态 cache，刷新自动清空
  const cacheKey = `order_${options.context.templatePath.join('.')}`;
  const incMap = options.context.incMap;

  if (!incMap.has(cacheKey)) {
    incMap.set(cacheKey, {
      index: 0,
      array,
    });
  }
  const cache = incMap.get(cacheKey);
  const val = cache.array[cache.index % cache.array.length];
  cache.index += 1;
  incMap.set(cacheKey, cache);
  return val;
}

export default {
  capitalize,
  upper,
  lower,
  intRandom,
  pick,
  shuffle,
  order,
};
