import Constant from './constant.js';
import Parser from './parser.js';
import Random from './random/index.js';
import {typeOf, isNumber} from './util.js';

/**
 * 处理数据模板
 * @type {Record<string, any>}
 */
const Handler = {
  /**
   * 入口方法
   * @param template  属性值（即数据模板）
   * @param name  属性名
   * @param context  数据上下文，生成后的数据
   * @returns {*}
   */
  gen(template, name = '', context = {}) {
    context = {
      // 当前访问路径，只有属性名，不包括生成规则
      path: context.path || [Constant.GUID],
      templatePath: context.templatePath || [Constant.GUID++],
      // 最终属性值的上下文
      currentContext: context.currentContext,
      // 属性值模板的上下文
      templateCurrentContext: context.templateCurrentContext || template,
      // 最终值的根
      root: context.root || context.currentContext,
      // 模板的根
      templateRoot: context.templateRoot || context.templateCurrentContext || template,
    };
    // console.log('path:', context.path.join('.'), template)

    let rule = Parser.parse(name);
    let type = typeOf(template);
    let data;
    if (typeOf(Handler[type]) === 'function') {
      data = Handler[type]({
        // 属性值类型
        type,
        // 属性值模板
        template,
        // 属性名 + 生成规则
        name,
        // 属性名
        parsedName: name ? String(name).replace(Constant.RE_KEY, '$1') : name,
        // 解析后的生成规则
        rule,
        // 相关上下文
        context,
      });

      if (!context.root) {
        context.root = data;
      }
      return data;
    }

    return template;
  },
  array(options) {
    let result = [];
    // 'name|1': []
    // 'name|count': []
    // 'name|min-max': []
    if (options.template.length === 0) return result;

    // 'arr': [{ 'email': '@EMAIL' }, { 'email': '@EMAIL' }]
    if (!options.rule.parameters) {
      for (let i = 0; i < options.template.length; i++) {
        options.context.path.push(i);
        options.context.templatePath.push(i);
        result.push(
          Handler.gen(options.template[i], i, {
            path: options.context.path,
            templatePath: options.context.templatePath,
            currentContext: result,
            templateCurrentContext: options.template,
            root: options.context.root || result,
            templateRoot: options.context.templateRoot || options.template,
          }),
        );
        options.context.path.pop();
        options.context.templatePath.pop();
      }
    } else {
      // 'method|1': ['GET', 'POST', 'HEAD', 'DELETE']
      if (options.rule.min === 1 && !options.rule.max) {
        // fix #17
        options.context.path.push(options.name);
        options.context.templatePath.push(options.name);
        result = Random.pick(
          Handler.gen(options.template, undefined, {
            path: options.context.path,
            templatePath: options.context.templatePath,
            currentContext: result,
            templateCurrentContext: options.template,
            root: options.context.root || result,
            templateRoot: options.context.templateRoot || options.template,
          }),
        );
        options.context.path.pop();
        options.context.templatePath.pop();
      } else {
        // 'data|+1': [{}, {}]
        if (options.rule.parameters[2]) {
          options.template.__order_index = options.template.__order_index || 0;

          options.context.path.push(options.name);
          options.context.templatePath.push(options.name);
          result = Handler.gen(options.template, undefined, {
            path: options.context.path,
            templatePath: options.context.templatePath,
            currentContext: result,
            templateCurrentContext: options.template,
            root: options.context.root || result,
            templateRoot: options.context.templateRoot || options.template,
          })[options.template.__order_index % options.template.length];

          options.template.__order_index += +options.rule.parameters[2];

          options.context.path.pop();
          options.context.templatePath.pop();

        } else {
          // 'data|1-10': [{}]
          for (let i = 0; i < options.rule.count; i++) {
            // 'data|1-10': [{}, {}]
            for (let ii = 0; ii < options.template.length; ii++) {
              options.context.path.push(result.length);
              options.context.templatePath.push(ii);
              result.push(
                Handler.gen(options.template[ii], result.length, {
                  path: options.context.path,
                  templatePath: options.context.templatePath,
                  currentContext: result,
                  templateCurrentContext: options.template,
                  root: options.context.root || result,
                  templateRoot: options.context.templateRoot || options.template,
                }),
              );
              options.context.path.pop();
              options.context.templatePath.pop();
            }
          }
        }
      }
    }
    return result;
  },
  object(options) {
    let result = {},
      keys, fnKeys, key, parsedKey, inc, i;

    // 'obj|min-max': {}
    /* jshint -W041 */
    if (options.rule.min || options.rule.min === 0) {
      keys = Object.keys(options.template);
      keys = Random.shuffle(keys);
      keys = keys.slice(0, options.rule.count);
      for (let key of keys) {
        parsedKey = key.replace(Constant.RE_KEY, '$1');
        options.context.path.push(parsedKey);
        options.context.templatePath.push(key);
        result[parsedKey] = Handler.gen(options.template[key], key, {
          path: options.context.path,
          templatePath: options.context.templatePath,
          currentContext: result,
          templateCurrentContext: options.template,
          root: options.context.root || result,
          templateRoot: options.context.templateRoot || options.template,
        });
        options.context.path.pop();
        options.context.templatePath.pop();
      }
    } else {
      // 'obj': {}
      keys = [];
      fnKeys = []; // #25 改变了非函数属性的顺序，查找起来不方便
      for (key in options.template) {
        (typeof options.template[key] === 'function' ? fnKeys : keys).push(key);
      }
      keys = [...keys, ...fnKeys];
      /*
          会改变非函数属性的顺序
          keys = Object.keys(options.template)
          keys.sort(function(a, b) {
              let afn = typeof options.template[a] === 'function'
              let bfn = typeof options.template[b] === 'function'
              if (afn === bfn) return 0
              if (afn && !bfn) return 1
              if (!afn && bfn) return -1
          })
      */

      for (let key of keys) {
        parsedKey = key.replace(Constant.RE_KEY, '$1');
        options.context.path.push(parsedKey);
        options.context.templatePath.push(key);
        result[parsedKey] = Handler.gen(options.template[key], key, {
          path: options.context.path,
          templatePath: options.context.templatePath,
          currentContext: result,
          templateCurrentContext: options.template,
          root: options.context.root || result,
          templateRoot: options.context.templateRoot || options.template,
        });
        options.context.path.pop();
        options.context.templatePath.pop();
        // 'id|+1': 1
        inc = key.match(Constant.RE_KEY);
        if (inc && inc[2] && typeOf(options.template[key]) === 'number') {
          options.template[key] += Number.parseInt(inc[2], 10);
        }
      }
    }
    return result;
  },
  number(options) {
    let result, parts;
     // float
    if (options.rule.decimal || options.rule.decimal === 0) {
      options.template += '';
      parts = options.template.split('.');
      // 'float1|.1-10': 10,
      // 'float2|1-100.1-10': 1,
      // 'float3|999.1-10': 1,
      // 'float4|.3-10': 123.123,
      parts[0] = options.rule.range ? options.rule.count : parts[0];
      parts[1] = (parts[1] || '').slice(0, options.rule.dcount);
      const parts1Length = parts[1].length;
      while (parts1Length < options.rule.dcount) {
        // 最后一位不能为 0，否则转数字会被忽略掉
        parts[1] += parts1Length < options.rule.dcount - 1 ? Random.character('number') : Random.character('123456789');
      }
      result = Number.parseFloat(parts.join('.'));
    } else {
       // integer
      // 'grade1|1-100': 1,
      result = options.rule.range && !options.rule.parameters[2] ? options.rule.count : options.template;
    }
    return result;
  },
  boolean(options) {
    let result;
    // 'prop|multiple': false, 当前值是相反值的概率倍数
    // 'prop|probability-probability': false, 当前值与相反值的概率
    result = options.rule.parameters ? Random.bool(options.rule.min,
      options.rule.max,
      options.template,
    ) : options.template;
    return result;
  },
  string(options) {
    let result = '',
      placeholders, ph, phed;
    if (options.template.length) {
      //  'foo': '★',
      /* jshint -W041 */
      if (!options.rule.count) {
        result += options.template;
      }
      // 'star|1-5': '★',
      for (let i = 0; i < options.rule.count; i++) {
        result += options.template;
      }
      // 'email|1-10': '@EMAIL, ',
      placeholders = result.match(Constant.RE_PLACEHOLDER) ?? []; // A-Z_0-9 > \w_
      for (let i = 0; i < placeholders.length; i++) {
        ph = placeholders[i];
        // 遇到转义斜杠，不需要解析占位符
        if (/^\\/.test(ph)) {
          placeholders.splice(i--, 1);
          continue;
        }
        phed = Handler.placeholder(ph, options.context.currentContext, options.context.templateCurrentContext, options);
        // 只有一个占位符，并且没有其他字符
        if (placeholders.length === 1 && ph === result && typeof phed !== typeof result) { //
          result = phed;
          break;
        }
        // if (isNumber(phed)) {
        //   result = Number(phed);
        //   break;
        // }
        if (/^(true|false)$/.test(phed)) {
          result = phed !== 'false' && phed !== false;
          break;
        }
        result = result.replace(ph, phed);
      }

    } else {
      // 'ASCII|1-10': '',
      // 'ASCII': '',
      result = options.rule.range ? Random.string(options.rule.count) : options.template;
    }
    return result;
  },
  'function': function(options) {
    // ( context, options )
    return options.template.call(options.context.currentContext, options);
  },

  _all() {
    const re = {};
    for (let key in Random) {
      re[key.toLowerCase()] = key;
    }
    return re;
  },
  // 处理占位符，转换为最终值
  placeholder(placeholder, obj, templateContext, options) {
    // console.log(options.context.path)
    // 1 key, 2 params
    // ['@order(1,2,3,4,5)', 'order', '1,2,3,4,5']
    let parts = Constant.RE_PLACEHOLDER.exec(placeholder);
    if (!parts) {
      return placeholder;
    }
    let key = parts[1];
    let lkey = key.toLowerCase();
    let okey = this._all()[lkey];
    // 解析占位符的参数
    let params = parts[2]?.replace(/^\[|]$/g, '').split(/,\s*/).map(param => {
      // 数字字符串转成数字
      return isNumber(param) ? Number(param) : param;
    }) ?? [];
    let pathParts = this.splitPathToArray(key);
    // 占位符优先引用数据模板中的属性
    if (obj && obj.hasOwnProperty(key)) {
      return obj[key];
    }
    // @index @key
    // if (Constant.RE_INDEX.test(key)) return +options.name
    // if (Constant.RE_KEY.test(key)) return options.name

    // 绝对路径 or 相对路径
    if (key.charAt(0) === '/' || pathParts.length > 1) {
      return this.getValueByKeyPath(key, options);
    }
    // 递归引用数据模板中的属性, 避免自己依赖自己
    if (templateContext &&
      typeof templateContext === 'object' &&
      key in templateContext &&
      placeholder !== templateContext[key]
    ) {
      // 先计算被引用的属性值
      templateContext[key] = Handler.gen(templateContext[key], key, {
        currentContext: obj,
        templateCurrentContext: templateContext,
      });
      return templateContext[key];
    }

    // 如果未找到，则原样返回
    if (!(key in Random) && !(lkey in Random) && !(okey in Random)) {
      return placeholder;
    }

    // 递归解析参数中的占位符
    for (let i = 0; i < params.length; i++) {
      if (Constant.RE_PLACEHOLDER.test(params[i])) {
        params[i] = Handler.placeholder(params[i], obj, templateContext, options);
      }
    }

    let handle = Random[key] || Random[lkey] || Random[okey];
    switch (typeOf(handle)) {
      case 'array':
        // 自动从数组中取一个，例如 @areas
        return Random.pick(handle);
      case 'function':
        // 执行占位符方法（大多数情况）
        handle.options = options;
        let re = handle.apply(Random, params);
        Reflect.deleteProperty(handle, 'options');
        return re;
      default:
        return placeholder;
    }
  },
  getValueByKeyPath(key, options) {
    let originalKey = key;
    let keyPathParts = this.splitPathToArray(key);
    let absolutePathParts = [];

    // 绝对路径
    if (key.charAt(0) === '/') {
      absolutePathParts = [
        options.context.path[0],
        ...this.normalizePath(keyPathParts),
      ];
    } else {
      // 相对路径
      if (keyPathParts.length > 1) {
        absolutePathParts = [...options.context.path];
        absolutePathParts.pop();
        absolutePathParts = this.normalizePath([
          ...absolutePathParts,
          ...keyPathParts,
        ]);
      }
    }
    try {
      key = keyPathParts[keyPathParts.length - 1];
      let currentContext = options.context.root;
      let templateCurrentContext = options.context.templateRoot;
      for (let i = 1; i < absolutePathParts.length - 1; i++) {
        currentContext = currentContext[absolutePathParts[i]];
        templateCurrentContext = templateCurrentContext[absolutePathParts[i]];
      }
      // 引用的值已经计算好
      if (currentContext && key in currentContext) {
        return currentContext[key];
      }

      // 尚未计算, 递归引用数据模板中的属性, 避免自己依赖自己
      if (templateCurrentContext &&
        typeof templateCurrentContext === 'object' &&
        key in templateCurrentContext &&
        originalKey !== templateCurrentContext[key]
      ) {
        // 先计算被引用的属性值
        templateCurrentContext[key] = Handler.gen(templateCurrentContext[key], key, {
          currentContext,
          templateCurrentContext,
        });
        return templateCurrentContext[key];
      }
    } catch (err) {
      console.log(err);
    }

    return '@' + keyPathParts.join('/');
  },
  normalizePath(pathParts) {
    let newPathParts = [];
    for (let item of pathParts) {
      switch (item) {
        case '..':
          newPathParts.pop();
          break;
        case '.':
          break;
        default:
          newPathParts.push(item);
      }
    }
    return newPathParts;
  },
  // // 只将./替换成/, 并去掉开头结尾的/
  splitPathToArray(path) {
    return path.replace(/(?<!\.)\.\/(?!\.)/g, '/').replace(/^\/+|\/+$/g, '').split(/\/+/);
  },
};

export default Handler;