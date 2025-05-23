// File: monorepo/client/src/components/auth/ProtectedRoutes.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '../../stores/authStore';

interface ProtectedRoutesProps {
    redirectTo?: string; // 인증되지 않았을 때 리다이렉트할 경로
}

const ProtectedRoutes: React.FC<ProtectedRoutesProps> = ({ redirectTo = '/login' }) => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated());
    const isLoadingAuth = useAuthStore(state => state.isLoading);
    const location = useLocation();

    if (isLoadingAuth) {
        // 초기 인증 상태 확인 중... 로딩 인디케이터 표시
        // 이 부분은 App.tsx 전체를 덮는 로딩 화면으로 대체될 수도 있습니다.
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <h2>인증 상태 확인 중...</h2>
            </div>
        );
    }

    if (!isAuthenticated) {
        // 사용자가 로그인하지 않았다면 로그인 페이지로 리다이렉트
        // 현재 경로를 state로 전달하여 로그인 후 원래 페이지로 돌아갈 수 있도록 함
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // 사용자가 로그인했다면 요청된 컴포넌트(자식 라우트)를 렌더링
    return <Outlet />;
};

export default ProtectedRoutes;