// Centralized rate limiting middleware for Next.js API routes
import rateLimit from 'next-rate-limit';

export const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500 // Max 500 users per minute
});
