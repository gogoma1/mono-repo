//file path : monorepo/server/src/auth.ts

import { betterAuth } from "better-auth";
import type { DbUser, DbSession } from "./db/schema";
import { drizzle } from "drizzle-orm/d1";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "./db/schema";
import { createMiddleware } from "hono/factory";
import { Hono } from "hono";
import { generateKey, decryptKey } from "./utils/key";
import { eq } from "drizzle-orm";
import { genericOAuth } from "better-auth/plugins";
import { createAuthClient } from "better-auth/client";
import { genericOAuthClient } from "better-auth/client/plugins";

const app = new Hono<{
    Bindings: Env;
    Variables: {
        user: DbUser;
        session: DbSession;
    };
}>();

export const db = (env: Env) => drizzle(env.DB);

// Better Auth 설정
export const auth = (env: Env) =>
    betterAuth({
        database: drizzleAdapter(drizzle(env.DB), {
            provider: "sqlite",
            schema: {
                account: schema.accountTable,
                session: schema.sessionTable,
                user: schema.userTable,
                verification: schema.verificationTable,
            },
        }),
        secret: env.SECRET,
        socialProviders: {
            github: {
                clientId: env.AUTH_GITHUB_ID,
                clientSecret: env.AUTH_GITHUB_SECRET,
                redirectURI: `${env.BETTER_AUTH_URL}/api/auth/callback/github`,
            },
            google: {
                clientId: env.AUTH_GOOGLE_ID,
                clientSecret: env.AUTH_GOOGLE_SECRET,
                redirectURI: `${env.BETTER_AUTH_URL}/api/auth/callback/google`,
            },
        },
        plugins: [
            genericOAuth({
                config: [
                    {
                        providerId: "kakao",
                        clientId: env.AUTH_KAKAO_ID,
                        clientSecret: env.AUTH_KAKAO_SECRET,
                        authorizationUrl: "https://kauth.kakao.com/oauth/authorize",
                        tokenUrl: "https://kauth.kakao.com/oauth/token",
                        userInfoUrl: "https://kapi.kakao.com/v2/user/me",
                        redirectURI: `${env.BETTER_AUTH_URL}/api/auth/oauth2/callback/kakao`,
                        scopes: ["account_email", "profile_nickname"],
                        getUserInfo: async (tokens: any): Promise<DbUser | null> => {
                            try {
                                const response = await fetch("https://kapi.kakao.com/v2/user/me", {
                                    headers: {
                                        Authorization: `Bearer ${tokens.accessToken}`,
                                    },
                                });
                                if (!response.ok) {
                                    return null;
                                }
                                const profile: KakaoProfile = await response.json(); // KakaoProfile은 worker-configuration.d.ts에서 정의됨
                                const kakaoAccount = profile.kakao_account || {};
                                const kakaoProfile = kakaoAccount.profile || {};
                                const now = new Date();
                                const user: DbUser = {
                                    id: String(profile.id),
                                    email: kakaoAccount.email || "unknown@kakao.com",
                                    name: kakaoProfile.nickname || profile.properties?.nickname || "Unknown Kakao User",
                                    image: kakaoProfile.profile_image_url || profile.properties?.profile_image || null,
                                    emailVerified: kakaoAccount.is_email_verified || false,
                                    createdAt: now,
                                    updatedAt: now,
                                    subscriptionId: null,
                                    lastKeyGeneratedAt: null,
                                };
                                return user;
                            } catch (error) {
                                return null;
                            }
                        },
                    },
                ],
            }),
        ],
    });

// 인증 미들웨어
export const authMiddleware = createMiddleware(async (c, next) => {
    const authHeader = c.req.header("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        try {
            const [userId, lastKeyGeneratedAtTimestamp] = await decryptKey(token, c.env.SECRET);
            const user = await db(c.env)
                .select()
                .from(schema.userTable)
                .where(eq(schema.userTable.id, userId))
                .get();

            if (user) {
                if (!user.lastKeyGeneratedAt) {
                    const now = new Date();
                    await db(c.env)
                        .update(schema.userTable)
                        .set({ lastKeyGeneratedAt: now })
                        .where(eq(schema.userTable.id, userId))
                        .run();
                    user.lastKeyGeneratedAt = now;
                }

                const storedTimestamp = user.lastKeyGeneratedAt.getTime();
                const providedTimestamp = Number(lastKeyGeneratedAtTimestamp);

                if (storedTimestamp === providedTimestamp) {
                    c.set("user", user);
                    c.set("session", null);
                    await next();
                    return;
                }
            }
        } catch (e) {
            return c.json({ error: "Invalid API key" }, 401);
        }
        return c.json({ error: "Invalid API key" }, 401);
    }

    const session = await auth(c.env).api.getSession({
        headers: c.req.raw.headers,
    });
    console.log('[authMiddleware] Raw headers for getSession:', JSON.stringify(Object.fromEntries(c.req.raw.headers.entries())));
    console.log('[authMiddleware] Session object from better-auth:', JSON.stringify(session, null, 2));

    if (session?.user) {
        const user = await db(c.env)
            .select()
            .from(schema.userTable)
            .where(eq(schema.userTable.id, session.user.id))
            .get();

        if (user && !user.lastKeyGeneratedAt) {
            const now = new Date();
            await db(c.env)
                .update(schema.userTable)
                .set({ lastKeyGeneratedAt: now })
                .where(eq(schema.userTable.id, user.id))
                .run();
            user.lastKeyGeneratedAt = now;
        }

        c.set("session", session.session || null);
        c.set("user", user || null);
    }
    await next();
});

