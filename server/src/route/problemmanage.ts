import { Hono } from 'hono';
import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema'; // 스키마 전체 임포트
import type { DbUser } from '../db/schema';
import {
    problemTable,
    tagTable,
    problemTagTable,
    majorChaptersTable,
    middleChaptersTable,
    coreConceptsTable,
    problemSetTable,
    // User 스키마가 있다면 임포트 (예: import { User } from '../db/schema';)
} from '../db/schema'; // 개별 스키마 임포트 (선택적)
import { eq, and } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';
import { StatusCode } from 'hono/utils/http-status';






// --- D1 데이터베이스 연결 함수 정의 ---
export const db = (env: Env): DrizzleD1Database<typeof schema> => {
    // 스키마를 명시적으로 전달하는 것이 좋습니다.
    return drizzle(env.DB, { schema });
};

// --- Drizzle 데이터베이스 타입 별칭 ---
type DrizzleDB = DrizzleD1Database<typeof schema>;

// --- Helper Functions (DrizzleDB 타입 사용, batch 아님) ---

// Major Chapter 조회 또는 생성 (개별 실행, 간단한 재시도 로직 추가)
async function findOrCreateMajorChapter(drizzleDb: DrizzleDB, name: string): Promise<string | null> {
    if (!name || name.trim() === '') return null;
    const trimmedName = name.trim();
    const existing = await drizzleDb.select({ id: majorChaptersTable.id }).from(majorChaptersTable).where(eq(majorChaptersTable.name, trimmedName)).limit(1);
    if (existing.length > 0) return existing[0].id;
    const newId = uuidv7();
    try {
        await drizzleDb.insert(schema.majorChaptersTable).values({ id: newId, name: trimmedName });
        console.log(`    > 새 대분류 생성: ${trimmedName} (ID: ${newId})`);
        return newId;
    } catch (e: any) {
        // 동시성 문제 등으로 생성 실패 시 (예: UNIQUE constraint) 다시 조회 시도
        console.warn(`대분류 생성 중 오류 (아마도 동시성 문제) (${trimmedName}): ${e.message}. 재조회 시도...`);
        const raceExisting = await drizzleDb.select({ id: majorChaptersTable.id }).from(majorChaptersTable).where(eq(majorChaptersTable.name, trimmedName)).limit(1);
        if (raceExisting.length > 0) {
            console.log(`    > 동시 생성된 대분류 사용 (ID: ${raceExisting[0].id})`);
            return raceExisting[0].id;
        } else {
            console.error(`대분류 생성 및 재조회 실패 (${trimmedName}):`, e);
            return null; // 또는 오류를 던질 수 있음
        }
    }
}

// Middle Chapter 조회 또는 생성 (개별 실행, 간단한 재시도 로직 추가)
async function findOrCreateMiddleChapter(drizzleDb: DrizzleDB, name: string, majorChapterId: string): Promise<string | null> {
    if (!name || name.trim() === '' || !majorChapterId) return null;
    const trimmedName = name.trim();
    const existing = await drizzleDb.select({ id: middleChaptersTable.id }).from(middleChaptersTable).where(and(eq(middleChaptersTable.name, trimmedName), eq(middleChaptersTable.majorChapterId, majorChapterId))).limit(1);
    if (existing.length > 0) return existing[0].id;
    const newId = uuidv7();
    try {
        await drizzleDb.insert(middleChaptersTable).values({ id: newId, name: trimmedName, majorChapterId: majorChapterId });
        console.log(`    > 새 중분류 생성: ${trimmedName} (ID: ${newId})`);
        return newId;
    } catch (e: any) {
        console.warn(`중분류 생성 중 오류 (${trimmedName}): ${e.message}. 재조회 시도...`);
        const raceExisting = await drizzleDb.select({ id: middleChaptersTable.id }).from(middleChaptersTable).where(and(eq(middleChaptersTable.name, trimmedName), eq(middleChaptersTable.majorChapterId, majorChapterId))).limit(1);
        if (raceExisting.length > 0) {
            console.log(`    > 동시 생성된 중분류 사용 (ID: ${raceExisting[0].id})`);
            return raceExisting[0].id;
        } else {
            console.error(`중분류 생성 및 재조회 실패 (${trimmedName}):`, e);
            return null;
        }
    }
}

// Core Concept 조회 또는 생성 (개별 실행, 간단한 재시도 로직 추가)
async function findOrCreateCoreConcept(drizzleDb: DrizzleDB, name: string): Promise<string | null> {
    if (!name || name.trim() === '') return null;
    const trimmedName = name.trim();
    const existing = await drizzleDb.select({ id: coreConceptsTable.id }).from(coreConceptsTable).where(eq(coreConceptsTable.name, trimmedName)).limit(1);
    if (existing.length > 0) return existing[0].id;
    const newId = uuidv7();
    try {
        await drizzleDb.insert(coreConceptsTable).values({ id: newId, name: trimmedName });
        console.log(`    > 새 핵심개념 생성: ${trimmedName} (ID: ${newId})`);
        return newId;
    } catch (e: any) {
        console.warn(`핵심개념 생성 중 오류 (${trimmedName}): ${e.message}. 재조회 시도...`);
        const raceExisting = await drizzleDb.select({ id: coreConceptsTable.id }).from(coreConceptsTable).where(eq(coreConceptsTable.name, trimmedName)).limit(1);
        if (raceExisting.length > 0) {
            console.log(`    > 동시 생성된 핵심개념 사용 (ID: ${raceExisting[0].id})`);
            return raceExisting[0].id;
        } else {
            console.error(`핵심개념 생성 및 재조회 실패 (${trimmedName}):`, e);
            return null;
        }
    }
}

// Tag 조회 또는 생성 (개별 실행, 간단한 재시도 로직 추가)
async function findOrCreateTag(drizzleDb: DrizzleDB, name: string, type: 'concept' | 'calculation' | string | null): Promise<string | null> {
    if (!name || name.trim() === '') return null;
    const trimmedName = name.trim();
    const tagType = (type === 'concept' || type === 'calculation') ? type : 'other';
    const existing = await drizzleDb.select({ tagId: tagTable.tagId }).from(tagTable).where(and(eq(tagTable.name, trimmedName), eq(tagTable.tagType, tagType))).limit(1);
    if (existing.length > 0) return existing[0].tagId;
    const newTagId = uuidv7();
    try {
        await drizzleDb.insert(tagTable).values({ tagId: newTagId, name: trimmedName, tagType: tagType });
        console.log(`    > 새 태그 생성: ${trimmedName} (Type: ${tagType}, ID: ${newTagId})`);
        return newTagId;
    } catch (e: any) {
        console.warn(`태그 생성 중 오류 (${trimmedName}): ${e.message}. 재조회 시도...`);
        const raceExisting = await drizzleDb.select({ tagId: tagTable.tagId }).from(tagTable).where(and(eq(tagTable.name, trimmedName), eq(tagTable.tagType, tagType))).limit(1);
        if (raceExisting.length > 0) {
            console.log(`    > 동시 생성된 태그 사용 (ID: ${raceExisting[0].tagId})`);
            return raceExisting[0].tagId;
        } else {
            console.error(`태그 생성 및 재조회 실패 (${trimmedName}):`, e);
            return null;
        }
    }
}

