import BLOG from '@/blog.config';
import { siteConfig } from '@/lib/config';
import Redis from 'ioredis';

export const redisClient = BLOG.REDIS_URL ? new Redis(BLOG.REDIS_URL) : {};

const cacheTime = Math.trunc(
  siteConfig('NEXT_REVALIDATE_SECOND', BLOG.NEXT_REVALIDATE_SECOND) * 1.5
);

export async function getCache(key) {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error(`redisClientの読み取りに失敗しました${String(e)}`);
  }
}

export async function setCache(key, data, customCacheTime) {
  try {
    await redisClient.set(
      key,
      JSON.stringify(data),
      'EX',
      customCacheTime || cacheTime
    );
  } catch (e) {
    console.error(`redisClientの書き込みに失敗しました${String(e)}`);
  }
}

export async function delCache(key) {
  try {
    await redisClient.del(key);
  } catch (e) {
    console.error(`redisClientの削除に失敗しました${String(e)}`);
  }
}

export default { getCache, setCache, delCache };