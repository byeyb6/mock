import basic from './basic.js';
import color from './color.js';
import {isLightColor} from '../util.js';

/**
 * 生成随机图片
 * @param {string} [size] 100x100到600x600
 * @param {string} [background]
 * @param {string} [text]
 * @returns {string}
 */
export function image(size, background, text) {
  let width;
  let height;
  if (!/^\d+x\d+$/.test(size)) {
    [width, height] = [basic.int(100, 600), basic.int(100, 600)];
  } else {
    [width, height] = size.split('x');
    width = Math.max(100, Math.min(Number.parseInt(width), 600));
    height = Math.max(100, Math.min(Number.parseInt(height), 600));
  }
  if (!/^#([0-9A-F]{3}){1,2}$/i.test(background) && !/^rgba?\(.*\)/.test(background)) {
    background = color.hex();
  }
  if (!text) {
    text = `${width}x${height}`;
  }
  const foreground = isLightColor(background) ? '#000' : '#fff';
  // 生成svg矢量图
  const svgCode = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <rect x="0" y="0" width="${width}" height="${height}" rx="4" ry="4" fill="${background}"/>
      <text x="${width / 2}" y="${height / 2}" font-size="20" fill="${foreground}" text-anchor="middle" dominant-baseline="middle">
        ${text}
      </text>
    </svg>
  `;
  // 浏览器环境
  if (typeof window !== 'undefined') {
    const encodedSvg = encodeURIComponent(svgCode);
    return `data:image/svg+xml,${encodedSvg}`;
  }
  // node环境
  if (typeof Buffer !== 'undefined') {
    const buffer = Buffer.from(svgCode, 'utf8');
    const base64 = buffer.toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  }
  // 默认返回100x100
  return `data:image/svg+xml;base64,CiAgICA8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDEwMCAxMDAiPgogICAgICA8cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcng9IjQiIHJ5PSI0IiBmaWxsPSJyZ2IoMjAwLDIwMCwyMDApIi8+CiAgICAgIDx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzAwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+CiAgICAgICAgMTAweDEwMAogICAgICA8L3RleHQ+CiAgICA8L3N2Zz4KICA=`;
}

function img(size, background, text) {
  return image(size, background, text);
}

export default {
  image,
  img,
};