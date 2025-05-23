import React from 'react';
import GlassTable, { TableColumn } from '../../src2/shared/ui/glasstable/GlassTable'; // 경로 확인

// 예시 데이터 타입
interface UserData {
    id: number;
    name: string;
    email: string;
    role: string;
    status: 'Active' | 'Inactive' | 'Pending';
    lastLogin: string;
}

// 예시 컬럼 정의
const userColumns: TableColumn<UserData>[] = [
    { key: 'id', header: 'ID', width: '80px' },
    { key: 'name', header: '이름' },
    { key: 'email', header: '이메일' },
    { key: 'role', header: '역할', width: '120px' },
    {
        key: 'status',
        header: '상태',
        width: '100px',
        render: (item) => (
            <span className={`status-badge status-${item.status.toLowerCase()}`}>
                {item.status}
            </span>
        ),
    },
    { key: 'lastLogin', header: '최근 로그인', width: '180px' },
];

// 예시 데이터
const sampleUserData: UserData[] = [
    { id: 1, name: '김철수', email: 'chulsoo@example.com', role: 'Admin', status: 'Active', lastLogin: '2023-04-10 10:00' },
    { id: 2, name: '이영희', email: 'younghee@example.com', role: 'Editor', status: 'Active', lastLogin: '2023-04-10 09:30' },
    { id: 3, name: '박민준', email: 'minjun@example.com', role: 'Viewer', status: 'Inactive', lastLogin: '2023-03-20 15:00' },
    { id: 4, name: '최유나', email: 'yuna@example.com', role: 'Editor', status: 'Pending', lastLogin: '2023-04-09 11:00' },
    // ... 더 많은 데이터
];

// 상태 배지를 위한 간단한 CSS (PageStyles.css 또는 DashboardPage.module.css 등에 추가)
/*
// 예시: client/src/pages/PageStyles.css
.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 500;
  color: white;
  display: inline-block;
  min-width: 60px;
  text-align: center;
}
.status-active { background-color: #2ecc71; } // Green
.status-inactive { background-color: #e74c3c; } // Red
.status-pending { background-color: #f39c12; } // Orange
*/

const DashboardPage: React.FC = () => {
    const [isLoading, setIsLoading] = React.useState(false); // 로딩 상태 예시
    // 실제 앱에서는 API 호출 등으로 데이터를 가져옵니다.
    // const [users, setUsers] = React.useState<UserData[]>([]);
    // React.useEffect(() => {
    //   setIsLoading(true);
    //   fetchUsers().then(data => {
    //     setUsers(data);
    //     setIsLoading(false);
    //   });
    // }, []);

    return (
        <div className="dashboard-page-content"> {/* 페이지 전체를 감싸는 div (선택) */}
            <h1>대시보드</h1>
            <p>최근 활동 및 사용자 목록입니다.</p>

            <div style={{ marginTop: '30px' }}>
                <GlassTable<UserData>
                    columns={userColumns}
                    data={sampleUserData} // 실제로는 API로 가져온 데이터를 사용: users
                    caption="사용자 목록"
                    isLoading={isLoading}
                // emptyMessage="등록된 사용자가 없습니다."
                />
            </div>

            {/* 다른 대시보드 컴포넌트들 */}
            {Array.from({ length: 10 }).map((_, i) => (
                <p key={i}>Dashboard content line {i + 1} to test scrolling with table.</p>
            ))}
        </div>
    );
};

export default DashboardPage;