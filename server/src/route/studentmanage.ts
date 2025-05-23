// filepath: /monorepo/server/src/route/studentmanage.ts
import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { db } from '../auth';
import { studentsTable, type DbUser, type DbStudent } from '../db/schema';
import { eq } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';

import {
    studentSchema as clientStudentZodSchema,
    createStudentBodySchema,
    updateStudentBodySchema,
    type StudentZod as ClientStudent,
    type CreateStudentInput as ClientCreateStudentInput,
    type UpdateStudentInputBody as ClientUpdateStudentInputBody,
} from '../../../shared/src/schemas/app.schema';

// Env 타입은 전역 또는 index.ts에서 가져옴
// import type { Env } from '../index'; // 만약 index.ts에서 Env를 export 한다면
// worker-configuration.d.ts 에 의해 전역 Env가 사용 가능하다고 가정.

interface StudentManageVariables {
    user: DbUser;
}

const convertDbStudentToClient = (dbStudent: DbStudent | null | undefined): ClientStudent | null => {
    if (!dbStudent) return null;
    try {
        const parsed = clientStudentZodSchema.parse({ ...dbStudent });
        return parsed;
    } catch (error) {
        console.error("Error converting DB student to client student:", error, "\nOriginal DB data:", JSON.stringify(dbStudent));
        return null;
    }
};

const studentInternalRoutes = new Hono<{ Bindings: Env; Variables: StudentManageVariables }>()
    .get('/', async (c) => {
        const user = c.get("user");
        const env = c.env as Env; // 명시적 캐스팅 (worker-configuration.d.ts의 Env 사용)
        if (!user || !user.id) return c.json({ error: "인증되지 않은 사용자입니다." }, 401);
        try {
            const studentListFromDb = await db(env)
                .select().from(studentsTable)
                .where(eq(studentsTable.principal_id, user.id)).all();
            const clientStudentList = studentListFromDb.map(convertDbStudentToClient).filter(s => s !== null) as ClientStudent[];
            return c.json(clientStudentList);
        } catch (error: any) {
            console.error("학생 조회 중 오류:", error);
            return c.json({ error: "학생 조회 중 오류가 발생했습니다.", message: error?.message }, 500);
        }
    })
    .post('/',
        validator('json', (value, c) => {
            const parsed = createStudentBodySchema.safeParse(value);
            if (!parsed.success) return c.json({ error: "잘못된 학생 정보.", details: parsed.error.flatten().fieldErrors }, 400);
            return parsed.data;
        }),
        async (c) => {
            const user = c.get("user");
            const env = c.env as Env;
            if (!user || !user.id) return c.json({ error: "인증되지 않은 사용자입니다." }, 401);
            const validatedBody = c.req.valid('json') as ClientCreateStudentInput;
            try {
                const studentDataForDb = {
                    id: uuidv7(), student_name: validatedBody.student_name, grade: validatedBody.grade,
                    status: validatedBody.status, subject: validatedBody.subject, tuition: Number(validatedBody.tuition),
                    admission_date: validatedBody.admission_date || null, student_phone: validatedBody.student_phone || null,
                    guardian_phone: validatedBody.guardian_phone || null, school_name: validatedBody.school_name || null,
                    class: validatedBody.class || null, teacher: validatedBody.teacher || null, principal_id: user.id,
                    discharge_date: null,
                    // createdAt, updatedAt은 DB default 사용
                };
                const [newStudentFromDb] = await db(env).insert(studentsTable).values(studentDataForDb).returning();
                const clientStudent = convertDbStudentToClient(newStudentFromDb);
                if (!clientStudent) return c.json({ error: "학생 추가 후 데이터 변환 실패." }, 500);
                return c.json(clientStudent, 201);
            } catch (error: any) {
                console.error("학생 추가 중 오류:", error);
                return c.json({ error: "학생 추가 중 오류.", message: error?.message }, 500);
            }
        }
    )
    .put('/:id',
        validator('param', (value, c) => {
            const id = value['id'];
            if (!id || typeof id !== 'string' || id.trim() === '') return c.json({ error: "유효한 학생 ID 필요." }, 400);
            return { id };
        }),
        validator('json', (value, c) => {
            const parsed = updateStudentBodySchema.safeParse(value);
            if (!parsed.success) return c.json({ error: "잘못된 수정 정보.", details: parsed.error.flatten().fieldErrors }, 400);
            return parsed.data;
        }),
        async (c) => {
            const user = c.get("user");
            const env = c.env as Env;
            if (!user || !user.id) return c.json({ error: "인증되지 않은 사용자입니다." }, 401);
            const { id } = c.req.valid('param');
            const updateBody = c.req.valid('json') as ClientUpdateStudentInputBody;
            try {
                const updatePayload: Partial<Omit<DbStudent, 'id' | 'createdAt' | 'principal_id' | 'updatedAt'>> = {};
                (Object.keys(updateBody) as Array<keyof ClientUpdateStudentInputBody>).forEach(key => {
                    if (updateBody[key] !== undefined && key in studentsTable) {
                        (updatePayload as any)[key] = updateBody[key];
                    }
                });
                if (updatePayload.tuition !== undefined && updatePayload.tuition !== null) {
                    updatePayload.tuition = Number(updatePayload.tuition);
                }
                if (Object.keys(updatePayload).length === 0) return c.json({ error: "수정할 내용 없음." }, 400);
                // updatedAt은 DB default가 자동 갱신하도록 함
                const [updatedStudentFromDb] = await db(env).update(studentsTable).set(updatePayload).where(eq(studentsTable.id, id)).returning();
                if (!updatedStudentFromDb) return c.json({ error: "학생을 찾을 수 없음." }, 404);
                const clientStudent = convertDbStudentToClient(updatedStudentFromDb);
                if (!clientStudent) return c.json({ error: "학생 수정 후 데이터 변환 실패." }, 500);
                return c.json(clientStudent);
            } catch (error: any) {
                console.error("학생 수정 중 오류:", error);
                return c.json({ error: "학생 수정 중 오류.", message: error?.message }, 500);
            }
        }
    )
    .delete('/:id',
        validator('param', (value, c) => {
            const id = value['id'];
            if (!id || typeof id !== 'string' || id.trim() === '') return c.json({ error: "유효한 학생 ID 필요." }, 400);
            return { id };
        }),
        async (c) => {
            const user = c.get("user");
            const env = c.env as Env;
            if (!user || !user.id) return c.json({ error: "인증되지 않은 사용자입니다." }, 401);
            const { id } = c.req.valid('param');
            try {
                const [deletedStudent] = await db(env).delete(studentsTable).where(eq(studentsTable.id, id)).returning({ id: studentsTable.id });
                if (!deletedStudent || !deletedStudent.id) return c.json({ error: "삭제할 학생을 찾을 수 없음." }, 404);
                return c.json({ message: "학생이 성공적으로 삭제되었습니다.", id: deletedStudent.id });
            } catch (error: any) {
                console.error("학생 삭제 중 오류:", error);
                return c.json({ error: "학생 삭제 중 오류.", message: error?.message }, 500);
            }
        }
    );

// 이 타입은 rpc.ts 에서 tempClient.manage.student 로 추출될 타입과 유사해야 함
// export type StudentManagementInternalApiType = typeof studentInternalRoutes;

// stManage는 /manage/student 경로에 위 라우트들을 마운트
export const stManage = new Hono<{ Bindings: Env; Variables: StudentManageVariables }>()
    .route('/manage/student', studentInternalRoutes);