// File: monorepo/client/src/pages/StudentsPage.tsx
import React, { useState, useMemo, useEffect, useCallback } from 'react'; // useCallback 추가
import { useStudentDataWithRQ } from '../../src2/entities/student/model/useStudentDataWithRQ';
// import type { MutationStatus } from '../hooks/useStudentDataWithRQ'; // 직접 사용하지 않으므로 제거 가능

import { useStudentPageStore } from '../stores/studentPageStore';
import type {
    StudentZod as Student,
    CreateStudentInput, // createStudentBodySchema에서 추론
    UpdateStudentInput, // updateStudentSchema (id 포함) 에서 추론
    UpdateStudentInputBody // updateStudentBodySchema에서 추론
} from '../../../shared/src/schemas/app.schema';
import type { ColumnDefinition } from '../../../shared/src/types/ui.types';

import { LuCirclePlus, LuSettings2, LuTrash2, LuSearch, LuSettings, LuFilterX, LuEye, LuEyeOff, LuSave, LuCircleX } from 'react-icons/lu';

import './StudentsPage.css';

const ALL_COLUMN_DEFINITIONS: ReadonlyArray<ColumnDefinition> = [
    { key: 'checkbox', label: '선택', isEditable: false },
    { key: 'student_name', label: '이름', isSortable: true, isEditable: true },
    { key: 'grade', label: '학년', isSortable: true, isEditable: true },
    { key: 'status', label: '상태', isSortable: true, isEditable: true, inputType: 'select', options: ['재원', '휴원', '퇴원'] as const },
    { key: 'subject', label: '과목', isSortable: true, isEditable: true },
    { key: 'student_phone', label: '학생 연락처', isEditable: true, inputType: 'tel' },
    { key: 'guardian_phone', label: '학부모 연락처', isEditable: true, inputType: 'tel' },
    { key: 'tuition', label: '원비', isSortable: true, isEditable: true, inputType: 'number' },
    { key: 'class', label: '반', isSortable: true, isEditable: true },
    { key: 'teacher', label: '담임', isSortable: true, isEditable: true },
    { key: 'school_name', label: '학교', isEditable: true },
    { key: 'admission_date', label: '입학일', isSortable: true, isEditable: true, inputType: 'date' },
    { key: 'discharge_date', label: '퇴원일', isSortable: true, isEditable: true, inputType: 'date' },
    { key: 'actions', label: '관리', isEditable: false },
];

const MOBILE_HIDDEN_COLUMN_KEYS: ReadonlyArray<ColumnDefinition['key']> = [
    'teacher', 'school_name', 'admission_date', 'discharge_date', 'guardian_phone', 'class', 'tuition'
];

