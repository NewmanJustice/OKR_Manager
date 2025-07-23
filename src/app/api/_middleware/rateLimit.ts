// Simple rate limiting middleware for Next.js API routes
// Limits to 5 requests per IP per 10 minutes

const RATE_LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
export const ipMap = new Map();

export function rateLimit(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("host") || "unknown";
  const now = Date.now();
  let entry = ipMap.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) {
    entry = { count: 1, start: now };
  } else {
    entry.count++;
  }
  ipMap.set(ip, entry);
  if (entry.count > RATE_LIMIT) {
    return false;
  }
  return true;
}
