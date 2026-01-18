type RateLimitRecord = {
  count: number;
  expiresAt: number;
};

const trackers = new Map<string, RateLimitRecord>();

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60 * 1000
): RateLimitResult {
  const now = Date.now();

  // Simple cleanup to prevent memory leaks in long-running processes
  if (trackers.size > 10000) {
    trackers.clear();
  }

  const record = trackers.get(identifier);

  // If no record or expired, reset
  if (!record || now > record.expiresAt) {
    const expiresAt = now + windowMs;
    trackers.set(identifier, {
      count: 1,
      expiresAt,
    });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: expiresAt,
    };
  }

  // Check limit
  if (record.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: record.expiresAt,
    };
  }

  // Increment
  record.count += 1;
  return {
    success: true,
    limit,
    remaining: Math.max(0, limit - record.count),
    reset: record.expiresAt,
  };
}
