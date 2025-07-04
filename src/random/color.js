import basic from './basic.js';

/**
 * 随机生成一个颜色
 * @param {string} [type]
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

// #ffffff
function hex() {
  // 长格式转短格式
  // .replace(/^#([a-f\d])\1([a-f\d])\2([a-f\d])\3$/i, '#$1$2$3');
  return `#${colorArray().map(i => i.toString(16).padStart(2, '0')).join('')}`;
}

function rgb() {
  return `rgb(${colorArray().join(', ')})`;
}

function rgba() {
  return `rgba(${colorArray().join(', ')}, ${Math.random().toFixed(2)})`;
}

/**
 * 色值
 * @returns {number[]}
 */
function colorArray() {
  return [basic.int(0, 255), basic.int(0, 255), basic.int(0, 255)];
}

export default {
  color,
  hex,
  rgb,
  rgba,
};