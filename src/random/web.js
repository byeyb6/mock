import basic from './basic.js';
import text from './text.js';
import helper from './helper.js';

/**
 * 随机生成一个url
 * @param {string} [protocol]
 * @param {string} [host]
 * @returns {string}
 */
function url(protocol, host) {
  return `${protocol ?? protocol()}://${host ?? domain()}/${text.word()}`;
}

/**
 * 随机生成一个常见的 URL 协议
 * @returns {string}
 */
function protocol() {
  return helper.pick(['http', 'https', 'ftp', 'file', 'mailto']);
}

/**
 * 随机生成一个顶级域名
 * @returns {string}
 */
function tld() {
  return helper.pick('com net org edu gov cn com.cn gov.cn vip top info cc'.split(' '));
}

/**
 * 随机生成一个域名
 * @param {string} [ld]
 * @returns {string}
 */
function domain(ld) {
  return `${text.word()}.${ld ?? tld()}`;
}

/**
 * 随机生成一个邮件地址
 * @param {string} [emailDomain]
 * @returns {string}
 */
function email(emailDomain) {
  return `${text.word()}@${emailDomain ?? domain()}`;
}

/**
 * 随机生成一个 IP 地址
 * @returns {string}
 */
function ip() {
  return `${basic.int(0, 255)}.${basic.int(0, 255)}.${basic.int(0, 255)}.${basic.int(0, 255)}`;
}

export default {
  url,
  protocol,
  tld,
  domain,
  email,
  ip,
};