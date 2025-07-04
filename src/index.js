import handler from './handler.js';
import * as util from './util.js';
import random from './random/index.js';

const Mock = {
  handler,
  random,
  util,
  mock: template => handler.gen(template),
};

export default Mock;