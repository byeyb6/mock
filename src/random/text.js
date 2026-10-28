import basic from './basic.js';
import helper from './helper.js';

/**
 * 内置常用汉字库，可外部传入自定义池覆盖
 */
export const DICT_KANZI = '的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经十三之进着等部度家电力里如水化高自二理起小物现实加量都两体制机当使点从业本去把性好应开它合还因由其些然前外天政四日那社义事平形相全表间样与关各重新线内数正心反你明看原又么利比或但质气第向道命此变条只没结解问意建月公无系军很情者最立代想已通并提直题党程展五果料象员革位入常文总次品式活设及管特件长求老头基资边流路级少图山统接知较将组见计别她手角期根论运农指几九区强放决西被干做必战先回则任取据处队南给色光门即保治北造百规热领七海口东导器压志世金增争济阶油思术极交受联什认六共权收证改清己美再采转更单风切打白教速花带安场身车例真务具万每目至达走积示议声报斗完类八离华名确才科张信马节话米整空元况今集温传土许步群广石记需段研界拉林律叫且究观越织装影算低持音众书布复容儿须际商非验连断深难近矿千周委素技备半办青省列习响约支般史感劳便团往酸历市克何除消构府称太准精值号率族维划选标写存候毛亲快效斯院查江型眼王按格养易置派层片始却专状育厂京识适属圆包火住调满县局照参红细引听该铁价严龙飞';

/**
 * 范围工具函数
 * @param {number} defaultMin 默认最小
 * @param {number} defaultMax 默认最大
 * @param {number} [min] 传入最小
 * @param {number} [max] 传入最大
 * @returns {number}
 */
function range(defaultMin, defaultMax, min, max) {
  // 无min：使用默认区间
  if (min === undefined) {
    return basic.natural(defaultMin, defaultMax);
  }
  // 有min，无max：固定长度
  if (max === undefined) {
    return Number.isFinite(min) ? min : defaultMin;
  }
  // 双参数区间
  return basic.natural(min, max);
}

/**
 * 随机英文单词（小写字母）
 * @param {number} [min] 最小长度
 * @param {number} [max] 最大长度
 * @returns {string}
 */
function word(min, max) {
  const len = range(3, 10, min, max);
  let result = '';
  for (let i = 0; i < len; i++) {
    result += basic.character('lower');
  }
  return result;
}

/**
 * 随机汉字
 * 支持多种调用：
 * cword()                1个，内置汉字池
 * cword(5)               固定5个，内置汉字池
 * cword('一二三四五六')  取1个，自定义汉字池
 * cword('一二三四五六',2,4) 2~4个，自定义池
 * cword(2,6)             2~6个，内置汉字池
 * @param {string|number} [pool] 汉字池字符串 / 最小长度
 * @param {number} [min] 长度或最小长度
 * @param {number} [max] 最大长度
 * @returns {string}
 */
function cword(pool, min, max) {
  let charPool;
  let len;

  if (arguments.length === 0) {
    // cword()
    charPool = DICT_KANZI;
    len = 1;
  } else if (arguments.length === 1) {
    if (typeof pool === 'string') {
      // cword(pool)
      charPool = pool;
      len = 1;
    } else {
      // cword(length)
      charPool = DICT_KANZI;
      len = Number(pool);
    }
  } else if (arguments.length === 2) {
    if (typeof pool === 'string') {
      // cword(pool, length)
      charPool = pool;
      len = Number(min);
    } else {
      // cword(minLen, maxLen)
      charPool = DICT_KANZI;
      len = basic.natural(pool, min);
    }
  } else {
    // cword(pool, minLen, maxLen)
    charPool = pool;
    len = basic.natural(min, max);
  }

  // 兜底校验
  charPool = charPool || DICT_KANZI;
  len = Math.max(1, Number.isFinite(len) ? len : 1);

  let result = '';
  for (let i = 0; i < len; i++) {
    const idx = basic.natural(0, charPool.length - 1);
    result += charPool.charAt(idx);
  }
  return result;
}

/**
 * 英文标题（每个单词首字母大写）
 * @param {number} [min] 单词数量最小值
 * @param {number} [max] 单词数量最大值
 * @returns {string}
 */
function title(min, max) {
  const count = range(3, 7, min, max);
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push(helper.capitalize(word()));
  }
  return arr.join(' ');
}

/**
 * 中文标题
 * @param {number} [min] 汉字数量最小值
 * @param {number} [max] 汉字数量最大值
 * @returns {string}
 */
function ctitle(min, max) {
  const count = range(3, 7, min, max);
  let str = '';
  for (let i = 0; i < count; i++) {
    str += cword();
  }
  return str;
}

/**
 * 英文句子，首字母大写，句号结尾
 * @param {number} [min] 单词数量最小值
 * @param {number} [max] 单词数量最大值
 * @returns {string}
 */
function sentence(min, max) {
  const count = range(12, 18, min, max);
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push(word());
  }
  return helper.capitalize(arr.join(' ')) + '.';
}

/**
 * 中文句子，句号结尾
 * @param {number} [min] 汉字数量最小值
 * @param {number} [max] 汉字数量最大值
 * @returns {string}
 */
function csentence(min, max) {
  const count = range(12, 18, min, max);
  let str = '';
  for (let i = 0; i < count; i++) {
    str += cword();
  }
  return str + '。';
}

/**
 * 英文段落，由多个句子组成
 * @param {number} [min] 句子数量最小值
 * @param {number} [max] 句子数量最大值
 * @returns {string}
 */
function paragraph(min, max) {
  const count = range(3, 7, min, max);
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push(sentence());
  }
  return arr.join(' ');
}

/**
 * 中文段落，由多个中文句子组成
 * @param {number} [min] 句子数量最小值
 * @param {number} [max] 句子数量最大值
 * @returns {string}
 */
function cparagraph(min, max) {
  const count = range(3, 7, min, max);
  let str = '';
  for (let i = 0; i < count; i++) {
    str += csentence();
  }
  return str;
}

export default {
  word,
  cword,
  title,
  ctitle,
  sentence,
  csentence,
  paragraph,
  cparagraph,
};
