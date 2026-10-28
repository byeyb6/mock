import basic from './basic.js';
import color from './color.js';
import {isLightColor} from '../util.js';

/**
 * 生成随机占位 SVG 图片 data-url
 * @param {string} [size] 尺寸格式 "WxH"，范围限制 100~600
 * @param {string} [background] 背景色，支持 hex / rgb / rgba；非法则自动随机
 * @param {string} [text] 内部文字，不传默认显示宽高
 * @returns {string} data:image/svg+xml 链接
 */
export function image(size, background, text) {
  let width, height;
  // 解析尺寸，不符合 WxH 格式则随机宽高
  if (!/^\d+x\d+$/.test(size ?? '')) {
    width = basic.int(100, 600);
    height = basic.int(100, 600);
  } else {
    const [wStr, hStr] = size.split('x');
    width = Math.max(100, Math.min(Number.parseInt(wStr, 10), 600));
    height = Math.max(100, Math.min(Number.parseInt(hStr, 10), 600));
  }

  // 校验背景色，不合法自动生成 hex 随机色
  const colorRegHex = /^#([0-9A-F]{3}){1,2}$/i;
  const colorRegRgb = /^rgba?\(.*\)$/;
  if (!colorRegHex.test(background ?? '') && !colorRegRgb.test(background ?? '')) {
    background = color.hex();
  }

  // 默认文字为宽高
  if (!text) {
    text = `${width}x${height}`;
  }

  // 根据背景明暗自动选文字颜色
  const foreground = isLightColor(background) ? '#000' : '#fff';

  // 【重要】SVG 内部文本要做 XML 转义，防止 < > & ' " 破坏 SVG
  const escapeXml = (str) => {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };
  const safeText = escapeXml(text);

  const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
    <rect x="0" y="0" width="${width}" height="${height}" rx="4" ry="4" fill="${background}"/>
    <text x="${width / 2}" y="${height / 2}" font-size="20" fill="${foreground}" text-anchor="middle" dominant-baseline="middle">${safeText}</text>
  </svg>`;

  // 浏览器：encodeURIComponent 版本，体积更小、兼容性好
  if (typeof window !== 'undefined') {
    return `data:image/svg+xml,${encodeURIComponent(svgCode)}`;
  }
  // Node：Buffer base64
  if (typeof Buffer !== 'undefined') {
    const buffer = Buffer.from(svgCode, 'utf8');
    return `data:image/svg+xml;base64,${buffer.toString('base64')}`;
  }
  // 兜底默认图
  return `data:image/svg+xml;base64,CiAgICA8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDEwMCAxMDAiPgogICAgICA8cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcng9IjQiIHJ5PSI0IiBmaWxsPSJyZ2IoMjAwLDIwMCwyMDApIi8+CiAgICAgIDx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzAwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+CiAgICAgICAgMTAweDEwMAogICAgICA8L3RleHQ+CiAgICA8L3N2Zz4KICA=`;
}

/**
 * image 别名
 * @param {string} [size]
 * @param {string} [background]
 * @param {string} [text]
 * @returns {string}
 */
function img(size, background, text) {
  return image(size, background, text);
}

export default {
  image,
  img,
};
