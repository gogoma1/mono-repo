

import { sql } from "drizzle-orm";
// 필요한 타입 및 함수 import (AnySQLiteColumn 추가)
import { integer, real, sqliteTable, text, } from "drizzle-orm/sqlite-core";

// --- 사용자 및 인증 관련 테이블 (camelCase 컬럼명 유지) ---
export const userTable = sqliteTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: integer("emailVerified", { mode: "boolean" }).notNull().default(false),
    image: text("image"),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
    subscriptionId: text("subscriptionId"),
    lastKeyGeneratedAt: integer("lastKeyGeneratedAt", { mode: "timestamp" }),
});

export const sessionTable = sqliteTable("session", {
    id: text("id").primaryKey(),
    userId: text("userId").notNull().references(() => userTable.id, { onDelete: 'cascade' }),
    token: text("token").notNull(),
    expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const accountTable = sqliteTable("account", {
    id: text("id").primaryKey(),
    userId: text("userId").notNull().references(() => userTable.id, { onDelete: 'cascade' }),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
    refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp" }),
    scope: text("scope"),
    idToken: text("idToken"),
    password: text("password"),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const verificationTable = sqliteTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const rateLimitTable = sqliteTable("rateLimit", {
    id: text("id").primaryKey(),
    userId: text("userId").notNull().references(() => userTable.id, { onDelete: 'cascade' }),
    endpoint: text("endpoint").notNull(),
    count: integer("count").notNull().default(0),
    resetAt: integer("resetAt", { mode: "timestamp" }).notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

// --- 사용자 프로필 및 학생 정보 테이블 (camelCase 컬럼명 유지) ---
export const profilesTable = sqliteTable("profiles", {
    id: text("id").primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    position: text("position").notNull(),
    academy_name: text("academy_name").notNull(),
    region: text("region").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const studentsTable = sqliteTable("students", {
    id: text('id').primaryKey(),
    tuition: integer("tuition").notNull(),
    admission_date: text("admission_date"),
    discharge_date: text("discharge_date"),
    principal_id: text("principal_id").references(() => profilesTable.id, { onDelete: 'set null' }),
    grade: text("grade").notNull(),
    student_phone: text("student_phone"),
    guardian_phone: text("guardian_phone"),
    school_name: text("school_name"),
    class: text("class"),
    student_name: text("student_name").notNull(),
    teacher: text("teacher"),
    status: text("status").notNull(),
    subject: text("subject").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

// --- 문제집 및 문제 관련 테이블 (camelCase 컬럼명 통일) ---
export const problemSetTable = sqliteTable("problem_set", {
    problemSetId: text("problem_set_id").primaryKey(),
    name: text("name").notNull(),
    grade: text("grade"),
    semester: text("semester"),
    avgDifficulty: text("avg_difficulty"),
    coverImage: text("cover_image"),
    description: text("description"),
    publishedYear: integer("published_year"),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`), // camelCase 통일
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`), // camelCase 통일
});

// --- 새로운 챕터/개념 테이블 (camelCase 컬럼명 통일) ---
export const majorChaptersTable = sqliteTable("major_chapters", {
    id: text("id").primaryKey(),
    name: text("name").notNull().unique(),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`), // camelCase 통일
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`), // camelCase 통일
});

export const middleChaptersTable = sqliteTable("middle_chapters", {
    id: text("id").primaryKey(),
    majorChapterId: text("major_chapter_id").notNull().references(() => majorChaptersTable.id, { onDelete: 'cascade' }),
    name: text("name").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`), // camelCase 통일
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`), // camelCase 통일
});

export const coreConceptsTable = sqliteTable("core_concepts", {
    id: text("id").primaryKey(),
    name: text("name").notNull().unique(),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`), // camelCase 통일
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`), // camelCase 통일
});

// --- 문제 테이블 (camelCase 컬럼명 통일) ---
export const problemTable = sqliteTable("problem", {
    problemId: text("problem_id").primaryKey(),
    problemSetId: text("problem_set_id").references(() => problemSetTable.problemSetId, { onDelete: 'set null' }),
    source: text("source"),
    page: integer("page"),
    questionNumber: real("question_number"),
    answer: text("answer"),
    problemType: text("problem_type"),
    creatorId: text("creator_id").notNull().references(() => userTable.id, { onDelete: 'restrict' }), // <-- 추가된 부분

    // 외래 키 참조
    majorChapterId: text("major_chapter_id").references(() => majorChaptersTable.id, { onDelete: 'set null' }),
    middleChapterId: text("middle_chapter_id").references(() => middleChaptersTable.id, { onDelete: 'set null' }),
    coreConceptId: text("core_concept_id").references(() => coreConceptsTable.id, { onDelete: 'set null' }),

    problemCategory: text("problem_category"),
    difficulty: text("difficulty"),
    score: text("score"),
    questionText: text("question_text"),
    optionText: text("option_text"),
    solutionText: text("solution_text"),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`), // camelCase 통일
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`), // camelCase 통일
});

// --- 태그 및 문제-태그 연결 테이블 (camelCase 컬럼명 통일) ---
export const tagTable = sqliteTable("tag", {
    tagId: text("tag_id").primaryKey(),
    name: text("name").notNull().unique(),
    tagType: text("tag_type"),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`), // camelCase 통일
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`), // camelCase 통일
});

export const problemTagTable = sqliteTable("problem_tag", {
    id: text("id").primaryKey(),
    problemId: text("problem_id").notNull().references(() => problemTable.problemId, { onDelete: 'cascade' }),
    tagId: text("tag_id").notNull().references(() => tagTable.tagId, { onDelete: 'cascade' }),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`), // camelCase 통일
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`), // camelCase 통일
});

// --- 사용자 구매 및 풀이 로그, 통계 테이블 (camelCase 컬럼명 통일) ---
export const userPurchaseTable = sqliteTable("user_purchase", {
    id: text("id").primaryKey(),
    userId: text("userId").references(() => userTable.id, { onDelete: 'cascade' }), // camelCase 유지
    problemSetId: text("problem_set_id").references(() => problemSetTable.problemSetId, { onDelete: 'set null' }),
    purchaseDate: integer("purchaseDate", { mode: "timestamp" }), // camelCase 유지
    purchasePrice: integer("purchasePrice"), // camelCase 유지
    licensePeriod: integer("licensePeriod"), // camelCase 유지
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`), // camelCase 통일
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`), // camelCase 통일
});

export const userProblemLogTable = sqliteTable("user_problem_log", {
    id: text("id").primaryKey(),
    userId: text("userId").references(() => userTable.id, { onDelete: 'cascade' }), // camelCase 유지
    problemId: text("problem_id").references(() => problemTable.problemId, { onDelete: 'cascade' }),
    isCorrect: integer("is_correct", { mode: "boolean" }),
    aSolved: integer("a_solved", { mode: "boolean" }).default(false),
    qUnknown: integer("q_unknown", { mode: "boolean" }).default(false),
    tThink: integer("t_think", { mode: "boolean" }).default(false),
    qtFailed: integer("qt_failed", { mode: "boolean" }).default(false),
    timeTaken: integer("time_taken"),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`), // camelCase 통일
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`), // camelCase 통일
});

export const problemStatsTable = sqliteTable("problem_stats", {
    id: text("id").primaryKey(),
    problemSetId: text("problem_set_id").references(() => problemSetTable.problemSetId, { onDelete: 'cascade' }),
    problemId: text("problem_id").references(() => problemTable.problemId, { onDelete: 'cascade' }),
    attemptCount: integer("attempt_count").default(0),
    correctCount: integer("correct_count").default(0),
    wrongRate: text("wrong_rate"),
    avgTime: integer("avg_time"),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`), // camelCase 통일
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`), // camelCase 통일
});


// --- 타입 정의 (Select 시 타입 추론용) ---
// 타입 이름은 이전과 동일하게 유지
export type DbUser = typeof userTable.$inferSelect;
export type DbSession = typeof sessionTable.$inferSelect;
export type DbAccount = typeof accountTable.$inferSelect;
export type DbVerification = typeof verificationTable.$inferSelect;
export type DbRateLimit = typeof rateLimitTable.$inferSelect;
export type DbProfile = typeof profilesTable.$inferSelect;
export type DbStudent = typeof studentsTable.$inferSelect;
export type ProblemSet = typeof problemSetTable.$inferSelect;
export type MajorChapter = typeof majorChaptersTable.$inferSelect;
export type MiddleChapter = typeof middleChaptersTable.$inferSelect;
export type CoreConcept = typeof coreConceptsTable.$inferSelect;
export type Problem = typeof problemTable.$inferSelect;
export type Tag = typeof tagTable.$inferSelect;
export type ProblemTag = typeof problemTagTable.$inferSelect;
export type UserPurchase = typeof userPurchaseTable.$inferSelect;
export type UserProblemLog = typeof userProblemLogTable.$inferSelect;
export type ProblemStats = typeof problemStatsTable.$inferSelect;