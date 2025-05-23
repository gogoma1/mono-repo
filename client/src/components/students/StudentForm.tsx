// File: monorepo/client/src/components/students/StudentForm.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import type {
    StudentZod as Student,
    CreateStudentInput,
    UpdateStudentInputBody
} from '../../../../shared/src/schemas/app.schema';
import { createStudentBodySchema, updateStudentBodySchema } from '../../../../shared/src/schemas/app.schema';
import './StudentForm.css';

// 폼에서 다루는 데이터의 타입 (생성 또는 수정 본문)
type FormDataType = CreateStudentInput | UpdateStudentInputBody;
// 폼 필드의 키 타입 (FormDataType의 모든 키를 포함)
type FormFieldKey = keyof CreateStudentInput | keyof UpdateStudentInputBody;

interface FieldConfig {
    key: FormFieldKey;
    label: string;
    type?: 'text' | 'number' | 'date' | 'tel' | 'select';
    options?: ReadonlyArray<z.infer<typeof createStudentBodySchema.shape.status>>;
    placeholder?: string;
}

// 기본 필드 구성 (CreateStudentInput에 있는 필드들)
const baseFieldConfigs: ReadonlyArray<Omit<FieldConfig, 'key'> & { key: keyof CreateStudentInput }> = [
    { key: 'student_name', label: '이름', type: 'text', placeholder: '학생 이름 입력' },
    { key: 'grade', label: '학년', type: 'text', placeholder: '예: 중3, 고1' },
    { key: 'status', label: '상태', type: 'select', options: ['재원', '휴원', '퇴원'] as const },
    { key: 'subject', label: '과목', type: 'text', placeholder: '예: 수학, 영수' },
    { key: 'tuition', label: '원비', type: 'text', placeholder: '숫자만 입력 (예: 300000)' },
    { key: 'admission_date', label: '입학(등록)일', type: 'date' },
    { key: 'student_phone', label: '학생 연락처', type: 'tel', placeholder: '010-1234-5678' },
    { key: 'guardian_phone', label: '학부모 연락처', type: 'tel', placeholder: '010-9876-5432' },
    { key: 'school_name', label: '학교', type: 'text', placeholder: '예: OO중학교, XX고등학교' },
    { key: 'class', label: '반', type: 'text', placeholder: '예: A반, 1반 (없으면 비워둠)' },
    { key: 'teacher', label: '담임', type: 'text', placeholder: '담당 선생님 이름' },
];

// isEditMode에 따라 discharge_date 필드를 동적으로 추가/제외
const getFieldConfigs = (isEditMode: boolean): ReadonlyArray<FieldConfig> => {
    const configs: FieldConfig[] = [...baseFieldConfigs];
    if (isEditMode) {
        // discharge_date는 UpdateStudentInputBody에 optional로 존재
        // 이미 있는지 확인 후 추가 (중복 방지)
        if (!configs.some(c => c.key === 'discharge_date')) {
            configs.push({ key: 'discharge_date', label: '퇴원일', type: 'date' });
        }
    }
    // 생성 모드에서는 discharge_date 필드가 없도록 함 (baseFieldConfigs에 없음)
    return configs;
};

interface StudentFormProps {
    initialData?: Partial<Student> | null; // 수정 시 사용
    onSubmit: (data: FormDataType) => Promise<void> | void; // CreateStudentInput | UpdateStudentInputBody
    onCancel: () => void;
    isEditMode?: boolean; // 이 prop으로 생성/수정 모드 구분
    isSubmitting?: boolean;
}

