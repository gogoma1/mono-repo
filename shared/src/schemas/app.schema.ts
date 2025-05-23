// filepath: monorepo/shared/src/schemas/app.schema.ts
import { z } from 'zod';

// Helper for timestamp preprocessing
const toTimestamp = z.preprocess(
    (val) => {
        if (typeof val === 'string' || typeof val === 'number' || val instanceof Date) {
            const date = new Date(val);
            if (!isNaN(date.getTime())) {
                return date.getTime(); // Return milliseconds
            }
        }
        // If conversion fails, return original value. Zod will then catch the type error.
        // This helps in debugging by showing what the original problematic value was.
        return val;
    },
    z.number().int() // Expect an integer (Unix timestamp in milliseconds)
);

const toNullableTimestamp = z.preprocess(
    (val) => {
        if (val === null || val === undefined) return null;
        if (typeof val === 'string' || typeof val === 'number' || val instanceof Date) {
            const date = new Date(val);
            if (!isNaN(date.getTime())) {
                return date.getTime(); // Return milliseconds
            }
        }
        return val;
    },
    z.number().int().nullable()
);


// --- 사용자 및 인증 관련 스키마 ---
export const userSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    emailVerified: z.boolean().default(false),
    image: z.string().nullable(),
    createdAt: toTimestamp,
    updatedAt: toTimestamp,
    subscriptionId: z.string().nullable(),
    lastKeyGeneratedAt: toNullableTimestamp,
});

export const sessionSchema = z.object({
    id: z.string(),
    userId: z.string(),
    token: z.string(),
    expiresAt: toTimestamp,
    ipAddress: z.string().nullable(),
    userAgent: z.string().nullable(),
    createdAt: toTimestamp,
    updatedAt: toTimestamp,
});

export const accountSchema = z.object({
    id: z.string(),
    userId: z.string(),
    accountId: z.string(),
    providerId: z.string(),
    accessToken: z.string().nullable(),
    refreshToken: z.string().nullable(),
    accessTokenExpiresAt: toNullableTimestamp,
    refreshTokenExpiresAt: toNullableTimestamp,
    scope: z.string().nullable(),
    idToken: z.string().nullable(),
    password: z.string().nullable(),
    createdAt: toTimestamp,
    updatedAt: toTimestamp,
});

export const verificationSchema = z.object({
    id: z.string(),
    identifier: z.string(),
    value: z.string(),
    expiresAt: toTimestamp,
    createdAt: toTimestamp,
    updatedAt: toTimestamp,
});

export const rateLimitSchema = z.object({
    id: z.string(),
    userId: z.string(),
    endpoint: z.string(),
    count: z.number().int().default(0),
    resetAt: toTimestamp,
    createdAt: toTimestamp,
    updatedAt: toTimestamp,
});

// --- 사용자 프로필 및 학생 정보 스키마 ---
export const profileSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    position: z.string(),
    academy_name: z.string(),
    region: z.string(),
    createdAt: toTimestamp,
    updatedAt: toTimestamp,
});

export const studentSchema = z.object({
    id: z.string(),
    tuition: z.preprocess(
        (val) => {
            if (typeof val === 'string') {
                if (val.trim() === "") return null;
                const numStr = val.replace(/,/g, '');
                const num = parseFloat(numStr);
                return isNaN(num) ? val : num;
            }
            return val;
        },
        z.number().int().nullable()
    ),
    admission_date: z.string().nullable(),
    discharge_date: z.string().nullable(),
    principal_id: z.string().nullable(),
    grade: z.string(),
    student_phone: z.string().nullable(),
    guardian_phone: z.string().nullable(),
    school_name: z.string().nullable(),
    class: z.string().nullable(),
    student_name: z.string(),
    teacher: z.string().nullable(),
    status: z.enum(['재원', '휴원', '퇴원']),
    subject: z.string(),
    createdAt: toTimestamp,
    updatedAt: toTimestamp,
});


// --- 문제집 및 문제 관련 스키마 (시간 필드 toTimestamp 적용) ---
export const problemSetSchema = z.object({
    problemSetId: z.string(),
    name: z.string(),
    grade: z.string().nullable(),
    semester: z.string().nullable(),
    avgDifficulty: z.string().nullable(),
    coverImage: z.string().nullable(),
    description: z.string().nullable(),
    publishedYear: z.number().int().nullable(),
    createdAt: toTimestamp,
    updatedAt: toTimestamp,
});

export const majorChapterSchema = z.object({
    id: z.string(),
    name: z.string(),
    createdAt: toTimestamp,
    updatedAt: toTimestamp,
});

export const middleChapterSchema = z.object({
    id: z.string(),
    majorChapterId: z.string(),
    name: z.string(),
    createdAt: toTimestamp,
    updatedAt: toTimestamp,
});

export const coreConceptSchema = z.object({
    id: z.string(),
    name: z.string(),
    createdAt: toTimestamp,
    updatedAt: toTimestamp,
});

