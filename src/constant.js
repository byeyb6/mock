/*
  RE_KEY 规则清单
    'name|min-max': value
    'name|count': value
    'name|min-max.dmin-dmax': value
    'name|min-max.dcount': value
    'name|count.dmin-dmax': value
    'name|count.dcount': value
    'name|+step': value

  捕获组说明：
  1: 属性名 name
  2: step 自增步长（+step分支）
  3: 整数段 rangeStr (min-max / count)
  4: 小数段 decimalStr (dmin-dmax / dcount)
*/
export default {
  GUID: 1,
  RE_KEY: /(.+)\|(?:\+(\d+)|([\+\-]?\d+-?[\+\-]?\d*)?(?:\.(\d+-?\d*))?)/,
  RE_RANGE: /([\+\-]?\d+)-?([\+\-]?\d+)?/,
  RE_PLACEHOLDER: /\\*@([^@#%&()\?\s]+)(?:\((.*?)\))?/g,
  STRING_NUMBER: /^-?\d+(\.\d+)?$/,
};
