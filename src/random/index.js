import basic from './basic.js';
import date from './date.js';
import image from './image.js';
import color from './color.js';
import text from './text.js';
import name from './name.js';
import web from './web.js';
import address from './address.js';
import helper from './helper.js';
import misc from './misc.js';

const base = {
  ...basic,
  ...date,
  ...image,
  ...color,
  ...text,
  ...name,
  ...web,
  ...address,
  ...helper,
  ...misc,
};

const random = new Proxy(base, {
  set(target, property, value, receiver) {
    // 已有内置属性：禁止覆盖
    if (Object.prototype.hasOwnProperty.call(target, property)) {
      throw new Error('内置API禁止覆盖修改，只能新增自定义属性');
    }
    // 新增属性：非函数自动包装成取值函数；自定义属性后续用户可自行覆盖
    const finalValue = typeof value === 'function' ? value : () => value;
    return Reflect.set(target, property, finalValue, receiver);
  },
  deleteProperty(target, property) {
    // 内置属性禁止删除
    if (Object.prototype.hasOwnProperty.call(target, property)) {
      throw new Error('内置API禁止删除');
    }
    // 用户自己新增的自定义属性，允许删除
    return Reflect.deleteProperty(target, property);
  },
});

export default random;
