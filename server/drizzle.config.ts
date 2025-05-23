// server/drizzle.config.ts
import 'dotenv/config';
import type { Config } from 'drizzle-kit';
import { z } from 'shared';

// 환경 변수 스키마 정의 및 파싱
const envSchema = z.object({
    CLOUDFLARE_ACCOUNT_ID: z.string().min(1, { message: "CLOUDFLARE_ACCOUNT_ID is required" }),
    CLOUDFLARE_D1_DATABASE_ID: z.string().min(1, { message: "CLOUDFLARE_D1_DATABASE_ID is required" }),
    CLOUDFLARE_API_TOKEN: z.string().min(1, { message: "CLOUDFLARE_API_TOKEN is required" }),
});

let env;
try {
    env = envSchema.parse(process.env);
} catch (e) {
    if (e instanceof z.ZodError) {
        console.error("❌ Invalid environment variables:");
        e.errors.forEach(err => {
            console.error(`  - ${err.path.join('.')}: ${err.message}`);
        });
    } else {
        console.error("❌ Unknown error parsing environment variables:", e);
    }
    process.exit(1);
}

export default {
    schema: './src/db/schema.ts',
    out: './migrations',
    dialect: 'sqlite',
    driver: 'd1-http',
    dbCredentials: {
        accountId: env.CLOUDFLARE_ACCOUNT_ID,
        databaseId: env.CLOUDFLARE_D1_DATABASE_ID,
        token: env.CLOUDFLARE_API_TOKEN,
    },
    verbose: true,
    strict: true,
} satisfies Config;