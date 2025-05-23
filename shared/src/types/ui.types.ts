// File: monorepo/shared/src/types/ui.types.ts
import type { StudentZod } from '../schemas/app.schema';

export interface ColumnDefinition {
    key: keyof StudentZod | 'actions' | 'checkbox';
    label: string;
    isSortable?: boolean;
    isEditable?: boolean;
    // inputType에 'tel' 추가
    inputType?: 'text' | 'number' | 'date' | 'select' | 'tel';
    options?: ReadonlyArray<string>;
}