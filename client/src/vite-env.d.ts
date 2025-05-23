/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string; // VITE_API_BASE_URL을 string 타입으로 명시
    // 다른 VITE_ 환경 변수가 있다면 여기에 추가
    // readonly VITE_SOME_OTHER_VAR: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
