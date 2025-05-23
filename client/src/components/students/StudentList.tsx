// File: monorepo/client/src/components/students/StudentList.tsx
import React, { useState, useEffect } from 'react'; // useEffect 추가
import type { StudentZod as Student } from '../../../../shared/src/schemas/app.schema'; // Zod 스키마
import type { ColumnDefinition } from '../../../../shared/src/types/ui.types'; // UI 타입
import { LuMoveHorizontal, LuSave, LuCircleX, LuChevronDown, LuChevronUp } from 'react-icons/lu' // 정렬 아이콘 추가
import './StudentList.css'; // 컴포넌트 CSS

interface StudentListProps {
    students: Student[]; // 화면에 표시될 학생 목록 (필터링/정렬 완료된 상태)
    columns: ReadonlyArray<ColumnDefinition>; // 화면에 표시될 컬럼 정의 (가시성 필터링 완료)

    isBatchEditMode: boolean; // 현재 일괄 인라인 수정 모드인지 여부
    editingRowId: string | null; // 현재 단일 행 인라인 수정 중인 학생 ID
    editedRows: Record<string, Partial<Student>>; // 인라인 편집 중인 데이터 (ID별로 변경된 필드 저장)

    // 이벤트 핸들러
    onEditRow: (studentId: string) => void; // 단일 행 편집 시작
    onLuSaveSingleEdit: (studentId: string) => void; // 단일 행 편집 저장
    onCancelSingleEdit: () => void; // 단일 행 편집 취소
    onInputChange: (studentId: string, field: keyof Student, value: any) => void; // 인라인 편집 입력 변경

    // 선택 관련
    selectedRows: Set<string>; // 선택된 행들의 ID 집합
    onToggleRowSelection: (studentId: string) => void; // 단일 행 선택/해제
    onToggleSelectAll: (isSelected: boolean) => void; // 전체 행 선택/해제
    isAllSelected: boolean; // 현재 목록의 모든 행이 선택되었는지 여부

    // 추가 액션
    onViewDetails?: (studentId: string) => void; // 상세 보기 (선택적)
    onDischargeStudent: (studentId: string) => void; // 퇴원 처리
    onDeleteStudent: (studentId: string) => void; // 학생 삭제

    // 정렬 관련 (선택 사항, 부모 컴포넌트에서 정렬 로직 처리 시)
    // sortConfig?: { key: keyof Student; direction: 'ascending' | 'descending' } | null;
    // onSort?: (columnKey: keyof Student) => void;
}

