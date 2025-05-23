// filepath: client/src/pages/BridgePage.tsx (CSS 최소화 버전)
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
// BridgePage.css import 제거 또는 아주 최소한의 CSS만 남김

const BridgePage: React.FC = () => {
    const navigate = useNavigate();
    // 상태 메시지만 관리하고, UI는 매우 간단하게 처리
    const [statusMessage, setStatusMessage] = useState('인증 정보를 확인 중입니다...');

    useEffect(() => {
        const processAuthRedirect = async () => {
            try {
                const sessionResponse = await fetch('/api/auth/session', { // 수정된 부분
                    credentials: 'include', // credentials 옵션 확인 및 유지
                });
                if (!sessionResponse.ok) {
                    setStatusMessage('세션 정보를 가져올 수 없습니다. 로그인 페이지로 이동합니다.');
                    setTimeout(() => navigate('/login', { replace: true }), 1500); // 짧게 메시지 보여주고 이동
                    return;
                }

                const sessionData = await sessionResponse.json();
                if (!sessionData.user || !sessionData.user.id) {
                    setStatusMessage('유효한 사용자 정보가 없습니다. 로그인 페이지로 이동합니다.');
                    setTimeout(() => navigate('/login', { replace: true }), 1500);
                    return;
                }

                setStatusMessage('프로필 정보를 확인 중입니다...');
                const profileCheckResponse = await fetch('/api/profiles/check', { // 수정된 부분
                    credentials: 'include', // credentials 옵션 확인 및 유지
                });
                if (!profileCheckResponse.ok) {
                    setStatusMessage('프로필 정보를 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
                    // 이 경우, 사용자가 볼 수 있도록 에러 상태를 좀 더 유지하거나 로그인 페이지로 즉시 보낼 수 있음
                    // setTimeout(() => navigate('/login', { replace: true }), 3000); 
                    return;
                }

                const profileData = await profileCheckResponse.json();
                if (profileData.exists) {
                    navigate('/dashboard', { replace: true });
                } else {
                    navigate('/profilesetup', { replace: true });
                }

            } catch (error) {
                console.error('BridgePage 처리 중 오류:', error);
                setStatusMessage('오류가 발생했습니다. 로그인 페이지로 이동합니다.');
                setTimeout(() => navigate('/login', { replace: true }), 3000);
            }
        };

        processAuthRedirect();
    }, [navigate]);

    // 아주 간단한 로딩/상태 메시지 표시
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontFamily: 'var(--base-font-family, sans-serif)', // index.css의 변수 참조 시도
            backgroundColor: 'var(--app-bg-color, #f0f2f5)',
            color: 'var(--text-primary, #333)',
            padding: '20px',
            textAlign: 'center'
        }}>
            <p>{statusMessage}</p>
        </div>
    );
};

export default BridgePage;