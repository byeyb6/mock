/**
 * 把字符串的第一个字母转换为大写
 * @param {string} str
 * @returns {string}
 */
function capitalize(str) {
  return str.replace(/(^\w)/, ($0, $1) => $1.toUpperCase());
}

/**
 * 把字符串转换为大写
 * @param {string} str
 * @returns {string}
 */
function upper(str) {
  return str.toUpperCase();
}

/**
 * 把字符串转换为小写
 * @param {string} str
 * @returns {string}
 */
function lower(str) {
  return str.toLowerCase();
}

/**
 * 范围内随机整数
 * @param {number} [min]
 * @param {number} [max]
 * @returns {number}
 */
function intRandom(min = 0, max = 1) {
  return Math.round(Math.random() * (max - min)) + min;
}

/**
 * 从数组中随机选取一个元素，并返回。
 * @param {*} arr
 * @param {*} [min]
 * @param {*} [max]
 * @returns {*}
 */
function pick(arr, min = 1, max = min) {
  // pick(item1, item2, ...)
  if (!Array.isArray(arr)) {
    arr = [...arguments];
    min = 1;
    max = 1;
  }
  if (min === 1 && max === 1) {
    return arr[intRandom(0, arr.length - 1)];
  }
  // pick([item1, item2, ...], min, max)
  return shuffle(arr, min, max);
}
/**
 * 打乱数组中元素的顺序，并返回。
 * @param {*} arr
 * @param {*} [min]
 * @param {*} [max]
 * @returns {*[]}
 */
function shuffle(arr = [], min = 1, max) {
  if (!Array.isArray(arr)) {
    arr = [...arguments];
    min = 1;
    max = arr.length - 1;
  } else {
    let length = arr.length;
    if (!max || max > length - 1) {
      max = length - 1;
    }
  }
  if (min > max) {
    [min, max] = [max, min];
  }
  let old = [...arr];
  let result = [];
  while (old.length) {
    let index = intRandom(0, old.length - 1);
    result.push(old[index]);
    old.splice(index, 1);
  }
  return result.slice(0, intRandom(min, max));
}
/**
 * 顺序获取数组中的元素
 * @param {*} array
 * @returns {*}
 */
function order(array) {
  order.cache = order.cache || {};

  if (!Array.isArray(array)) {
    array = [...arguments];
  }
  // options.context.path/templatePath
  let options = order.options;
  let templatePath = options.context.templatePath.join('.');
  if (!order.cache[templatePath]) {
    order.cache[templatePath] = {
      index: 0,
      array,
    };
  }
  let cache = order.cache[templatePath];
  return cache.array[cache.index++ % cache.array.length];
}

export default {
  capitalize,
  upper,
  lower,
  intRandom,
  pick,
  shuffle,
  order,
}
