import handler from './handler.js';
import random from './random/index.js';

const Mock = {
  handler,
  random,
  mock: template => handler.gen(template),
};

export default Mock;