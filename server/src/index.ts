// 위치 : monorepo/server/src/index.ts

import { Hono } from "hono";
import { cors } from 'hono/cors'; // <--- CORS 미들웨어 import
import { authMiddleware, authRouter } from "./auth";
import type { DbUser, DbSession } from "./db/schema";
import { paymentRouter } from "./payment/lemonsqueezy";
import { apiRouter } from "./api";
import { stManage } from './route/studentmanage';
import { r2ImageUploadRoute } from "./route/r2imageupload";
import { problemupload } from "./route/problemmanage";

// Env 타입이 프로젝트 내에 정의되어 있는지 확인하세요.
// interface Env {
//   DB: D1Database;
//   SECRET: string;
//   AUTH_GITHUB_ID: string;
//   AUTH_GITHUB_SECRET: string;
//   AUTH_GOOGLE_ID: string;
//   AUTH_GOOGLE_SECRET: string;
//   AUTH_KAKAO_ID: string;
//   AUTH_KAKAO_SECRET: string;
//   BETTER_AUTH_URL: string; // 예: http://127.0.0.1:8787 또는 프로덕션 URL
//   LEMONSQUEEZY_CHECKOUT_LINK: string;
//   // ... 기타 바인딩
// }

const app = new Hono<{
    Bindings: Env;
    Variables: {
        user: DbUser;
        session: DbSession;
    };
}>()
    // CORS 미들웨어를 가장 먼저 적용하거나, authMiddleware 전에 적용합니다.
    // 세션 쿠키를 사용하므로 credentials: true 가 중요합니다.
    .use('*', cors({
        origin: (origin) => {
            // 개발 환경에서는 localhost:5173을 허용하고, 필요시 프로덕션 URL도 추가
            const allowedOrigins = [
                'http://localhost:5173', // Vite 개발 서버
                // 'https://your-production-frontend.com' // 프로덕션 프론트엔드
            ];
            if (allowedOrigins.includes(origin)) {
                return origin;
            }
            // 다른 origin에 대해서는 null 또는 기본 허용 origin을 반환할 수 있습니다.
            // 엄격하게 하려면 null을 반환하여 허용되지 않은 origin을 차단합니다.
            return 'http://localhost:5173'; // 기본값 또는 null
        },
        allowHeaders: ['Content-Type', 'Authorization', /* 클라이언트가 보내는 다른 헤더들 */],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true, // <<<--- 세션 쿠키를 위해 매우 중요!
        maxAge: 86400, // Preflight 요청 캐시 시간 (초 단위)
    }))
    .use(authMiddleware)
    .route("/", problemupload)
    .route("/", r2ImageUploadRoute)
    .route("/", stManage)
    .route("/", authRouter)
    .route("/", paymentRouter)
    .route("/api", apiRouter);

export type AppType = typeof app;
export default app;