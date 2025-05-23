// /monorepo/client/src/components/MyStudentPage.tsx (예시 컴포넌트)

import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchStudentsAPI } from '../../src2/entities/student/api/studentApi'; // API 함수 경로
import type { StudentZod as Student } from '../../../shared/src/schemas/app.schema';

const MyStudentPage: React.FC = () => {
    const { data: students, isLoading, isError, error } = useQuery<Student[], Error>({
        queryKey: ['students'],
        queryFn: fetchStudentsAPI,
    });

    // 데이터가 변경될 때마다 콘솔에 출력 (개발/디버깅용)
    useEffect(() => {
        if (students) {
            console.log("클라이언트에서 가져온 학생 데이터 (JavaScript 객체):", students);
            // console.log("클라이언트에서 가져온 학생 데이터 (JSON 문자열):", JSON.stringify(students, null, 2));
        }
        if (isError) {
            console.error("학생 데이터 로딩 중 에러:", error);
        }
    }, [students, isError, error]);

    if (isLoading) {
        return <p>학생 목록 로딩 중...</p>;
    }

    if (isError) {
        return <p>오류 발생: {error?.message || '알 수 없는 오류'}</p>;
    }

    if (!students || students.length === 0) {
        return <p>표시할 학생 데이터가 없습니다.</p>;
    }

    return (
        <div>
            <h2>학생 목록 (클라이언트에서 조회)</h2>
            <ul>
                {students.map(student => (
                    <li key={student.id}>
                        {student.student_name} ({student.grade}) - {student.status}
                    </li>
                ))}
            </ul>
            {/* React Query Devtools를 사용하면 더 자세한 정보를 볼 수 있습니다. */}
        </div>
    );
};

export default MyStudentPage;