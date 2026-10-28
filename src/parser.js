import Constant from './constant.js';
import Random from './random/index.js';

/**
 * 【规则解析器】
 * 解析属性名上的 MockJS 生成规则：`name|rule`
 * 支持规则：
 *  - name|count        固定数量
 *  - name|min-max      随机区间数量
 *  - name|+step        自增步长
 *  - name|min-max.dmin-dmax  浮点数整数区间+小数位数区间
 * 返回解析结果结构：
 * {
 *    parameters: 正则捕获数组 [完整匹配, name, 自增步长, 主区间, 小数区间]
 *    range: 主区间捕获 [min, max]
 *    min: 主区间最小值
 *    max: 主区间最大值
 *    decimal: 小数区间捕获 [dmin, dmax]
 *    dmin: 小数最少位数
 *    dmax: 小数最多位数
 * }
 */
export default {
  parse(name = '') {
    const parameters = String(name).match(Constant.RE_KEY);
    if (!parameters) {
      return {name, parameters: null};
    }

    // 剥离 |规则 后的纯净key
    const pureName = parameters[1];
    const range = parameters[3] && parameters[3].match(Constant.RE_RANGE);
    const min = range && range[1] && Number.parseInt(range[1]);
    const max = range && range[2] && Number.parseInt(range[2]);
    const count = range ? !range[2] ? Number.parseInt(range[1]) : Random.int(min, max) : undefined;
    const decimal = parameters[4] && parameters[4].match(Constant.RE_RANGE);
    const dmin = decimal && decimal[1] && Number.parseInt(decimal[1]);
    const dmax = decimal && decimal[2] && Number.parseInt(decimal[2]);
    const dcount = decimal ? !decimal[2] ? Number.parseInt(decimal[1]) : Random.int(dmin, dmax) : undefined;
    return {
      pureName,
      // 1 name, 2 inc, 3 range, 4 decimal
      parameters,
      // 1 min, 2 max
      range,
      min,
      max,
      count,
      // 1 dmin, 2 dimax
      decimal,
      dmin,
      dmax,
      dcount,
    };
  },
};
