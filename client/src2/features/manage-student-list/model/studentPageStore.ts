// File: monorepo/client/src/stores/studentPageStore.ts
import { create } from 'zustand';
import type { ColumnDefinition } from '../../../../../shared/src/types/ui.types';

interface StudentPageFilters {
    grade: string;
    subject: string;
    class: string;
    status: string;
}

interface StudentPageState {
    searchTerm: string;
    filters: StudentPageFilters;
    visibleColumns: Record<ColumnDefinition['key'], boolean>;
    isSettingsOpen: boolean;

    setSearchTerm: (term: string) => void;
    setFilter: (filterName: keyof StudentPageFilters, value: string) => void;
    resetFilters: () => void;
    toggleColumnVisibility: (columnKey: ColumnDefinition['key']) => void;
    initializeColumnVisibility: (
        allColumnDefinitions: ReadonlyArray<ColumnDefinition>,
        mobileHiddenKeys: ReadonlyArray<ColumnDefinition['key']>
    ) => void;
    toggleSettingsOpen: () => void;
}

const initialFilters: StudentPageFilters = { grade: '', subject: '', class: '', status: '' };

export const useStudentPageStore = create<StudentPageState>((set, get) => ({ // get 추가
    searchTerm: '',
    filters: initialFilters,
    // 스토어 생성 시점에는 컬럼 정의를 알 수 없으므로, 빈 객체로 시작하고
    // 사용하는 컴포넌트에서 initializeColumnVisibility를 호출하여 채우도록 함.
    // 타입 에러를 피하기 위해 타입 단언 사용.
    visibleColumns: {} as Record<ColumnDefinition['key'], boolean>,
    isSettingsOpen: false,

    setSearchTerm: (term) => set({ searchTerm: term }),
    setFilter: (filterName, value) => set(state => ({
        filters: { ...state.filters, [filterName]: value }
    })),
    resetFilters: () => set({ searchTerm: '', filters: initialFilters }),

    toggleColumnVisibility: (columnKey) => set(state => {
        // 현재 상태를 가져와서 해당 키가 있는지 확인하고 토글
        const currentVisibleColumns = get().visibleColumns;
        return {
            visibleColumns: {
                ...currentVisibleColumns,
                [columnKey]: !currentVisibleColumns[columnKey]
            }
        };
    }),

    initializeColumnVisibility: (allColumnDefinitions, mobileHiddenKeys) => {
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

        // allColumnDefinitions를 기반으로 초기 visibleColumns 객체 생성
        const initialCols = allColumnDefinitions.reduce<Record<ColumnDefinition['key'], boolean>>((acc, colDef) => {
            acc[colDef.key] = true; // 기본적으로 모든 컬럼을 보이도록 설정
            return acc;
        }, {} as Record<ColumnDefinition['key'], boolean>); // 초기 accumulator 타입 명시

        if (isMobile) {
            mobileHiddenKeys.forEach(key => {
                if (initialCols[key] !== undefined) { // 키 존재 여부 확인
                    initialCols[key] = false;
                }
            });
        }
        set({ visibleColumns: initialCols });
    },
    toggleSettingsOpen: () => set(state => ({ isSettingsOpen: !state.isSettingsOpen })),
}));