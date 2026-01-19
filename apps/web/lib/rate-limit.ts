
const trackers = new Map<string, { count: number; expiresAt: number }>();

/**
 * Simple in-memory rate limiter.
 *
 * @param identifier Unique identifier for the requester (e.g. IP address)
 * @param limit Max requests allowed in the window
 * @param windowMs Time window in milliseconds
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(identifier: string, limit: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = trackers.get(identifier);

    // Cleanup if map gets too large (simple protection against memory leaks)
    if (trackers.size > 10000) {
        trackers.clear();
    }

    if (!record || now > record.expiresAt) {
        trackers.set(identifier, { count: 1, expiresAt: now + windowMs });
        return true;
    }

    if (record.count >= limit) {
        return false;
    }

    record.count++;
    return true;
}
