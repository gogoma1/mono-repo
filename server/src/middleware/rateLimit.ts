import type { Context, MiddlewareHandler, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { db } from "../auth";
import { rateLimitTable, userTable } from "../db/schema";
import { and, eq, gt } from "drizzle-orm";
import type { DbUser, DbSession } from "../db/schema";

export interface RateLimitConfig {
  // Requests per window
  limit: number;
  // Window size in seconds
  window: number;
}

export const ratelimiter = async (c: Context<{
  Bindings: Env,
  Variables: {
    user: DbUser,
    session: DbSession
  }
}>, next: Next) => {
  const rateLimiter = createRateLimiter(
    async (user) => await getTierLimit(user)
  );
  return rateLimiter(c, next);
}

export const getTierLimit = async (user: DbUser) => {
  if (!user?.subscriptionId) {
    return { limit: 100, window: 60 * 60 }; // Free tier
  }
  return { limit: 1000, window: 60 * 60 }; // Paid tier
};

// Default tier limits: You can disable this if you want.
const DEFAULT_LIMIT: RateLimitConfig = { limit: 10, window: 60 * 60 }

export const createRateLimiter = <T extends { id: string }>(
  getTierLimit: (user: DbUser) => Promise<RateLimitConfig | undefined>
): MiddlewareHandler<{
  Bindings: Env;
  Variables: {
    user: DbUser,
    session: DbSession
  };
}> => {
  return async (c, next) => {
    const user = c.get("user");
    if (!user || c.req.path === "/") {
      await next();
      return;
    }

    const endpoint = new URL(c.req.url).pathname;
    const now = new Date();

    // Get user's tier limit
    const tierLimit = (await getTierLimit(user)) ?? DEFAULT_LIMIT;

    // Check existing rate limit
    const existing = await db(c.env)
      .select()
      .from(rateLimitTable)
      .where(
        and(
          eq(rateLimitTable.userId, user.id),
          eq(rateLimitTable.endpoint, endpoint),
          gt(rateLimitTable.resetAt, now)
        )
      )
      .get();

    if (!existing) {
      // Create new rate limit entry
      const resetAt = new Date(now.getTime() + tierLimit.window * 1000);
      await db(c.env)
        .insert(rateLimitTable)
        .values({
          id: crypto.randomUUID(),
          userId: user.id,
          endpoint,
          count: 1,
          resetAt,
          createdAt: now,
          updatedAt: now,
        });
    } else if (existing.count >= tierLimit.limit) {
      // Rate limit exceeded
      throw new HTTPException(429, {
        message: `Rate limit exceeded ${JSON.stringify(tierLimit)}, existing: ${JSON.stringify(existing)}`,
      });
    } else {
      // Update count
      await db(c.env)
        .update(rateLimitTable)
        .set({
          count: existing.count + 1,
          updatedAt: now,
        })
        .where(eq(rateLimitTable.id, existing.id));
    }

    // Set rate limit headers
    if (existing) {
      c.header("X-RateLimit-Limit", tierLimit.limit.toString());
      c.header("X-RateLimit-Remaining", (tierLimit.limit - existing.count - 1).toString());
      c.header(
        "X-RateLimit-Reset",
        Math.floor(existing.resetAt.getTime() / 1000).toString()
      );
    }

    await next();
  };
}; 