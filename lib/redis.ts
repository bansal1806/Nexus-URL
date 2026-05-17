import { Redis } from '@upstash/redis'

let _redis: Redis | null = null;

function getRedis(): Redis {
  if (!_redis) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error('Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN in environment variables');
    }
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return _redis;
}

export const redis = new Proxy({} as Redis, {
  get(_, prop) {
    return (getRedis() as any)[prop];
  },
});

// Cache management patterns
export const cache = {
  getRedirect: async (shortCode: string) => {
    return await redis.get<string>(`redirect:${shortCode}`);
  },
  
  setRedirect: async (shortCode: string, url: string, ttl: number = 3600) => {
    await redis.set(`redirect:${shortCode}`, url, { ex: ttl });
  },
  
  rateLimit: async (ip: string, limit: number = 10, window: number = 60) => {
    const key = `ratelimit:${ip}`;
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, window);
    }
    return count <= limit;
  }
}