const StudentList: React.FC<StudentListProps> = ({
    students,
    columns,
    isBatchEditMode,
    editingRowId,
    editedRows,
    onEditRow,
    onLuSaveSingleEdit,
    onCancelSingleEdit,
    onInputChange,
    selectedRows,
    onToggleRowSelection,
    onToggleSelectAll,
    isAllSelected,
    onViewDetails,
    onDischargeStudent,
    onDeleteStudent,
    // sortConfig,
    // onSort,
}) => {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null); // 행별 액션 드롭다운 상태

    // 셀 내용 표시 함수 (값 포맷팅 등)
    const getDisplayValue = (student: Student, columnKey: keyof Student) => {
        const value = student[columnKey];
        if (value === null || value === undefined) return ''; // null 또는 undefined는 빈 문자열로

        if (columnKey === 'tuition' && typeof value === 'number') {
            return value.toLocaleString() + ' 원'; // 원화 표시
        }
        // 날짜 필드 간단 포맷팅 (YYYY-MM-DD)
        if ((columnKey === 'admission_date' || columnKey === 'discharge_date') && typeof value === 'string' && value) {
            return value.split('T')[0]; // ISO 문자열에서 날짜 부분만 추출
        }
        return String(value); // 그 외는 문자열로 변환
    };

    // 행별 액션 드롭다운 토글
    const handleDropdownToggle = (studentId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // 행 클릭 이벤트 전파 방지
        setActiveDropdown(prev => (prev === studentId ? null : studentId));
    };

    // 드롭다운 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // 드롭다운 메뉴 자체가 클릭된 경우는 닫지 않음
            if ((event.target as HTMLElement).closest('.dropdown-menu')) return;
            setActiveDropdown(null);
        };
        if (activeDropdown) {
            document.addEventListener('mousedown', handleClickOutside); // click 대신 mousedown 사용 (버튼 클릭 이벤트와 충돌 방지)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeDropdown]);


    // 각 셀의 내용을 렌더링하는 함수 (편집 모드에 따라 input 또는 텍스트 표시)
    const renderCellContent = (student: Student, column: ColumnDefinition) => {
        const columnKey = column.key as keyof Student;
        // 현재 셀이 편집 가능한 상태인지 (단일 행 편집 또는 일괄 편집 모드이고, 해당 컬럼이 편집 가능할 때)
        const isEditingThisCell = (editingRowId === student.id || (isBatchEditMode && selectedRows.has(student.id))) && column.isEditable;

        // 편집 중이면 editedRows에서 값 가져오고, 아니면 student 원본 데이터 사용
        const currentDataForCell = (editingRowId === student.id || isBatchEditMode) && editedRows[student.id]
            ? { ...student, ...editedRows[student.id] } // 원본에 변경사항 병합
            : student;
        const currentValue = currentDataForCell[columnKey];

        if (isEditingThisCell) { // 편집 모드 렌더링
            if (column.inputType === 'select' && column.options) { // Select 입력
                return (
                    <select
                        value={currentValue === null || currentValue === undefined ? '' : String(currentValue)}
                        onChange={(e) => onInputChange(student.id, columnKey, e.target.value as Student['status'])} // status 타입 캐스팅
                        onClick={(e) => e.stopPropagation()} // 행 전체 클릭 이벤트 방지
                        className="table-input table-select" // 공통 클래스 및 select 전용 클래스
                        autoFocus={columnKey === (columns.find(c => c.isEditable)?.key as keyof Student)} // 첫 번째 편집 가능 컬럼에 포커스 (선택 사항)
                    >
                        {/* status 필드인 경우 옵션 렌더링 */}
                        {(columnKey === 'status' && column.options) && column.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                );
            }
            // 일반 Input 입력 (text, number, date 등)
            return (
                <input
                    type={column.inputType || 'text'}
                    value={currentValue === null || currentValue === undefined ? '' : String(currentValue)}
                    onChange={(e) => {
                        let val: string | number | null = e.target.value;
                        if (column.inputType === 'number') {
                            val = val === '' ? null : parseFloat(val);
                        } else if (column.inputType === 'date' && val === '') {
                            val = null;
                        } else if (val === '' && (columnKey === 'student_phone' || columnKey === 'guardian_phone' || columnKey === 'class' || columnKey === 'teacher' || columnKey === 'school_name')) {
                            val = null; // nullable string 필드 빈 값 처리
                        }
                        onInputChange(student.id, columnKey, val);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="table-input"
                    min={column.inputType === 'number' ? 0 : undefined} // 숫자 타입일 때 최소값 (음수 방지 등)
                />
            );
        }

        // 읽기 모드 렌더링
        if (columnKey === 'status') { // 상태 값에 따라 Badge 스타일 적용
            return <span className={`badge status-${String(currentValue)?.toLowerCase().replace(/\s+/g, '-')}`}>{getDisplayValue(student, columnKey)}</span>;
        }
        return getDisplayValue(student, columnKey); // 일반 텍스트 표시
    };

    // 학생 데이터가 없거나 로딩 중일 때 (부모에서 로딩 처리, 여기서는 데이터 없음만)
    if (students.length === 0) {
        return <p className="no-data-message">표시할 학생 데이터가 없습니다. 필터를 조정하거나 새 학생을 추가해주세요.</p>;
    }

    return (
        <div className="table-responsive-wrapper"> {/* 반응형 테이블을 위한 래퍼 */}
            <table className="students-table">
                <thead className="table-header">
                    <tr>
                        {/* columns prop은 이미 부모에서 가시성 필터링된 상태로 받음 */}
                        {columns.map(col => (
                            <th key={col.key}
                                className={`th-${String(col.key)} ${col.isSortable ? 'sortable' : ''}`}
                            // onClick={col.isSortable && onSort ? () => onSort(col.key as keyof Student) : undefined} // 정렬 기능 추가 시
                            >
                                {col.key === 'checkbox' ? (
                                    <input
                                        type="checkbox"
                                        aria-label="모든 학생 선택"
                                        checked={isAllSelected}
                                        onChange={(e) => onToggleSelectAll(e.target.checked)}
                                        // 일괄 편집 중이면서, 단일 행 편집 중이 아닐 때만 활성화 (또는 항상 활성화)
                                        disabled={isBatchEditMode && editingRowId !== null}
                                    />
                                ) : (
                                    col.label
                                )}
                                {/* 정렬 아이콘 (정렬 기능 추가 시) */}
                                {/* {col.isSortable && sortConfig && sortConfig.key === col.key && (
                                    sortConfig.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                                )}
                                {col.isSortable && (!sortConfig || sortConfig.key !== col.key) && (
                                    <ChevronDown size={16} style={{ opacity: 0.3 }} /> // 기본 정렬 가능 표시
                                )} */}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="table-body">
                    {students.map((student) => (
                        <tr
                            key={student.id}
                            // 선택된 행, 편집 중인 행에 따라 다른 클래스 적용
                            className={`
                                table-row 
                                ${selectedRows.has(student.id) ? 'row-selected' : ''} 
                                ${editingRowId === student.id ? 'row-editing-single' : ''}
                                ${(isBatchEditMode && selectedRows.has(student.id)) ? 'row-editing-batch' : ''}
                            `}
                            onClick={() => { // 행 클릭 시 선택/해제 (편집 모드가 아닐 때만)
                                if (!isBatchEditMode && !editingRowId) {
                                    onToggleRowSelection(student.id);
                                }
                            }}
                            aria-selected={selectedRows.has(student.id)}
                        >
                            {columns.map(col => (
                                <td key={`${student.id}-${String(col.key)}`} data-label={col.label} className={`td-${String(col.key)}`}>
                                    {col.key === 'checkbox' ? ( // 체크박스 셀
                                        <input
                                            type="checkbox"
                                            aria-label={`${student.student_name} 학생 선택`}
                                            checked={selectedRows.has(student.id)}
                                            onChange={(e) => {
                                                e.stopPropagation(); // 행 전체 클릭 이벤트 방지
                                                onToggleRowSelection(student.id);
                                            }}
                                            // 해당 행이 단일 편집 중이거나, 일괄 편집 모드일 때 비활성화 (선택 변경 불가)
                                            disabled={editingRowId === student.id || isBatchEditMode}
                                        />
                                    ) : col.key === 'actions' ? ( // 액션 버튼 셀
                                        <div className="actions-cell">
                                            {editingRowId === student.id ? ( // 단일 행 편집 중일 때 저장/취소 버튼
                                                <>
                                                    <button onClick={(e) => { e.stopPropagation(); onLuSaveSingleEdit(student.id); }} className="action-button button-icon LuSave-button" title="저장">
                                                        <LuSave size={18} />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); onCancelSingleEdit(); }} className="action-button button-icon cancel-button" title="취소">
                                                        <LuCircleX size={18} />
                                                    </button>
                                                </>
                                            ) : ( // 읽기 모드 또는 일괄 편집 모드일 때 (일괄 편집 중에는 개별 액션 숨김)
                                                !isBatchEditMode && ( // 일괄 편집 모드가 아닐 때만 드롭다운 표시
                                                    <div className="dropdown-container">
                                                        <button
                                                            onClick={(e) => handleDropdownToggle(student.id, e)}
                                                            className="action-button button-icon more-button"
                                                            title="더보기"
                                                            aria-haspopup="true"
                                                            aria-expanded={activeDropdown === student.id}
                                                        >
                                                            <LuMoveHorizontal size={18} />
                                                        </button>
                                                        {/* 드롭다운 메뉴 */}
                                                        {activeDropdown === student.id && (
                                                            <div className="dropdown-menu" role="menu" onClick={e => e.stopPropagation()}>
                                                                {onViewDetails && <button role="menuitem" onClick={() => { onViewDetails(student.id); setActiveDropdown(null); }}>상세 보기</button>}
                                                                <button role="menuitem" onClick={() => { onEditRow(student.id); setActiveDropdown(null); }}>정보 수정</button>
                                                                {student.status !== '퇴원' && <button role="menuitem" onClick={() => { onDischargeStudent(student.id); setActiveDropdown(null); }}>퇴원 처리</button>}
                                                                <button role="menuitem" onClick={() => { onDeleteStudent(student.id); setActiveDropdown(null); }} className="danger">학생 삭제</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    ) : ( // 일반 데이터 셀
                                        renderCellContent(student, col)
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StudentList;