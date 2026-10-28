import basic from './basic.js';

/**
 * 随机生成一个颜色
 * @param {string} [type='hex'] 颜色格式：hex / rgb / rgba
 * @returns {string}
 */
function color(type = 'hex') {
  switch (type) {
    case 'rgb':
      return rgb();
    case 'rgba':
      return rgba();
    default:
      return hex();
  }
}

/**
 * 生成十六进制颜色 #RRGGBB
 * @returns {string}
 */
function hex() {
  return `#${colorArray()
    .map(i => i.toString(16).padStart(2, '0'))
    .join('')}`;
}

/**
 * 生成 rgb 格式颜色 rgb(r,g,b)
 * @returns {string}
 */
function rgb() {
  return `rgb(${colorArray().join(', ')})`;
}

/**
 * 生成 rgba 格式颜色 rgba(r,g,b,a)
 * alpha 范围 0~1，保留2位小数
 * @returns {string}
 */
function rgba() {
  const rgbArr = colorArray();
  // 使用 basic.float 统一随机工具，替换原生 Math.random，保持整套随机体系统一
  const alpha = basic.float(0, 1, 2, 2);
  return `rgba(${rgbArr.join(', ')}, ${alpha})`;
}

/**
 * 获取一组 RGB 三通道色值 [r,g,b]，每个通道 0~255
 * @returns {number[]}
 */
function colorArray() {
  return [
    basic.int(0, 255),
    basic.int(0, 255),
    basic.int(0, 255),
  ];
}

export default {
  color,
  hex,
  rgb,
  rgba,
};
