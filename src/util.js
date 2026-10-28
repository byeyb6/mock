/**
 * 获取值的精确类型名称
 * @param {*} val
 * @returns {string} 小写类型名：object / array / string / number / boolean / null / undefined 等
 */
export function typeOf(val) {
  return Object.prototype.toString.call(val).replace(/.* (.*)]/, '$1').toLowerCase();
}

/**
 * 是否为合法数字字符串（支持正负整数、小数）
 * @param {any} val
 * @returns {boolean}
 */
export function isNumber(val) {
  return /^-?\d+(\.\d+)?$/.test(val);
}

/**
 * 判断字符串是否是正则字面量格式，例如 /abc/g
 * @param {string} str
 * @returns {boolean}
 */
export function isRegexp(str) {
  // 匹配 /pattern/flags 格式，flag 只允许 g i m y u
  const reg = /^\/(.+)\/([gimyu]{0,5})?$/;
  if (reg.test(str)) {
    try {
      const match = reg.exec(str);
      if (!match) return false;
      // 尝试实例化，校验正则合法性
      new RegExp(match[1], match[2]);
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
}

/**
 * 判断颜色是否为浅色（支持 hex、rgb、rgba）
 * 感知亮度公式：0.2126R + 0.7152G + 0.0722B
 * @param {string} color 颜色字符串 #fff / #ffffff / rgb(r,g,b) / rgba(r,g,b,a)
 * @returns {boolean} true=浅色，false=深色
 */
export function isLightColor(color) {
  let r, g, b, a;
  color = color.trim();

  // 十六进制 #rgb / #rrggbb
  if (/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
    let hexStr = color.replace(/^#/, '');
    // 短格式 #rgb 展开为 #rrggbb
    if (hexStr.length === 3) {
      hexStr = hexStr[0] + hexStr[0] + hexStr[1] + hexStr[1] + hexStr[2] + hexStr[2];
    }
    r = parseInt(hexStr.substring(0, 2), 16);
    g = parseInt(hexStr.substring(2, 4), 16);
    b = parseInt(hexStr.substring(4, 6), 16);
    a = 1;
  }
  // rgb / rgba
  else if (/^rgba?\(.*\)$/.test(color)) {
    const inner = color.replace(/^rgba?\((.*)\)/, '$1').replace(/\s+/g, '');
    [r, g, b, a = 1] = inner.split(',').map(Number);
    // 校验rgb数值范围
    if (isNaN(r) || isNaN(g) || isNaN(b)) return false;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    a = Math.max(0, Math.min(1, a));
    // 透明度低于0.5，视为浅色
    if (a < 0.5) return true;
  }
  // 不支持的颜色格式
  else {
    return false;
  }

  // 转为0~1  严格判断要 r = srgbToLinear(r/255)
  r /= 255;
  g /= 255;
  b /= 255;
  // sRGB 感知亮度
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  // 大于0.5判定浅色
  return luminance > 0.5;
}

/**
 * sRGB 转线性光（WCAG 标准）
 * @param {number} v 0~1 的 sRGB 通道值
 */
function srgbToLinear(v) {
  if (v <= 0.03928) {
    return v / 12.92;
  } else {
    return Math.pow((v + 0.055) / 1.055, 2.4);
  }
}
