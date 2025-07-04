import Constant from './constant.js';
import Random from './random/index.js';

/*
	解析数据模板（属性名部分）。

	* Parser.parse( name )

		```json
		{
			parameters: [ name, inc, range, decimal ],
			range: [ min , max ],

			min: min,
			max: max,
			count: count,
			decimal: decimal,
			dmin: dmin,
			dmax: dmax,
			dcount: dcount
		}
		```
 */
export default {
  parse(name = '') {
    let parameters = String(name).match(Constant.RE_KEY);

    let range = parameters && parameters[3] && parameters[3].match(Constant.RE_RANGE);
    let min = range && range[1] && Number.parseInt(range[1]); // || 1
    let max = range && range[2] && Number.parseInt(range[2]); // || 1
    // repeat || min-max || 1
    // let count = range ? !range[2] && Number.parseInt(range[1]) || Random.integer(min, max) : 1
    let count = range ? !range[2] ? Number.parseInt(range[1]) : Random.int(min, max) : undefined;

    let decimal = parameters && parameters[4] && parameters[4].match(Constant.RE_RANGE);
    let dmin = decimal && decimal[1] && Number.parseInt(decimal[1]); // || 0,
    let dmax = decimal && decimal[2] && Number.parseInt(decimal[2]); // || 0,
    // int || dmin-dmax || 0
    let dcount = decimal ? !decimal[2] && Number.parseInt(decimal[1]) || Random.int(dmin, dmax) : undefined;

    let result = {
      // 1 name, 2 inc, 3 range, 4 decimal
      parameters,
      // 1 min, 2 max
      range,
      min,
      max,
      // min-max
      count,
      // 是否有 decimal
      decimal,
      dmin,
      dmax,
      // dmin-dimax
      dcount,
    };
    for (let r in result) {
      if (result[r] !== undefined) {
        return result;
      }
    }
    return {};
  },
};