const authClient = createAuthClient({
    plugins: [genericOAuthClient()],
});

// 라우터 설정
export const authRouter = app
    // .route("/", createStudent)
    .get("/api/auth/session", async (c) => {
        const session = await auth(c.env).api.getSession({
            headers: c.req.raw.headers,
        });
        if (session?.user) {
            const user = await db(c.env)
                .select()
                .from(schema.userTable)
                .where(eq(schema.userTable.id, session.user.id))
                .get();
            console.log("세션에서 반환된 사용자 정보:", user);
            // 데이터베이스에서 직접 쿼리한 결과 로그 추가
            const dbUser = await db(c.env)
                .select()
                .from(schema.userTable)
                .where(eq(schema.userTable.id, session.user.id))
                .get();
            console.log("DB에서 직접 조회한 사용자 정보:", dbUser);
            return c.json({
                user,
                session: session.session,
                apiKey: user?.lastKeyGeneratedAt
                    ? await generateKey(user.id, String(user.lastKeyGeneratedAt.getTime()), c.env.SECRET)
                    : null,
            });
        }
        return c.json({ user: null, session: null, apiKey: null }, 401);
    })
    .post("/api/auth/token", async (c) => {
        const user = c.get("user");
        if (!user) return c.json({ error: "Unauthorized" }, 401);
        const lastKeyGeneratedAt = new Date().getTime();
        const token = await generateKey(user.id, String(lastKeyGeneratedAt), c.env.SECRET);
        console.log("생성된 API 토큰:", token);
        return c.json({ token });
    })
    .all("/api/auth/*", (c) => {
        const authHandler = auth(c.env).handler;
        return authHandler(c.req.raw);
    })
    .get("/signout", async (c) => {
        await auth(c.env).api.signOut({ headers: c.req.raw.headers });
        return c.redirect("/login");
    })
    .get("/signin/github", async (c) => {
        const signinUrl = await auth(c.env).api.signInSocial({
            body: {
                provider: "github",
                callbackURL: "http://localhost:5173/bridge",
            },
        });
        if (!signinUrl || !signinUrl.url) return c.text("Failed to sign in with GitHub", 500);
        return c.redirect(signinUrl.url);
    })
    .get("/signin/kakao", async (c) => {
        const signinUrl = await auth(c.env).api.signInWithOAuth2({
            body: {
                providerId: "kakao",
                callbackURL: "http://localhost:5173/bridge",
            },
        });
        if (!signinUrl || !signinUrl.url) return c.text("Failed to sign in with Kakao", 500);
        return c.redirect(signinUrl.url);
    })

    .get("/signin/google", async (c) => {
        const signinUrl = await auth(c.env).api.signInSocial({
            body: {
                provider: "google",
                callbackURL: "http://localhost:5173/bridge",
            },
        });
        if (!signinUrl || !signinUrl.url) return c.text("Failed to sign in with Google", 500);
        return c.redirect(signinUrl.url);
    })
    .get("/api/profiles/check", async (c) => {
        const session = await auth(c.env).api.getSession({
            headers: c.req.raw.headers,
        });

        if (!session?.user) {
            return c.json({ exists: false }, 401); // 세션이 없으면 false 반환
        }

        const userId = session.user.id;
        const profile = await db(c.env)
            .select()
            .from(schema.profilesTable)
            .where(eq(schema.profilesTable.id, userId))
            .get();

        console.log({ exists: !!profile }); // 프로필이 있으면 true, 없으면 false

        return c.json({ exists: !!profile }); // 프로필이 있으면 true, 없으면 false
    })
    .post("/api/profiles/setup", async (c) => {
        const session = await auth(c.env).api.getSession({
            headers: c.req.raw.headers,
        });

        if (!session?.user) {
            return c.json({ error: "인증되지 않은 사용자입니다." }, 401);
        }

        const body = await c.req.json();
        const { id, email, name, position, academyName, region } = body;

        if (!id || !email || !name || !position || !academyName || !region) {
            return c.json({ error: "모든 필드를 입력해야 합니다." }, 400);
        }

        try {
            await db(c.env)
                .insert(schema.profilesTable)
                .values({
                    id,
                    email,
                    name,
                    position,
                    academy_name: academyName,
                    region,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                .run();

            return c.json({ success: true }, 201);
        } catch (error) {
            console.error("프로필 저장 실패:", error);
            return c.json({ error: "프로필 저장 중 오류가 발생했습니다." }, 500);
        }
    });


export default authRouter;