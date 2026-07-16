import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from '../config/redis';

// Create a generic rate limiter with Redis Store
export const createRateLimiter = (
  windowMs: number,
  maxRequests: number,
  message: string = 'Too many requests, please try again later.'
) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: { message },
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      // @ts-expect-error - Known issue with rate-limit-redis types and ioredis/redis
      sendCommand: (...args: string[]) => redisClient.call(...args),
    }),
  });
};

// Specific limiters
export const articleCreationLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  10,             // Limit each IP to 10 create requests per `window`
  'Too many articles created from this IP, please try again after 15 minutes'
);

export const apiLimiter = createRateLimiter(
  1 * 60 * 1000,  // 1 minute
  100,            // Limit each IP to 100 requests per `window`
);