const StudentsPage: React.FC = () => {
    const {
        students,
        isLoadingStudents,
        isStudentsError,
        studentsError,
        addStudent,
        updateStudent,
        deleteStudent,
        bulkUpdateStudents,
        bulkDeleteStudents,
        addStudentStatus,
        updateStudentStatus,
        deleteStudentStatus, // 훅에서 반환한다고 가정
        bulkUpdateStudentsStatus,
        bulkDeleteStudentsStatus,
    } = useStudentDataWithRQ();

    const {
        searchTerm, setSearchTerm,
        filters, setFilter, resetFilters,
        visibleColumns, initializeColumnVisibility, toggleColumnVisibility,
        isSettingsOpen, toggleSettingsOpen
    } = useStudentPageStore();

    useEffect(() => {
        const handleResize = () => initializeColumnVisibility(ALL_COLUMN_DEFINITIONS, MOBILE_HIDDEN_COLUMN_KEYS);
        handleResize(); // 초기 실행
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [initializeColumnVisibility]); // 의존성 추가

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingFormStudent, setEditingFormStudent] = useState<Partial<Student> | null>(null); // StudentForm 에 전달할 데이터 타입
    const [isBatchEditMode, setIsBatchEditMode] = useState(false);
    const [editingRowId, setEditingRowId] = useState<string | null>(null);
    const [editedRows, setEditedRows] = useState<Record<string, Partial<Student>>>({});
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

    const filteredStudents = useMemo(() => {
        return (students || [])
            .filter(s => {
                if (!s) return false;
                const searchLower = searchTerm.toLowerCase();
                const matchesSearch = searchLower === '' ||
                    ALL_COLUMN_DEFINITIONS.some(colDef => {
                        if (colDef.key === 'actions' || colDef.key === 'checkbox') return false;
                        const val = s[colDef.key as keyof Student];
                        return String(val ?? '').toLowerCase().includes(searchLower); // null/undefined 처리
                    });
                const matchesGrade = filters.grade === '' || s.grade === filters.grade;
                const matchesSubject = filters.subject === '' || (s.subject || '').includes(filters.subject); // null 처리
                const matchesClass = filters.class === '' || (filters.class === '반없음' ? !s.class : s.class === filters.class);
                const matchesStatus = filters.status === '' || s.status === filters.status;
                return matchesSearch && matchesGrade && matchesSubject && matchesClass && matchesStatus;
            });
    }, [students, searchTerm, filters]);

    const filterOptions = useMemo(() => {
        const studentList = students || [];
        const grades = [...new Set(studentList.map(s => s.grade).filter(Boolean).sort())];
        const subjects = [...new Set(studentList.map(s => s.subject).filter(Boolean).sort())];
        const classesRaw = [...new Set(studentList.map(s => s.class))];
        const classesDisplay = classesRaw.map(c => c === null ? '반없음' : c).filter(c => c !== '').sort((a, b) => (a === '반없음' ? -1 : b === '반없음' ? 1 : (a || '').localeCompare(b || '')));
        const statusOptions = (ALL_COLUMN_DEFINITIONS.find(c => c.key === 'status')?.options || []) as string[];
        return { grades, subjects, classes: classesDisplay, statuses: statusOptions };
    }, [students]);

    const handleOpenForm = useCallback((student: Student | null = null) => {
        setEditingFormStudent(student ? { ...student } : null); // 새 객체로 복사
        setIsFormOpen(true);
    }, []); // 의존성 없음

    const handleCloseForm = useCallback(() => {
        setIsFormOpen(false);
        setEditingFormStudent(null);
    }, []); // 의존성 없음

    // CreateStudentInput은 body용, UpdateStudentInputBody도 body용
    const handleSubmitForm = useCallback(async (data: CreateStudentInput | UpdateStudentInputBody) => {
        try {
            if (isFormOpen && editingFormStudent?.id) {
                // updateStudent는 UpdateStudentInput (id 포함) 타입을 기대
                await updateStudent({ id: editingFormStudent.id, ...(data as UpdateStudentInputBody) });
                alert('학생 정보가 수정되었습니다.');
            } else {
                await addStudent(data as CreateStudentInput);
                alert('새 학생이 추가되었습니다.');
            }
            handleCloseForm();
        } catch (err: any) {
            console.error("Form submission error:", err);
            const errorDetails = err.data?.details ? `\nDetails: ${JSON.stringify(err.data.details)}` : '';
            alert(`오류: ${err.message || '알 수 없는 오류가 발생했습니다.'}${errorDetails}`);
        }
    }, [isFormOpen, editingFormStudent, addStudent, updateStudent, handleCloseForm]); // 의존성 추가

    const handleInputChange = useCallback((studentId: string, field: keyof Student, value: any) => {
        setEditedRows(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], [field]: value }
        }));
    }, []); // 의존성 없음 (만약 editedRows를 직접 읽는다면 추가 필요)

    const toggleBatchEditMode = useCallback(async () => {
        if (isBatchEditMode) {
            const updatesToSave: UpdateStudentInput[] = Object.entries(editedRows)
                .filter(([id, data]) => selectedRows.has(id) && Object.keys(data).length > 0)
                .map(([id, data]) => ({ id, ...(data as UpdateStudentInputBody) })); // id와 body 조합

            if (updatesToSave.length > 0) {
                if (window.confirm(`${updatesToSave.length}명의 학생 정보를 저장하시겠습니까?`)) {
                    try {
                        await bulkUpdateStudents(updatesToSave);
                        alert('일괄 수정되었습니다.');
                        setEditedRows({});
                    } catch (err: any) {
                        console.error("Bulk update error:", err);
                        alert(`일괄 수정 실패: ${err.message || '알 수 없는 오류'}`);
                    }
                }
            } else {
                alert('변경된 내용이 없습니다.');
            }
            setIsBatchEditMode(false);
        } else {
            if (selectedRows.size === 0) {
                alert('수정할 학생을 먼저 선택해주세요.');
                return;
            }
            const initialEdits: Record<string, Partial<Student>> = {};
            (students || []).forEach(student => {
                if (selectedRows.has(student.id)) {
                    initialEdits[student.id] = { ...student };
                }
            });
            setEditedRows(initialEdits);
            setIsBatchEditMode(true);
            setEditingRowId(null); // 단일 행 편집 모드 해제
        }
    }, [isBatchEditMode, editedRows, selectedRows, students, bulkUpdateStudents]); // 의존성 추가

    const cancelBatchEditMode = useCallback(() => {
        setIsBatchEditMode(false);
        setEditedRows({});
    }, []); // 의존성 없음

    const handleEditRow = useCallback((studentId: string) => {
        setEditingRowId(studentId);
        const student = (students || []).find(s => s.id === studentId);
        if (student) {
            setEditedRows({ [studentId]: { ...student } });
        }
        setIsBatchEditMode(false);
    }, [students]); // 의존성 추가

    const handleSaveSingleEdit = useCallback(async (studentId: string) => {
        if (editedRows[studentId]) {
            try {
                // UpdateStudentInput (id 포함) 타입으로 전달
                const updatePayload: UpdateStudentInput = {
                    id: studentId,
                    ...(editedRows[studentId] as UpdateStudentInputBody)
                };
                await updateStudent(updatePayload);
                setEditingRowId(null);
                setEditedRows({});
                alert('수정되었습니다.');
            } catch (err: any) {
                console.error("Single edit save error:", err);
                alert(`수정 실패: ${err.message || '알 수 없는 오류'}`);
            }
        }
    }, [editedRows, updateStudent]); // 의존성 추가

    const handleCancelSingleEdit = useCallback(() => {
        setEditingRowId(null);
        setEditedRows({});
    }, []); // 의존성 없음

    const handleToggleRowSelection = useCallback((studentId: string) => {
        setSelectedRows(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(studentId)) newSelection.delete(studentId);
            else newSelection.add(studentId);
            return newSelection;
        });
    }, []); // 의존성 없음

    const handleToggleSelectAll = useCallback((isSelected: boolean) => {
        if (isSelected) setSelectedRows(new Set(filteredStudents.map(s => s.id)));
        else setSelectedRows(new Set());
    }, [filteredStudents]); // 의존성 추가

    const isAllSelected = useMemo(() =>
        filteredStudents.length > 0 && selectedRows.size === filteredStudents.length,
        [filteredStudents, selectedRows]
    );

    const handleDeleteStudent = useCallback(async (studentId: string) => {
        if (window.confirm('정말로 이 학생 정보를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            try {
                const result = await deleteStudent(studentId); // API가 {message, id} 반환
                alert(result.message || '삭제되었습니다.'); // API 응답 메시지 사용
                setSelectedRows(prev => {
                    const newSelection = new Set(prev);
                    newSelection.delete(studentId);
                    return newSelection;
                });
            } catch (err: any) {
                console.error("Delete student error:", err);
                alert(`삭제 실패: ${err.message || '알 수 없는 오류'}`);
            }
        }
    }, [deleteStudent]); // 의존성 추가

    const handleBulkDelete = useCallback(async () => {
        if (selectedRows.size === 0) {
            alert('삭제할 학생을 선택해주세요.');
            return;
        }
        if (window.confirm(`선택된 ${selectedRows.size}명의 학생 정보를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
            try {
                await bulkDeleteStudents(Array.from(selectedRows));
                setSelectedRows(new Set());
                alert('선택된 학생들이 삭제되었습니다.');
            } catch (err: any) {
                console.error("Bulk delete error:", err);
                alert(`일괄 삭제 실패: ${err.message || '알 수 없는 오류'}`);
            }
        }
    }, [selectedRows, bulkDeleteStudents]); // 의존성 추가

    const handleDischargeStudent = useCallback(async (studentId: string) => {
        if (window.confirm('이 학생을 퇴원 처리하시겠습니까? 퇴원일은 오늘로 설정됩니다.')) {
            try {
                const today = new Date().toISOString().split('T')[0];
                // UpdateStudentInput (id 포함) 타입으로 전달
                await updateStudent({ id: studentId, status: '퇴원', discharge_date: today });
                alert('퇴원 처리되었습니다.');
            } catch (err: any) {
                console.error("Discharge student error:", err);
                alert(`퇴원 처리 실패: ${err.message || '알 수 없는 오류'}`);
            }
        }
    }, [updateStudent]); // 의존성 추가

    const currentlyVisibleColumns = useMemo(() =>
        ALL_COLUMN_DEFINITIONS.filter(col => !!visibleColumns[col.key]),
        [visibleColumns]
    );

    if (isStudentsError) {
        const errorMessage = studentsError instanceof Error ? studentsError.message : '학생 데이터를 불러오는데 실패했습니다.';
        return <p className="error-message centered-message">오류: {errorMessage}</p>;
    }

    return (
        <div className="students-page">
            <header className="page-header">
                <h1>학생 관리</h1>
                <div className="header-actions">
                    <button
                        onClick={() => handleOpenForm()}
                        className="button-base button-icon-text button-primary"
                        disabled={addStudentStatus.isPending}
                    >
                        <LuCirclePlus size={18} /> {addStudentStatus.isPending ? "추가 중..." : "새 학생 추가"}
                    </button>
                    <button onClick={toggleSettingsOpen} className="button-base button-icon button-secondary" title="컬럼 설정">
                        <LuSettings size={18} />
                    </button>
                </div>
            </header>

            {isSettingsOpen && (
                <div className="column-settings">
                    <h4>테이블 컬럼 표시 설정</h4>
                    <div className="column-toggle-list">
                        {ALL_COLUMN_DEFINITIONS.filter(col => col.key !== 'checkbox' && col.key !== 'actions').map(col => (
                            <label key={col.key} className="column-toggle-item">
                                <input
                                    type="checkbox"
                                    checked={!!visibleColumns[col.key]}
                                    onChange={() => toggleColumnVisibility(col.key)}
                                />
                                {col.label}
                                {visibleColumns[col.key] ? <LuEyeOff size={16} style={{ marginLeft: 'auto', color: '#888' }} /> : <LuEye size={16} style={{ marginLeft: 'auto', color: '#888' }} />}
                            </label>
                        ))}
                    </div>
                    <button onClick={toggleSettingsOpen} className="button-base button-small button-secondary">닫기</button>
                </div>
            )}

            <div className="controls-container">
                <div className="search-filter-box">
                    <div className="search-input-wrapper">
                        <LuSearch size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="전체 컬럼에서 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <select aria-label="학년 필터" value={filters.grade} onChange={e => setFilter('grade', e.target.value)}>
                        <option value="">모든 학년</option>
                        {filterOptions.grades.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <select aria-label="과목 필터" value={filters.subject} onChange={e => setFilter('subject', e.target.value)}>
                        <option value="">모든 과목</option>
                        {filterOptions.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select aria-label="반 필터" value={filters.class} onChange={e => setFilter('class', e.target.value)}>
                        <option value="">모든 반</option>
                        {filterOptions.classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select aria-label="상태 필터" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
                        <option value="">모든 상태</option>
                        {filterOptions.statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={resetFilters} className="button-base button-icon-text button-secondary" title="필터 초기화">
                        <LuFilterX size={18} /> 초기화
                    </button>
                </div>
                <div className="batch-actions">
                    {(!editingRowId && (selectedRows.size > 0 || isBatchEditMode)) && (
                        <button
                            onClick={toggleBatchEditMode}
                            className={`button-base button-icon-text ${isBatchEditMode ? (bulkUpdateStudentsStatus.isPending ? 'button-warning' : 'button-success') : 'button-primary'}`}
                            disabled={isBatchEditMode && bulkUpdateStudentsStatus.isPending}
                        >
                            {isBatchEditMode ? <LuSave size={18} /> : <LuSettings2 size={18} />}
                            {isBatchEditMode ? (bulkUpdateStudentsStatus.isPending ? `저장 중...` : `선택 (${selectedRows.size}) 저장`) : `선택 (${selectedRows.size}) 수정`}
                        </button>
                    )}
                    {isBatchEditMode && (
                        <button onClick={cancelBatchEditMode} className="button-base button-icon-text button-secondary" disabled={bulkUpdateStudentsStatus.isPending}>
                            <LuCircleX size={18} /> 취소
                        </button>
                    )}
                    {(selectedRows.size > 0 && !isBatchEditMode && !editingRowId) && (
                        <button
                            onClick={handleBulkDelete}
                            className="button-base button-icon-text button-danger"
                            disabled={bulkDeleteStudentsStatus.isPending}
                        >
                            <LuTrash2 size={18} /> {bulkDeleteStudentsStatus.isPending ? `삭제 중...` : `선택 (${selectedRows.size}) 삭제`}
                        </button>
                    )}
                </div>
            </div>

            <p className="total-count">
                검색 결과: {filteredStudents.length}명
                (전체: {(students || []).length}명)
            </p>

            {isLoadingStudents && <p className="loading-message centered-message">학생 목록을 불러오는 중...</p>}


            {isFormOpen && (
                <div className="modal-overlay" onClick={handleCloseForm} role="dialog" aria-modal="true">
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>

                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentsPage;