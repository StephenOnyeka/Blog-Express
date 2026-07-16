import { Request, Response, NextFunction } from 'express';
import redisClient from '../config/redis';

export const cacheMiddleware = (ttlSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Construct a unique key based on URL and query params
    const key = `cache:${req.originalUrl || req.url}`;

    try {
      const cachedResponse = await redisClient.get(key);

      if (cachedResponse) {
        return res.json(JSON.parse(cachedResponse));
      }

      // If not cached, override res.json to cache the response before sending
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        redisClient.setex(key, ttlSeconds, JSON.stringify(body));
        return originalJson(body);
      };

      next();
    } catch (err) {
      console.error('Redis cache error:', err);
      // Fallback to non-cached response on Redis error
      next();
    }
  };
};

export const clearCache = async (keyPattern: string) => {
  try {
    const keys = await redisClient.keys(`cache:${keyPattern}`);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  } catch (err) {
    console.error('Redis cache clear error:', err);
  }
};
