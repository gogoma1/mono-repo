// 파일 위치: backend-api-kit/src/route/r2imageupload.ts

import { Hono } from 'hono';
import { uuidv7 } from 'uuidv7'; // 파일 이름 고유성 보장을 위해 UUID 사용
import type { DbUser } from '../db/schema'; // --- User 타입 import (경로 확인!) ---

// Hono 앱 타입 정의 (기존과 동일)
const app = new Hono<{
    Bindings: Env; // auth.ts와 동일한 Env 사용 (R2 변수 포함 가정)
    Variables: {
        user?: DbUser; // authMiddleware가 설정할 사용자 정보 (선택적 타입으로 지정)
    };
}>();

export const r2ImageUploadRoute = app
    // --- 참고: 인증 미들웨어는 이 라우트가 등록되는 상위 레벨(예: src/index.ts)에서
    // --- app.use('/upload/*', authMiddleware) 와 같이 적용된다고 가정합니다. ---

    // POST /upload/r2 - 이미지 파일을 R2에 업로드 (인증 필요)
    .post('/r2/upload', async (c) => {
        // --- 인증된 사용자 확인 (미들웨어에 의해 설정됨) ---
        const user = c.get("user");
        if (!user) {
            // 미들웨어가 적용되지 않았거나 실패한 경우를 대비한 방어 코드
            return c.json({ error: "인증되지 않은 사용자입니다." }, 401);
        }

        // R2 버킷 및 공개 URL 환경 변수 확인
        const bucket = c.env.MY_R2_BUCKET;
        const publicUrlBase = c.env.R2_PUBLIC_URL_PREVIEW;

        if (!bucket) {
            console.error('R2 버킷 바인딩(MY_R2_BUCKET)이 설정되지 않았습니다.');
            return c.json({ error: '서버 설정 오류: R2 버킷을 찾을 수 없습니다.' }, 500);
        }
        if (!publicUrlBase) {
            console.error('R2_PUBLIC_URL 환경 변수가 설정되지 않았습니다.');
            return c.json({ error: '서버 설정 오류: R2 공개 URL을 찾을 수 없습니다.' }, 500);
        }

        try {
            const formData = await c.req.formData();
            const file = formData.get('file');

            // 파일 유효성 검사 (기존과 동일)
            if (!file || !(file instanceof File)) {
                return c.json({ error: '파일이 요청에 포함되지 않았습니다 또는 올바른 파일 형식이 아닙니다.' }, 400);
            }
            const maxFileSize = 5 * 1024 * 1024;
            if (file.size > maxFileSize) {
                return c.json({ error: `파일 크기는 ${maxFileSize / 1024 / 1024}MB를 초과할 수 없습니다.` }, 413);
            }
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                return c.json({ error: '허용되지 않는 이미지 파일 형식입니다. (JPEG, PNG, GIF, WEBP 허용)' }, 415);
            }
            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            if (!fileExtension) {
                return c.json({ error: '파일 확장자를 확인할 수 없습니다.' }, 400);
            }
            const uniqueKey = `${uuidv7()}.${fileExtension}`;

            // R2에 파일 업로드 (기존과 동일)
            const uploadedObject = await bucket.put(uniqueKey, file.stream(), {
                httpMetadata: { contentType: file.type },
                customMetadata: { userId: user.id } // 사용자 ID 저장
            });

            if (!uploadedObject) {
                throw new Error('R2 put 작업에서 객체를 반환하지 않았습니다.');
            }

            console.log(`사용자 ${user.id}가 파일 업로드 성공: ${uniqueKey}, ETag: ${uploadedObject.httpEtag}`);

            // 성공 응답 (기존과 동일)
            const separator = publicUrlBase.endsWith('/') ? '' : '/';
            const fileUrl = `${publicUrlBase}${separator}${uniqueKey}`;

            return c.json({
                message: '파일 업로드 성공',
                key: uniqueKey,
                url: fileUrl,
                etag: uploadedObject.httpEtag,
                size: uploadedObject.size,
            }, 201);

        } catch (error: unknown) {
            console.error('파일 업로드 중 오류:', error);
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
            return c.json({ error: `파일 업로드 중 오류가 발생했습니다: ${errorMessage}` }, 500);
        }
    })

    // --- ⭐ 신규: DELETE /delete/r2 - R2 객체 삭제 (인증 및 권한 검사 필요, Zod 없음) ---
    .delete('/r2/delete', async (c) => {
        // --- 인증된 사용자 확인 (미들웨어에 의해 설정됨) ---
        const user = c.get("user");
        if (!user) {
            return c.json({ error: "인증되지 않은 사용자입니다." }, 401);
        }

        // R2 버킷 확인
        const bucket = c.env.MY_R2_BUCKET;
        if (!bucket) {
            console.error('R2 버킷 바인딩(MY_R2_BUCKET)이 설정되지 않았습니다.');
            return c.json({ error: '서버 설정 오류: R2 버킷을 찾을 수 없습니다.' }, 500);
        }

        let keyToDelete: string;

        // --- 요청 본문(JSON) 파싱 및 'key' 수동 검증 ---
        try {
            const body = await c.req.json(); // 요청 본문을 JSON으로 파싱

            // body가 객체이고, 'key' 속성이 존재하며, 문자열이고, 비어있지 않은지 확인
            if (typeof body !== 'object' || body === null || typeof body.key !== 'string' || body.key.trim() === '') {
                return c.json({ error: "요청 본문에 유효한 'key' 속성(문자열)이 필요합니다." }, 400);
            }
            keyToDelete = body.key; // 검증된 키 사용
        } catch (e) {
            // JSON 파싱 실패 시
            return c.json({ error: '잘못된 요청 본문입니다. JSON 형식이 필요합니다.' }, 400);
        }

        // --- 객체 삭제 로직 ---
        try {
            // 1. 객체 메타데이터 가져오기 (소유권 확인용)
            const headResult = await bucket.head(keyToDelete);

            // 2. 객체가 R2에 없는 경우
            if (!headResult) {
                console.warn(`삭제 요청: 키(${keyToDelete})를 R2에서 찾을 수 없음 (사용자: ${user.id})`);
                // 이미 삭제되었거나 잘못된 키일 수 있으므로, 클라이언트에서는 성공으로 간주할 수도 있음.
                // 여기서는 일단 404 반환. 필요시 200 반환으로 변경 가능.
                return c.json({ error: '삭제할 객체를 찾을 수 없습니다.' }, 404);
            }

            // 3. 객체 소유권 확인 (customMetadata의 userId 비교)
            if (headResult.customMetadata?.userId !== user.id) {
                console.warn(`권한 없는 삭제 시도: 사용자 ${user.id}가 ${headResult.customMetadata?.userId} 소유의 키 ${keyToDelete} 삭제 시도`);
                return c.json({ error: '이 객체를 삭제할 권한이 없습니다.' }, 403); // Forbidden
            }

            // 4. 소유권 확인 후 객체 삭제
            await bucket.delete(keyToDelete);
            console.log(`사용자 ${user.id}가 객체 삭제 성공: ${keyToDelete}`);

            // 5. 성공 응답 반환
            return c.json({ message: '객체가 성공적으로 삭제되었습니다.' }, 200);

        } catch (error: unknown) {
            // R2 API 오류 등 기타 오류 처리
            console.error(`객체(${keyToDelete}) 삭제 중 오류 발생 (사용자: ${user.id}):`, error);
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
            return c.json({ error: `객체 삭제 중 오류가 발생했습니다: ${errorMessage}` }, 500);
        }
    });
