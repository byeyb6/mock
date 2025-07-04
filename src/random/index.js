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

const random = new Proxy({
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
}, {
  // 保证random属性的值为function
  set(target, property, value) {
    if (typeof property === 'string' && !/^custom/.test(property)) {
      throw new Error(`扩展占位符属性必须以custom开头`);
    }
    return Reflect.set(
      target,
      property,
      typeof value === 'function' ? value : () => value,
    );
  },
});

export default random;