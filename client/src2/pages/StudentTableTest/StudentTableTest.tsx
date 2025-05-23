// file: client/src2/pages/StudentTableTest/StudentTableTest.tsx

import React from 'react';
import StudentDisplayTable from '@src2/entities/student/ui/StudentDisplayTable';
// 데이터 훅 임포트 - 이름이 변경되었다면 해당 이름으로 수정
// 예: import { useGetStudents } from '@src2/entities/student/model/useGetStudents';
import { useStudentDataWithRQ } from '@src2/entities/student/model/useStudentDataWithRQ';
// 행 선택 기능을 위한 훅 임포트
import { useRowSelection } from '@src2/features/row-selection/model/useRowSelection'; // 실제 경로로 수정
import type { StudentZod as Student } from '@shared/schemas/app.schema'; // Student 타입 임포트

const StudentTableTest: React.FC = () => {
    // 1. 학생 데이터 가져오기
    const {
        students, // 이 students가 Student[] 타입이라고 가정
        isLoadingStudents,
        isStudentsError,
        studentsError,
    } = useStudentDataWithRQ();

    // students가 undefined일 수 있으므로, 기본값으로 빈 배열 사용
    const studentList: Student[] = students || [];

    // 2. 행 선택 기능 훅 사용
    // 학생 ID 목록을 useRowSelection에 전달 (students 데이터가 변경될 때마다 studentIds도 업데이트되도록 useMemo 사용)
    const studentIds = React.useMemo(() => studentList.map(s => s.id), [studentList]);

    const {
        selectedIds,     // Set<string>
        toggleRow,       // (id: string) => void
        isAllSelected,   // boolean
        toggleSelectAll, // () => void
        // isRowSelected, // StudentDisplayTable에서는 selectedIds.has()를 직접 사용
        // clearSelection,
    } = useRowSelection<string>({ allItems: studentIds }); // 학생 ID는 string

    // 데이터 로딩 중 에러 발생 시 UI
    if (isStudentsError) {
        return (
            <div style={{ padding: '20px' }}>
                <h2>학생 목록 (테스트) - 오류</h2>
                <p style={{ color: 'red' }}>학생 데이터를 불러오는 중 오류가 발생했습니다.</p>
                <pre>{studentsError?.message || '알 수 없는 오류'}</pre>
            </div>
        );
    }

    // StudentDisplayTable에 필요한 props 전달
    return (
        <div>
            <StudentDisplayTable
                students={studentList}
                isLoading={isLoadingStudents}
                // 선택 관련 props 전달
                selectedIds={selectedIds}
                onToggleRow={toggleRow}
                isHeaderChecked={isAllSelected}
                onToggleHeader={toggleSelectAll}
                isHeaderDisabled={studentList.length === 0} // 학생 데이터가 없으면 헤더 체크박스 비활성화
            />
        </div>
    );
};

export default StudentTableTest;