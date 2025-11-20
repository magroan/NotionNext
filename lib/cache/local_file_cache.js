import fs from 'fs';

const path = require('path');
// 文件缓存持续10秒
const cacheInvalidSeconds = 1000000000 * 1000;
// 文件名
const jsonFile = path.resolve('./data.json');

export function getCache(key) {
  const exist = fs.existsSync(jsonFile);
  if (!exist) return null;
  const data = fs.readFileSync(jsonFile);
  let json = null;
  if (!data) return null;
  try {
    json = JSON.parse(data);
  } catch (error) {
    console.error("JSON\u30AD\u30E3\u30C3\u30B7\u30E5\u30D5\u30A1\u30A4\u30EB\u306E\u8AAD\u307F\u8FBC\u307F\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002", data);
    return null;
  }
  // 缓存超过有效期就作废
  const cacheValidTime = new Date(
    parseInt(json[key + '_expire_time']) + cacheInvalidSeconds
  );
  const currentTime = new Date();
  if (!cacheValidTime || cacheValidTime < currentTime) {
    return null;
  }
  return json[key];
}

/**
 * 并发请求写文件异常； Vercel生产环境不支持写文件。
 * @param key
 * @param data
 * @returns {Promise<null>}
 */
export function setCache(key, data) {
  const exist = fs.existsSync(jsonFile);
  const json = exist ? JSON.parse(fs.readFileSync(jsonFile)) : {};
  json[key] = data;
  json[key + '_expire_time'] = new Date().getTime();
  fs.writeFileSync(jsonFile, JSON.stringify(json));
}

export function delCache(key) {
  const exist = fs.existsSync(jsonFile);
  const json = exist ? JSON.parse(fs.readFileSync(jsonFile)) : {};
  delete json.key;
  json[key + '_expire_time'] = new Date().getTime();
  fs.writeFileSync(jsonFile, JSON.stringify(json));
}

/**
 * 清理缓存
 */
export function cleanCache() {
  const json = {};
  fs.writeFileSync(jsonFile, JSON.stringify(json));
}

export default { getCache, setCache, delCache };