// Problem Set 조회 또는 생성 (개별 실행, 간단한 재시도 로직 추가)
async function findOrCreateProblemSet(drizzleDb: DrizzleDB, source: string | null, grade: string | null, semester: string | null): Promise<string> {
    const gradeStr = grade || '학년미정';
    const semesterStr = semester || '학기미정';
    const sourceStr = source || '출처미상';
    const setName = `${gradeStr} ${semesterStr} - ${sourceStr}`;
    console.log(`문제집 조회/생성 시도: ${setName}`);
    const existing = await drizzleDb.select({ problemSetId: problemSetTable.problemSetId }).from(problemSetTable).where(eq(problemSetTable.name, setName)).limit(1);
    if (existing.length > 0) {
        console.log(`  > 기존 문제집 사용 (ID: ${existing[0].problemSetId})`);
        return existing[0].problemSetId;
    }
    const newProblemSetId = uuidv7();
    try {
        await drizzleDb.insert(problemSetTable).values({ problemSetId: newProblemSetId, name: setName, grade: grade, semester: semester });
        console.log(`  > 새 문제집 생성 (ID: ${newProblemSetId})`);
        return newProblemSetId;
    } catch (e: any) {
        console.warn(`문제집 생성 중 오류 (${setName}): ${e.message}. 재조회 시도...`);
        const raceExisting = await drizzleDb.select({ problemSetId: problemSetTable.problemSetId }).from(problemSetTable).where(eq(problemSetTable.name, setName)).limit(1);
        if (raceExisting.length > 0) {
            console.log(`  > 동시 생성된 문제집 사용 (ID: ${raceExisting[0].problemSetId})`);
            return raceExisting[0].problemSetId;
        } else {
            console.error(`문제집 생성 및 재조회 실패 (${setName}):`, e);
            // 문제집 생성 실패는 심각하므로 오류를 던짐
            throw new Error(`문제집 생성 및 재조회 실패: ${setName}`);
        }
    }
}


// --- Hono 라우터 설정 ---
interface ProblemPayload {
    problem_number: number | string; // 문제 번호 (1.1 같은 경우 고려)
    problem_text: string;   // 문제 텍스트
    answer: string;         // 정답
    detailed_solution: string; // 상세 풀이
    page_number: number | null; // 페이지 번호 (nullable)
    problem_type: string;   // 문제 유형
    grade_level: string;    // 학년
    semester: string;       // 학기
    source: string;         // 출처
    majorChaptersTable: string;  // 대분류 이름
    middleChaptersTable: string; // 중분류 이름
    coreConcepts: string;   // 핵심 개념 이름
    problemCategories: string; // 문제 카테고리 (스키마 필드명 확인 필요)
    difficulty: string;     // 난이도
    score: string | number; // 배점 (DB 타입에 따라 number로 받을 수도 있음)
    concept_keywords: string[]; // 개념 키워드 태그 배열
    calculation_keywords: string[]; // 계산 키워드 태그 배열
}



// Hono 앱 인스턴스 생성 (환경 변수 및 Variable 타입 지정)
const app = new Hono<{ Bindings: Env; Variables: { user: DbUser; }; }>();

// --- 문제 업로드 라우트 ---
export const problemupload = app.post('/manage/problemsupload', async (c) => {
    // 1. 사용자 인증 확인
    const user = c.get('user');
    if (!user || !user.id) {
        return c.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }
    console.log(`사용자 ${user.id}의 문제 업로드 요청 시작`);

    // 2. 요청 본문 파싱 및 유효성 검사
    let payload: { problems: ProblemPayload[] };
    try {
        payload = await c.req.json();
        if (!payload || !Array.isArray(payload.problems)) {
            throw new Error("요청 본문에 'problems' 배열이 필요합니다.");
        }
        if (payload.problems.length === 0) {
            return c.json({ error: "'problems' 배열이 비어 있습니다." }, { status: 400 });
        }
        console.log(`처리할 문제 개수: ${payload.problems.length}`);
    } catch (error: any) {
        console.error("요청 본문 파싱 오류:", error);
        return c.json({ error: `잘못된 요청 본문입니다: ${error.message}` }, { status: 400 });
    }

    const problemsToProcess = payload.problems;

    // 3. 결과 집계 객체 초기화
    const results = {
        successCount: 0,
        errorCount: 0,
        errors: [] as { problemNumber: number | string; error: string; }[],
        problemSetId: null as string | null, // 최종 문제집 ID
    };

    // 4. Drizzle 인스턴스 생성
    const drizzleInstance = db(c.env);

    try {
        // 5. 문제집 ID 결정 (오류 수정됨)
        const firstProblem = problemsToProcess[0];
        // findOrCreateProblemSet 호출 시 인자 전달 확인
        results.problemSetId = await findOrCreateProblemSet(
            drizzleInstance,
            firstProblem.source || null,
            firstProblem.grade_level || null,
            firstProblem.semester || null
        );
        console.log(`대상 문제집 ID 결정: ${results.problemSetId}`);

        // 6. 각 문제 순차적 처리 (개별 오류 처리)
        console.log(`문제 처리 루프 시작 (총 ${problemsToProcess.length}개)`);
        for (const [index, p] of problemsToProcess.entries()) {
            const currentProblemIdentifier = p.problem_number ?? `인덱스 ${index}`; // 식별자
            console.log(`[${index + 1}/${problemsToProcess.length}] 문제 처리 시작 (번호: ${currentProblemIdentifier})`);

            // 각 문제 처리를 위한 try-catch 블록
            try {
                // 6a. 관련 데이터 ID 조회/생성 (Helper 함수 사용)
                const majorChapterId = await findOrCreateMajorChapter(drizzleInstance, p.majorChaptersTable);
                const middleChapterId = majorChapterId ? await findOrCreateMiddleChapter(drizzleInstance, p.middleChaptersTable, majorChapterId) : null;
                const coreConceptId = await findOrCreateCoreConcept(drizzleInstance, p.coreConcepts);
                const conceptTagIds = await Promise.all((p.concept_keywords || []).map(kw => findOrCreateTag(drizzleInstance, kw, 'concept')));
                const calculationTagIds = await Promise.all((p.calculation_keywords || []).map(kw => findOrCreateTag(drizzleInstance, kw, 'calculation')));
                const allTagIds = [...new Set([...conceptTagIds, ...calculationTagIds].filter((id): id is string => id !== null))];

                // 6b. 현재 문제 관련 INSERT 문들을 batch 배열로 준비
                const newProblemId = uuidv7(); // 새 문제 ID 생성
                const batchOperations = []; // Drizzle 쿼리 빌더 객체들을 담을 배열

                // 문제(problem) 테이블 INSERT 쿼리 빌더 추가
                batchOperations.push(
                    drizzleInstance.insert(problemTable).values({
                        problemId: newProblemId,
                        problemSetId: results.problemSetId,
                        creatorId: user.id,
                        source: p.source,
                        page: p.page_number, // null 허용 시 그대로 전달
                        // questionNumber는 스키마 타입에 맞게 처리 (예: TEXT)
                        questionNumber: typeof p.problem_number === 'number'
                            ? p.problem_number // 이미 number 타입이면 그대로 사용
                            : parseFloat(p.problem_number), // string 타입이면 숫자로 파싱
                        answer: p.answer,
                        problemType: p.problem_type,
                        majorChapterId: majorChapterId,
                        middleChapterId: middleChapterId,
                        coreConceptId: coreConceptId,
                        problemCategory: p.problemCategories,
                        difficulty: p.difficulty,
                        // score는 스키마 타입에 맞게 처리 (예: TEXT)
                        score: p.score === null || p.score === undefined ? null : p.score.toString(),
                        questionText: p.problem_text,
                        solutionText: p.detailed_solution,
                    })
                );

                // 태그 연결(problemTag) 테이블 INSERT 쿼리 빌더 추가 (태그가 있을 경우)
                if (allTagIds.length > 0) {
                    const problemTagData = allTagIds.map(tagId => ({
                        id: uuidv7(),
                        problemId: newProblemId,
                        tagId: tagId,
                    }));
                    batchOperations.push(drizzleInstance.insert(problemTagTable).values(problemTagData));
                }

                // 6c. 준비된 INSERT 쿼리 빌더 배열을 batch로 실행 (원자적)
                if (batchOperations.length > 0) {
                    console.log(`  - Batch 실행 시작 (문제: ${currentProblemIdentifier}, ${batchOperations.length}개 작업)`);
                    try {
                        // --- !!! 타입 오류 해결 지점 (방법 b: 튜플 타입 단언) !!! ---
                        // 배열 요소의 타입을 동적으로 추론
                        type BatchOperationType = typeof batchOperations[number];
                        // batchOperations 배열이 최소 1개의 요소를 가진 튜플임을 단언
                        await drizzleInstance.batch(batchOperations as [BatchOperationType, ...BatchOperationType[]]);
                        // --- !!! 타입 오류 해결 지점 끝 !!! ---

                        console.log(`  - Batch 실행 성공 (문제: ${currentProblemIdentifier})`);
                        results.successCount++; // 성공 카운트 증가
                        console.log(`[${index + 1}/${problemsToProcess.length}] 문제 처리 성공 (번호: ${currentProblemIdentifier})`);
                    } catch (batchError: any) {
                        // batch 실행 자체에서 오류 발생 시 처리
                        console.error(`Batch 실행 중 오류 발생 (문제: ${currentProblemIdentifier}):`, batchError.message);
                        console.error("Batch 오류 스택:", batchError.stack);
                        // batch는 원자적이므로, 여기서 오류나면 해당 문제 전체 롤백됨
                        throw batchError; // 오류를 다시 던져 상위 catch에서 처리하도록 함
                    }
                } else {
                    // 실행할 작업이 없는 경우 (거의 발생하지 않음)
                    console.warn(`[${index + 1}/${problemsToProcess.length}] 문제 ${currentProblemIdentifier}: 실행할 batch 작업이 없습니다.`);
                    results.errorCount++;
                    results.errors.push({
                        problemNumber: currentProblemIdentifier,
                        error: 'DB 저장 작업 없음',
                    });
                }

            } catch (innerError: any) {
                // 개별 문제 처리 중 오류 발생 (예: Helper 함수 실패 또는 batch 실패)
                console.error(`[${index + 1}/${problemsToProcess.length}] 문제 처리 중 오류 (번호: ${currentProblemIdentifier}):`, innerError.message);
                console.error("오류 스택:", innerError.stack);
                results.errorCount++;
                results.errors.push({
                    problemNumber: currentProblemIdentifier,
                    error: innerError.message || '개별 문제 처리 중 알 수 없는 오류 발생',
                });
            }
        } // end of problem processing loop
        console.log('모든 문제 처리 시도 완료.');

    } catch (error: any) {
        // 문제 처리 루프 시작 전 오류 (예: findOrCreateProblemSet 실패)
        console.error('문제 일괄 처리 중 초기 단계 오류:', error.message, error.stack);
        results.errorCount = problemsToProcess.length; // 모든 문제를 실패로 간주
        results.errors.push({
            problemNumber: '전체 초기화 단계',
            error: `초기 설정 중 오류 발생: ${error.message}`
        });
        // c.json 호출 방식 확인
        return c.json({
            message: "문제 처리 초기화 중 오류가 발생했습니다.",
            successCount: 0,
            errorCount: problemsToProcess.length,
            errors: results.errors,
            problemSetId: results.problemSetId
        }, { status: 500 }); // Internal Server Error
    }

    // 7. 최종 결과 반환
    let statusCode: StatusCode = 201; // Hono의 StatusCode 타입 사용
    let message: string;

    if (results.errorCount === 0) {
        // 전체 성공
        statusCode = 201; // Created
        message = `총 ${results.successCount}개의 문제가 문제집(ID: ${results.problemSetId})에 성공적으로 저장되었습니다.`;
    } else if (results.successCount > 0) {
        // 부분 성공
        statusCode = 207; // Multi-Status
        message = `총 ${problemsToProcess.length}개 문제 중 ${results.successCount}개 성공, ${results.errorCount}개 실패했습니다. 문제집 ID: ${results.problemSetId}`;
    } else {
        // 전체 실패
        statusCode = 400; // Bad Request (또는 오류 성격에 따라 500)
        message = `총 ${problemsToProcess.length}개의 문제 처리 중 모두 실패했습니다. 문제집 생성 시도 ID: ${results.problemSetId}`;
    }

    console.log(`최종 결과: ${message}, 상태코드: ${statusCode}`);
    // c.json 호출 방식 확인
    return c.json({
        message: message,
        successCount: results.successCount,
        errorCount: results.errorCount,
        errors: results.errors, // 개별 오류 상세 정보 포함
        problemSetId: results.problemSetId // 결과와 함께 문제집 ID 포함
    }, { status: statusCode });
});

// export default app; // Hono 앱을 export 하는 방식에 맞게 주석 해제 또는 수정