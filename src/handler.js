import Constant from './constant.js';
import Parser from './parser.js';
import Random from './random/index.js';
import {typeOf, isNumber} from './util.js';

/**
 * Mock模板处理器，对齐 MockJS 语法规范
 * 核心入口：Handler.gen(template, name, context)
 * 支持：object / array / number / boolean / string / func(原function) / @占位符
 */
const Handler = {
  /**
   * 生成入口：递归解析模板、按规则生成随机数据
   * @param {any} template 属性值模板
   * @param {string} name 属性名（带 | 规则，如 list|1-3）
   * @param {object} context 上下文对象（路径、根数据、模板根）
   * @returns {*} 生成后的数据
   */
  gen(template, name = '', context = {}) {
    // 初始化上下文，维护递归路径（用于路径引用、调试）
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

    // 解析属性名上的 | 规则
    const rule = Parser.parse(name);
    const type = typeOf(template);
    let data;

    // ========== 映射原生type="function" → Handler.func，规避 eslint 关键字告警 ==========
    const handlerKey = type === 'function' ? 'func' : type;
    if (typeOf(Handler[handlerKey]) === 'function') {
      data = Handler[handlerKey]({
        type,
        // 属性值模板
        template,
        // 属性名 + 生成规则
        name,
        // 属性名
        pureName: rule.pureName ? rule.pureName : name,
        // 解析后的生成规则
        rule,
        // 相关上下文
        context,
      });

      // 根节点赋值
      if (!context.root) {
        context.root = data;
      }
      return data;
    }

    // 没有对应处理器，直接原样返回原始值
    return template;
  },

  /**
   * Array 处理器，对齐 MockJS array规则
   * 规则清单：
   * 1. arr: [item1, item2]          原样输出数组内每一项
   * 2. arr|1: [item1,item2]         随机挑选其中1个元素
   * 3. arr|+1: [item1,item2]        顺序循环选取，自增索引
   * 4. arr|1-10: [item]             循环生成 1~10 份 item 组成数组
   */
  array(options) {
    const result = [];
    const {template, rule, context, name} = options;
    // 空数组直接返回
    if (template.length === 0) {
      return result;
    }

    // 分支1：属性名不带任何生成规则，直接遍历数组子项递归生成
    if (!rule.parameters) {
      for (let i = 0; i < template.length; i++) {
        context.path.push(i);
        context.templatePath.push(i);
        result.push(
          Handler.gen(template[i], i, {
            path: context.path,
            templatePath: context.templatePath,
            currentContext: result,
            templateCurrentContext: template,
            root: context.root || result,
            templateRoot: context.templateRoot || template,
          }),
        );
        context.path.pop();
        context.templatePath.pop();
      }
    } else {
      // 分支2：带规则 name|count
      // name|1: [a,b,c] 从数组随机pick一项
      if (rule.min === 1 && !rule.max) {
        context.path.push(name);
        context.templatePath.push(name);
        const item = Handler.gen(template, undefined, {
          path: context.path,
          templatePath: context.templatePath,
          currentContext: result,
          templateCurrentContext: template,
          root: context.root || result,
          templateRoot: context.templateRoot || template,
        });
        context.path.pop();
        context.templatePath.pop();
        return Random.pick(item);
      }

      // 分支3：name|+step 自增顺序选取
      if (rule.parameters[2]) {
        // 缓存索引在模板上，实现跨次自增
        template.__order_index = template.__order_index || 0;
        context.path.push(name);
        context.templatePath.push(name);
        const arrData = Handler.gen(template, undefined, {
          path: context.path,
          templatePath: context.templatePath,
          currentContext: result,
          templateCurrentContext: template,
          root: context.root || result,
          templateRoot: context.templateRoot || template,
        });
        const pickItem = arrData[template.__order_index % arrData.length];
        template.__order_index += Number(rule.parameters[2]);
        context.path.pop();
        context.templatePath.pop();
        return pickItem;
      }

      // 分支4：name|min-max: [item] 循环生成N份子模板
      for (let i = 0; i < rule.count; i++) {
        for (let ii = 0; ii < template.length; ii++) {
          context.path.push(result.length);
          context.templatePath.push(ii);
          result.push(
            Handler.gen(template[ii], result.length, {
              path: context.path,
              templatePath: context.templatePath,
              currentContext: result,
              templateCurrentContext: template,
              root: context.root || result,
              templateRoot: context.templateRoot || template,
            }),
          );
          context.path.pop();
          context.templatePath.pop();
        }
      }
    }
    return result;
  },

  /**
   * Object 处理器
   * 规则：
   * obj|min-max: {} 随机挑选 min~max 个key输出
   * obj: {} 遍历全部key，函数后置保证顺序
   * 附带：id|+1:1 自增数字逻辑
   */
  object(options) {
    const result = {};
    const {template, rule, context} = options;
    let keys, fnKeys, key, parsedKey, inc;

    // obj|min-max: {} 随机抽取指定数量key
    if (rule.min || rule.min === 0) {
      keys = Object.keys(template);
      keys = Random.shuffle(keys);
      keys = keys.slice(0, rule.count);
      for (const key of keys) {
        parsedKey = key.replace(Constant.RE_KEY, '$1');
        context.path.push(parsedKey);
        context.templatePath.push(key);
        result[parsedKey] = Handler.gen(template[key], key, {
          path: context.path,
          templatePath: context.templatePath,
          currentContext: result,
          templateCurrentContext: template,
          root: context.root || result,
          templateRoot: context.templateRoot || template,
        });
        context.path.pop();
        context.templatePath.pop();
      }
    } else {
      // 普通对象：优先普通属性，函数属性放后面，保证渲染顺序稳定
      keys = [];
      fnKeys = [];
      for (key in template) {
        (typeof template[key] === 'function' ? fnKeys : keys).push(key);
      }
      keys = [...keys, ...fnKeys];

      for (const key of keys) {
        parsedKey = key.replace(Constant.RE_KEY, '$1');
        context.path.push(parsedKey);
        context.templatePath.push(key);
        result[parsedKey] = Handler.gen(template[key], key, {
          path: context.path,
          templatePath: context.templatePath,
          currentContext: result,
          templateCurrentContext: template,
          root: context.root || result,
          templateRoot: context.templateRoot || template,
        });
        context.path.pop();
        context.templatePath.pop();

        // 处理自增： id|+1: 1
        inc = key.match(Constant.RE_KEY);
        if (inc && inc[2] && typeOf(template[key]) === 'number') {
          template[key] += Number.parseInt(inc[2], 10);
        }
      }
    }
    return result;
  },

  /**
   * Number 处理器
   * 支持：整数区间、浮点数小数位数规则
   * 示例：
   * num|1-100:1        整数1~100
   * num|1-100.1-4:1    整数1~100，小数1~4位
   * num|.3:1           固定3位小数
   */
  number(options) {
    let result;
    const {template, rule} = options;
    let base = Number(template);
    if (Number.isNaN(base)) base = 0;

    // 区间随机 / 固定值
    if (rule?.mode === 'range') {
      base = Random.int(rule.min, rule.max);
    } else if (rule?.mode === 'fixed') {
      base = rule.count;
    }

    // 小数位数控制
    if (rule?.dcount !== null || rule?.dmin !== null && rule?.dmax !== null) {
      let decLen;
      if (rule.dcount !== null) {
        decLen = rule.dcount;
      } else {
        decLen = Random.int(rule.dmin, rule.dmax);
      }
      decLen = Math.max(0, decLen);
      result = Number(base.toFixed(decLen));
    } else {
      result = base;
    }
    return result;
  },

  /**
   * Boolean 处理器
   * 规则：
   * flag: false 固定布尔值
   * flag|1-3: false 概率：当前值1份，反向3份
   */
  boolean(options) {
    const {template, rule} = options;
    if (!rule.parameters) return template;
    return Random.bool(rule.min, rule.max, template);
  },

  /**
   * String 处理器
   * 规则：
   * str|3: '★' 重复3次★
   * str: 'abc@word' 解析里面@占位符
   */
  string(options) {
    const {template, rule, context} = options;
    let result = '';
    if (template.length) {
      const repeatCount = rule.count ?? 1;
      for (let i = 0; i < repeatCount; i++) {
        result += template;
      }
      const placeholders = result.match(Constant.RE_PLACEHOLDER) ?? [];
      for (let i = 0; i < placeholders.length; i++) {
        const ph = placeholders[i];
        // 遇到转义斜杠，不需要解析占位符
        if (/^\\/.test(ph)) continue;
        const phed = Handler.placeholder(ph, context.currentContext, context.templateCurrentContext, options);
        if (placeholders.length === 1 && ph === result) {
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
      result = rule.range ? Random.string(rule.count) : template;
    }
    return result;
  },

  /**
   * Func处理器（原function）
   * 模板为函数时执行，this指向当前上下文，参数为options
   * 对应模板： fn: function(options) {}
   */
  func(options) {
    return options.template.call(options.context.currentContext, options);
  },

  /**
   * 生成 Random 方法映射表（大小写兼容，@Email / @email 都能识别）
   * @returns {Record<string, string>} 小写key → 原始方法名
   */
  _all() {
    const re = {};
    for (const key in Random) {
      re[key.toLowerCase()] = key;
    }
    return re;
  },

  /**
   * 占位符解析：@xxx(1,2,3)
   * 优先级：当前上下文字段 > 模板字段 > Random内置方法
   */
  placeholder(placeholder, obj, templateContext, options) {
    const parts = Constant.RE_PLACEHOLDER.exec(placeholder);
    if (!parts) return placeholder;

    const key = parts[1];
    const lkey = key.toLowerCase();
    const okey = this._all()[lkey];
    // 解析括号内参数
    const params = parts[2]
      ? parts[2].replace(/^\[|]$/g, '').split(/,\s*/).map(param => isNumber(param) ? Number(param) : param)
      : [];

    // 1. 当前生成结果上下文优先匹配
    if (obj && obj.hasOwnProperty(key)) {
      return obj[key];
    }

    // 2. 路径引用：绝对路径 /path 或者带多级 .
    const pathParts = this.splitPathToArray(key);
    if (key.charAt(0) === '/' || pathParts.length > 1) {
      return this.getValueByKeyPath(key, options);
    }

    // 3. 模板内递归引用，先计算依赖字段
    if (templateContext && typeof templateContext === 'object' && key in templateContext && placeholder !== templateContext[key]) {
      templateContext[key] = Handler.gen(templateContext[key], key, {
        currentContext: obj,
        templateCurrentContext: templateContext,
      });
      return templateContext[key];
    }

    // 4. 找不到对应Random方法，原样返回占位符
    const handle = Random[key] || Random[lkey] || Random[okey];
    if (!handle) return placeholder;

    // 递归解析参数里面的占位符
    for (let i = 0; i < params.length; i++) {
      if (Constant.RE_PLACEHOLDER.test(params[i])) {
        params[i] = Handler.placeholder(params[i], obj, templateContext, options);
      }
    }

    // 数组：随机pick一项
    if (typeOf(handle) === 'array') {
      return Random.pick(handle);
    }
    // 函数：执行Random方法
    if (typeOf(handle) === 'function') {
      handle.options = options;
      const res = handle.apply(Random, params);
      Reflect.deleteProperty(handle, 'options');
      return res;
    }
    return placeholder;
  },

  /**
   * 根据路径字符串读取值，支持绝对路径 / 和相对路径 ..
   */
  getValueByKeyPath(key, options) {
    const originalKey = key;
    const keyPathParts = this.splitPathToArray(key);
    let absolutePathParts = [];

    if (key.charAt(0) === '/') {
      // 绝对路径
      absolutePathParts = [options.context.path[0], ...this.normalizePath(keyPathParts)];
    } else {
      // 相对路径
      if (keyPathParts.length > 1) {
        absolutePathParts = [...options.context.path];
        absolutePathParts.pop();
        absolutePathParts = this.normalizePath([...absolutePathParts, ...keyPathParts]);
      }
    }

    try {
      const targetKey = keyPathParts[keyPathParts.length - 1];
      let currentContext = options.context.root;
      let templateCurrentContext = options.context.templateRoot;
      for (let i = 1; i < absolutePathParts.length - 1; i++) {
        currentContext = currentContext[absolutePathParts[i]];
        templateCurrentContext = templateCurrentContext[absolutePathParts[i]];
      }
      // 已经生成好的值
      if (currentContext && targetKey in currentContext) {
        return currentContext[targetKey];
      }
      // 模板里还没生成，递归求值
      if (templateCurrentContext && typeof templateCurrentContext === 'object' && targetKey in templateCurrentContext && originalKey !== templateCurrentContext[targetKey]) {
        templateCurrentContext[targetKey] = Handler.gen(templateCurrentContext[targetKey], targetKey, {
          currentContext,
          templateCurrentContext,
        });
        return templateCurrentContext[targetKey];
      }
    } catch (err) {
      console.log(err);
    }
    return '@' + keyPathParts.join('/');
  },

  /**
   * 路径标准化：处理 .. 和 .
   */
  normalizePath(pathParts) {
    const newPathParts = [];
    for (const item of pathParts) {
      if (item === '..') {
        newPathParts.pop();
      } else if (item !== '.') {
        newPathParts.push(item);
      }
    }
    return newPathParts;
  },

  /**
   * 路径字符串切割，替换 ./ 为 /，清除首尾斜杠
   */
  splitPathToArray(path) {
    return path.replace(/(?<!\.)\.\/(?!\.)/g, '/').replace(/^\/+|\/+$/g, '').split(/\/+/);
  },
};

export default Handler;