const StudentForm: React.FC<StudentFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isEditMode = false,
    isSubmitting = false
}) => {
    const [formData, setFormData] = useState<Partial<FormDataType>>({});
    const [formErrors, setFormErrors] = useState<Partial<Record<FormFieldKey, string[]>>>({});

    useEffect(() => {
        let dataToSet: Partial<FormDataType> = {};
        if (isEditMode && initialData) {
            // 수정 모드: initialData를 UpdateStudentInputBody 형태로 변환
            const populatedData: Partial<UpdateStudentInputBody> = {};
            const relevantSchemaShape = updateStudentBodySchema.shape; // 수정 스키마 사용
            for (const key in relevantSchemaShape) {
                const formKey = key as keyof UpdateStudentInputBody;
                if (formKey in initialData) {
                    const value = initialData[formKey as keyof typeof initialData];
                    if (value !== undefined) {
                        if (formKey === 'tuition' && value !== null) {
                            (populatedData as any)[formKey] = String(value);
                        } else if ((formKey === 'admission_date' || formKey === 'discharge_date') && value) {
                            // initialData의 날짜가 Unix timestamp(숫자)라면 YYYY-MM-DD 문자열로 변환
                            // 이미 문자열이라면 그대로 사용
                            (populatedData as any)[formKey] = typeof value === 'number' ? new Date(value).toISOString().split('T')[0] : String(value);
                        } else {
                            (populatedData as any)[formKey] = value;
                        }
                    } else if (relevantSchemaShape[formKey]?.isOptional()) {
                        (populatedData as any)[formKey] = undefined; // optional은 undefined
                    }
                }
            }
            dataToSet = populatedData;
        } else {
            // 생성 모드: CreateStudentInput 기본값
            dataToSet = {
                status: '재원',
                admission_date: new Date().toISOString().split('T')[0],
                student_name: '', grade: '', subject: '', tuition: '',
                // 나머지 optional & nullable 필드는 undefined 또는 '' 로 시작
                student_phone: undefined, guardian_phone: undefined, school_name: undefined,
                class: undefined, teacher: undefined,
            };
        }
        setFormData(dataToSet);
        setFormErrors({});
    }, [initialData, isEditMode]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const fieldName = name as FormFieldKey;

        const currentSchema = isEditMode ? updateStudentBodySchema : createStudentBodySchema;
        const fieldSchemaDefinition = currentSchema.shape[fieldName];
        let processedValue: string | null | undefined = value;

        if (value === '' && fieldSchemaDefinition && fieldSchemaDefinition._def.typeName === z.ZodFirstPartyTypeKind.ZodNullable) {
            processedValue = null;
        } else if (value === '' && fieldSchemaDefinition && fieldSchemaDefinition.isOptional() && !fieldSchemaDefinition._def.innerType?.isNullable?.()) {
            // Optional이지만 nullable이 아닌 string 필드가 비워지면 undefined (Zod가 optional로 처리)
            // 하지만 보통 string().optional()은 빈 문자열도 통과시키므로, 스키마에 .transform(v => v === '' ? undefined : v) 추가가 더 나음
            // 여기서는 빈 문자열 그대로 두고, Zod min(1) 등이 잡도록 함.
        }

        setFormData(prev => ({ ...prev, [fieldName]: processedValue }));
        if (formErrors[fieldName]) {
            setFormErrors(prev => ({ ...prev, [fieldName]: undefined }));
        }
    }, [formErrors, isEditMode]);

    const validateAndGetData = useCallback((): FormDataType | null => {
        const schemaToValidate = isEditMode ? updateStudentBodySchema : createStudentBodySchema;
        const result = schemaToValidate.safeParse(formData);

        if (!result.success) {
            setFormErrors(result.error.flatten().fieldErrors as Partial<Record<FormFieldKey, string[]>>);
            alert('입력값을 확인해주세요. 일부 항목이 유효하지 않습니다.');
            return null;
        }
        setFormErrors({});
        return result.data; // Zod가 변환한 최종 데이터
    }, [formData, isEditMode]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        const validatedData = validateAndGetData();
        if (!validatedData) return;
        await onSubmit(validatedData);
    }, [isSubmitting, onSubmit, validateAndGetData]);

    const currentFieldConfigs = getFieldConfigs(isEditMode);

    return (
        <form onSubmit={handleSubmit} className="student-form" noValidate>
            <h3 className="form-title">{isEditMode ? '학생 정보 수정' : '새 학생 등록'}</h3>
            <div className="form-grid">
                {currentFieldConfigs.map(field => {
                    const formValue = formData[field.key];
                    const errorMessages = formErrors[field.key];

                    // 스키마를 통해 필수 여부 판단 (생성 모드 기준)
                    const fieldSchemaInCreate = createStudentBodySchema.shape[field.key as keyof CreateStudentInput];
                    const isRequiredInCreate = fieldSchemaInCreate ? !fieldSchemaInCreate.isOptional() : false;
                    // 수정 모드에서는 모든 필드가 optional (updateStudentBodySchema가 partial)
                    const showRequiredAsterisk = !isEditMode && isRequiredInCreate;

                    return (
                        <div key={field.key} className={`form-field field-${field.key} ${errorMessages ? 'has-error' : ''}`}>
                            <label htmlFor={field.key} className="form-label">
                                {field.label}
                                {showRequiredAsterisk && <span className="required-asterisk">*</span>}
                            </label>
                            {field.type === 'select' && field.options ? (
                                <select
                                    id={field.key}
                                    name={field.key}
                                    value={String(formValue ?? (field.key === 'status' && !isEditMode ? '재원' : ''))} // 생성 시 status 기본값
                                    onChange={handleChange}
                                    className={`form-select ${errorMessages ? 'input-error' : ''}`}
                                    disabled={isSubmitting}
                                >
                                    {field.options.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={field.key === 'tuition' ? 'text' : (field.type || 'text')}
                                    id={field.key}
                                    name={field.key}
                                    placeholder={field.placeholder || ''}
                                    value={formValue === null || formValue === undefined ? '' : String(formValue)}
                                    onChange={handleChange}
                                    className={`form-input ${errorMessages ? 'input-error' : ''}`}
                                    disabled={isSubmitting}
                                    inputMode={field.key === 'tuition' ? 'numeric' : undefined}
                                />
                            )}
                            {errorMessages && errorMessages.map((err, i) => <p key={i} className="error-text">{err}</p>)}
                        </div>
                    );
                })}
            </div>
            <div className="form-actions">
                <button type="submit" className="button-base button-primary" disabled={isSubmitting}>
                    {isSubmitting ? (isEditMode ? '저장 중...' : '등록 중...') : (isEditMode ? '정보 저장' : '학생 등록')}
                </button>
                <button type="button" onClick={onCancel} className="button-base button-secondary" disabled={isSubmitting}>
                    취소
                </button>
            </div>
        </form>
    );
};

export default StudentForm;