export const problemSchema = z.object({
    problemId: z.string(),
    problemSetId: z.string().nullable(),
    source: z.string().nullable(),
    page: z.number().int().nullable(),
    questionNumber: z.number().nullable(),
    answer: z.string().nullable(),
    problemType: z.string().nullable(),
    creatorId: z.string(),
    majorChapterId: z.string().nullable(),
    middleChapterId: z.string().nullable(),
    coreConceptId: z.string().nullable(),
    problemCategory: z.string().nullable(),
    difficulty: z.string().nullable(),
    score: z.string().nullable(),
    questionText: z.string().nullable(),
    optionText: z.string().nullable(),
    solutionText: z.string().nullable(),
    createdAt: toTimestamp,
    updatedAt: toTimestamp,
});

export const tagSchema = z.object({
    tagId: z.string(),
    name: z.string(),
    tagType: z.string().nullable(),
    createdAt: toTimestamp,
    updatedAt: toTimestamp,
});

export const problemTagSchema = z.object({
    id: z.string(),
    problemId: z.string(),
    tagId: z.string(),
    createdAt: toTimestamp,
    updatedAt: toTimestamp,
});

export const userPurchaseSchema = z.object({
    id: z.string(),
    userId: z.string().nullable(),
    problemSetId: z.string().nullable(),
    purchaseDate: toNullableTimestamp,
    purchasePrice: z.number().int().nullable(),
    licensePeriod: z.number().int().nullable(),
    createdAt: toTimestamp,
    updatedAt: toTimestamp,
});

export const userProblemLogSchema = z.object({
    id: z.string(),
    userId: z.string().nullable(),
    problemId: z.string().nullable(),
    isCorrect: z.boolean().nullable(),
    aSolved: z.boolean().default(false),
    qUnknown: z.boolean().default(false),
    tThink: z.boolean().default(false),
    qtFailed: z.boolean().default(false),
    timeTaken: z.number().int().nullable(),
    createdAt: toTimestamp,
    updatedAt: toTimestamp,
});

export const problemStatsSchema = z.object({
    id: z.string(),
    problemSetId: z.string().nullable(),
    problemId: z.string().nullable(),
    attemptCount: z.number().int().default(0),
    correctCount: z.number().int().default(0),
    wrongRate: z.string().nullable(),
    avgTime: z.number().int().nullable(),
    createdAt: toTimestamp,
    updatedAt: toTimestamp,
});


// --- Zod 추론 타입 ---
export type UserZod = z.infer<typeof userSchema>;
export type SessionZod = z.infer<typeof sessionSchema>;
export type AccountZod = z.infer<typeof accountSchema>;
export type VerificationZod = z.infer<typeof verificationSchema>;
export type RateLimitZod = z.infer<typeof rateLimitSchema>;
export type ProfileZod = z.infer<typeof profileSchema>;
export type StudentZod = z.infer<typeof studentSchema>;
export type ProblemSetZod = z.infer<typeof problemSetSchema>;
export type MajorChapterZod = z.infer<typeof majorChapterSchema>;
export type MiddleChapterZod = z.infer<typeof middleChapterSchema>;
export type CoreConceptZod = z.infer<typeof coreConceptSchema>;
export type ProblemZod = z.infer<typeof problemSchema>;
export type TagZod = z.infer<typeof tagSchema>;
export type ProblemTagZod = z.infer<typeof problemTagSchema>;
export type UserPurchaseZod = z.infer<typeof userPurchaseSchema>;
export type UserProblemLogZod = z.infer<typeof userProblemLogSchema>;
export type ProblemStatsZod = z.infer<typeof problemStatsSchema>;


// --- 학생 생성 및 수정 스키마 ---
export const createStudentBodySchema = z.object({
    student_name: z.string().min(1, "학생 이름은 필수입니다."),
    grade: z.string().min(1, "학년은 필수입니다."),
    status: z.enum(['재원', '휴원', '퇴원']),
    subject: z.string().min(1, "과목은 필수입니다."),
    tuition: z.union([z.string().min(1), z.number().min(0)]), // 입력은 문자열이나 숫자 가능
    admission_date: z.string().nullable().optional(),
    student_phone: z.string().nullable().optional(),
    guardian_phone: z.string().nullable().optional(),
    school_name: z.string().nullable().optional(),
    class: z.string().nullable().optional(),
    teacher: z.string().nullable().optional(),
    // discharge_date는 생성 시에는 보통 설정하지 않음
});
export type CreateStudentInput = z.infer<typeof createStudentBodySchema>;


export const updateStudentBodySchema = createStudentBodySchema.partial().extend({
    // id는 URL 파라미터로 받고, body에서는 id를 제외한 필드만 선택적으로 받음
    // status 등 모든 필드가 optional이 됨 (partial)
    discharge_date: z.string().nullable().optional(), // 퇴원일 수정 가능
});
export type UpdateStudentInputBody = z.infer<typeof updateStudentBodySchema>;

// update API 호출 시 사용할 전체 타입 (id 포함)
export const updateStudentSchema = updateStudentBodySchema.extend({
    id: z.string(),
});
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;