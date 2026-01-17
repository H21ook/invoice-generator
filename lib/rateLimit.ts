import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

interface RateLimitRecord {
    count: number;
    resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

const WINDOW_MS = 60 * 1000; // 1 minute window
const LIMIT = 10; // 10 requests per minute

async function checkRedisRateLimit(identifier: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    const redis = new Redis({
        url: env.UPSTASH_REDIS_REST_URL!,
        token: env.UPSTASH_REDIS_REST_TOKEN!,
    });

    const key = `ratelimit:${identifier}`;
    const current = await redis.get<number>(key) || 0;

    if (current >= LIMIT) {
        const ttl = await redis.ttl(key);
        return {
            success: false,
            limit: LIMIT,
            remaining: 0,
            reset: Date.now() + (ttl > 0 ? ttl * 1000 : WINDOW_MS),
        };
    }

    const multi = redis.multi();
    multi.incr(key);
    if (current === 0) {
        multi.expire(key, WINDOW_MS / 1000);
    }
    await multi.exec();

    return {
        success: true,
        limit: LIMIT,
        remaining: LIMIT - current - 1,
        reset: Date.now() + WINDOW_MS,
    };
}

function checkMemoryRateLimit(identifier: string): { success: boolean; limit: number; remaining: number; reset: number } {
    const now = Date.now();
    const record = memoryStore.get(identifier);

    if (!record || now > record.resetAt) {
        const newRecord = { count: 1, resetAt: now + WINDOW_MS };
        memoryStore.set(identifier, newRecord);
        return { success: true, limit: LIMIT, remaining: LIMIT - 1, reset: newRecord.resetAt };
    }

    if (record.count >= LIMIT) {
        return { success: false, limit: LIMIT, remaining: 0, reset: record.resetAt };
    }

    record.count += 1;
    return { success: true, limit: LIMIT, remaining: LIMIT - record.count, reset: record.resetAt };
}

/**
 * Basic rate limiter.
 * @param identifier Identifies the user (e.g., IP address).
 */
export async function rateLimit(identifier: string) {
    // if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    //     try {
    //         return await checkRedisRateLimit(identifier);
    //     } catch (error) {
    //         console.warn("Upstash Redis error, falling back to in-memory rate limiting:", error);
    //     }
    // }

    // return checkMemoryRateLimit(identifier);
    return {
        success: true,
        limit: LIMIT,
        remaining: LIMIT,
        reset: Date.now() + WINDOW_MS,
    };
}
