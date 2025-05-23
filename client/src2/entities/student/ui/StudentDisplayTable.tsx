import React from 'react';
import GlassTable, { type TableColumn } from '@src2/shared/ui/glasstable/GlassTable';
import type { StudentZod as Student } from '@shared/schemas/app.schema';
import Badge from '@src2/shared/ui/Badge/Badge';
import './StudentDisplayTable.css'; // CSS 파일 import
import { LuListChecks } from 'react-icons/lu'; // 헤더 아이콘 (고정)
import TableCellCheckbox from '@src2/shared/ui/TableCellCheckbox/TableCellCheckbox';

interface StudentDisplayTableProps {
    students: Student[];
    isLoading?: boolean;
    selectedIds: Set<string>;
    onToggleRow: (studentId: string) => void;
    /**
     * 헤더 버튼(전체 선택/해제)이 현재 "선택된" 상태인지 여부.
     * aria-pressed와 title 속성에 사용됩니다.
     */
    isHeaderChecked: boolean;
    /**
     * 헤더 버튼(전체 선택/해제)을 클릭했을 때 호출되는 함수.
     */
    onToggleHeader: () => void;
    /**
     * 헤더 버튼(전체 선택/해제)을 비활성화할지 여부.
     * @default false
     */
    isHeaderDisabled?: boolean;
}

const StudentDisplayTable: React.FC<StudentDisplayTableProps> = ({
    students,
    isLoading = false,
    selectedIds,
    onToggleRow,
    isHeaderChecked,
    onToggleHeader,
    isHeaderDisabled = false,
}) => {
    const columns: TableColumn<Student>[] = [
        {
            key: 'header_action_button', // 키 이름 변경 (기능을 내포)
            header: (
                <div className="header-icon-container"> {/* CSS에서 정렬 관리 */}
                    <button
                        type="button"
                        className="header-icon-button" // CSS 스타일링 클래스
                        title={isHeaderChecked ? "모든 항목 선택 해제" : "모든 항목 선택"} // 현재 상태에 따라 툴팁 변경
                        onClick={onToggleHeader} // 클릭 시 전체 선택/해제 로직 호출
                        disabled={isHeaderDisabled || students.length === 0} // 비활성화 조건
                        aria-pressed={isHeaderChecked} // ARIA 속성으로 현재 "눌린" 상태(선택된 상태) 명시
                    >
                        {/* 아이콘은 항상 LuListChecks로 고정 */}
                        <LuListChecks size={20} />
                    </button>
                </div>
            ),
            render: (student) => (
                <TableCellCheckbox
                    isChecked={selectedIds.has(student.id)}
                    onToggle={() => onToggleRow(student.id)}
                    ariaLabel={`학생 ${student.student_name} 선택`}
                />
            ),
            // style: { width: '60px', textAlign: 'center' }, // GlassTable 컬럼 스타일 지원 시
        },
        {
            key: 'student_name',
            header: '이름',
        },
        {
            key: 'grade',
            header: '학년',
        },
        {
            key: 'subject',
            header: '과목',
        },
        {
            key: 'status',
            header: '상태',
            render: (student) => {
                let statusClassName = '';
                switch (student.status) {
                    case '재원': statusClassName = 'status-enroll'; break;
                    case '휴원': statusClassName = 'status-pause'; break;
                    case '퇴원': statusClassName = 'status-leave'; break;
                    default: statusClassName = 'status-default';
                }
                return <Badge className={statusClassName}>{student.status}</Badge>;
            },
        },
        {
            key: 'student_phone',
            header: '학생 연락처',
            render: (student) => {
                const content = student.student_phone || '-';
                if (content === '-') {
                    return <span style={{ display: 'block', textAlign: 'center', width: '100%' }}>-</span>;
                }
                return student.student_phone;
            },
        },
        { key: 'guardian_phone', header: '학부모 연락처' },
        { key: 'school_name', header: '학교명' },
        { key: 'tuition', header: '수강료' },
        {
            key: 'admission_date',
            header: '입원일',
            render: (student) => {
                if (!student.admission_date) return '-';
                const dateValue = typeof student.admission_date === 'string' ? new Date(student.admission_date) : new Date(Number(student.admission_date));
                return isNaN(dateValue.getTime()) ? '-' : dateValue.toLocaleDateString();
            }
        },
        { key: 'discharge_date', header: '퇴원일' }
    ];

    return (
        <GlassTable<Student>
            columns={columns}
            data={students}
            isLoading={isLoading}
            emptyMessage="표시할 학생 정보가 없습니다."
        />
    );
};

export default StudentDisplayTable;