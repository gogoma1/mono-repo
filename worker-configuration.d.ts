interface Env {
    DB: D1Database;
    MY_R2_BUCKET: R2Bucket;
    R2_PUBLIC_URL: string;
    R2_PUBLIC_URL_PREVIEW: string;
    BETTER_AUTH_URL: string;
    SECRET: string;
    AUTH_GITHUB_ID: string;
    AUTH_GITHUB_SECRET: string;
    LEMONSQUEEZY_CHECKOUT_LINK: string;
    AUTH_KAKAO_ID: string;
    AUTH_KAKAO_SECRET: string;
    AUTH_GOOGLE_ID: string;
    AUTH_GOOGLE_SECRET: string;
    CLIENT_APP_URL: string;
    NODE_ENV: string;
}

interface KakaoProfile {
    id: number;
    kakao_account?: {
        email?: string;
        is_email_verified?: boolean;
        name?: string; // 사용자의 실제 이름
        profile?: {
            nickname?: string; // 닉네임
            profile_image_url?: string;
        };
    };
    properties?: {
        nickname?: string;
        profile_image?: string;
    };
}

interface GoogleProfile {
    sub: string;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    email: string;
    email_verified: boolean;
}