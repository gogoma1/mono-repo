// filepath: monorepo/client/src2/shared/ui/glasstable/GlassTable.tsx

import React from 'react';
import './GlassTable.css';

export interface TableColumn<T> {
  key: keyof T | string;
  header: React.ReactNode;
  render?: (item: T) => React.ReactNode;
  width?: string;
}

interface GlassTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  caption?: string;
  isLoading?: boolean;
  emptyMessage?: string;
}

const GlassTable = <T extends object>({
  columns,
  data,
  caption,
  isLoading = false,
  emptyMessage = "표시할 데이터가 없습니다."
}: GlassTableProps<T>) => {
  return (
    <div className="glass-table-wrapper"> {/* 테이블 전체를 감싸는 외부 래퍼는 유지 */}
      {/* caption 위치는 table 내부로 이동 */}
      <div className="glass-table-scroll-container">
        <table className="glass-table">
          {/* caption을 table 태그의 직계 자식으로, 그리고 thead보다 먼저 위치시킵니다. */}
          {caption && <caption className="glass-table-caption">{caption}</caption>}
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={String(col.key)} style={{ width: col.width }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="loading-cell">
                  <div className="spinner"></div> {/* 스피너 스타일은 GlassTable.css에 정의 필요 */}
                  <span>데이터를 불러오는 중...</span>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="empty-cell">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr key={`row-${rowIndex}`}>
                  {columns.map((col) => (
                    <td key={`cell-${rowIndex}-${String(col.key)}`}>
                      {col.render
                        ? col.render(item)
                        : String(item[col.key as keyof T] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GlassTable;