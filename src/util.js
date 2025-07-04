/**
 * 类型判断
 * @param {*} val
 * @returns {string}
 */
export function typeOf(val) {
  return Object.prototype.toString.call(val).replace(/.* (.*)]/, '$1').toLowerCase();
}

/**
 * 是否数字字符串
 * @param {any} val
 * @returns {boolean}
 */
export function isNumber(val) {
  return /^-?\d+(\.\d+)?$/.test(val);
}

/**
 * 是否正则表达式字符串
 * @param {string} str
 * @returns {boolean}
 */
export function isRegexp(str) {
  // 先检查是否是斜杠包围的格式
  const reg = /^\/(.+)\/[gimyu]{0,5}$/;
  if (reg.test(str)) {
    try {
      const match = reg.exec(str);
      if (!match) {
        return false;
      }
      new RegExp(match[1], match[2]);
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
}

/**
 * 判断hex和rgba是否为浅色
 * @param {string} color
 * @returns {boolean}
 */
export function isLightColor(color) {
  let [r, g, b, a] = [];
  if (/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
    color = color.replace(/^#/, '');
    if (color.length === 3) {
      color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
    }
    r = parseInt(color.substring(0, 2), 16);
    g = parseInt(color.substring(2, 4), 16);
    b = parseInt(color.substring(4, 6), 16);
  } else if (/^rgba?\(.*\)/.test(color)) {
    color = color.replace(/^rgba?\((.*)\)/, '$1').replace(/\s+/g, '');
    [r, g, b, a] = color.split(',');
    if (a < 0.5) {
      return true;
    }
  } else {
    return false;
  }
  // 将 RGB 值转换为 0-1 范围内的小数
  r = r / 255;
  g = g / 255;
  b = b / 255;
  // 计算亮度（感知亮度）
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  // 根据亮度判断是浅色还是深色
  return luminance > 0.5;
}
