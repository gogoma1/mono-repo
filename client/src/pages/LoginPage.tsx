// File: monorepo/client/src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
// useNavigate와 useLocation은 현재 코드에서 직접 사용되지 않으므로 제거해도 됩니다.
// 만약 다른 로직에서 필요하다면 유지합니다.
// import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import BackgroundBlobs from '../components/rootlayout/BackgroundBlobs';
import './LoginPage.css';


const LoginPage: React.FC = () => {

    const [isSocialLoginLoading, setIsSocialLoginLoading] = useState<null | 'kakao' | 'google'>(null);
    const [errorMessage, setErrorMessage] = useState(''); // 로그인 실패 시 에러 메시지 표시용 (선택 사항)

    // 소셜 로그인 처리 함수
    const handleSocialLogin = (provider: 'kakao' | 'google') => {
        if (isSocialLoginLoading) return; // 이미 다른 소셜 로그인 진행 중이면 중복 실행 방지
        setIsSocialLoginLoading(provider);
        setErrorMessage(''); // 이전 에러 메시지 초기화

        // 서버 index.ts에서 authRouter가 '/auth' 경로에 마운트되었다고 가정
        // 실제 서버의 로그인 시작 URL로 이동합니다.
        let providerPath = '';
        if (provider === 'kakao') {
            providerPath = '/signin/kakao';
        } else if (provider === 'google') {
            providerPath = '/signin/google';
        }
        // 다른 프로바이더가 있다면 여기에 추가 (예: github)

        if (providerPath) {
            window.location.href = providerPath;
        } else {
            console.error("Unsupported provider:", provider);
            setErrorMessage("지원하지 않는 로그인 방식입니다.");
            setIsSocialLoginLoading(null);
        }
    };

    // URL 쿼리 파라미터에서 에러 메시지 확인 (예: OAuth 콜백 실패 시)
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const errorParam = queryParams.get('error');
        if (errorParam) {
            if (errorParam === 'auth_failed') {
                setErrorMessage('소셜 로그인에 실패했습니다. 다시 시도해주세요.');
            } else {
                setErrorMessage(decodeURIComponent(errorParam));
            }
            // 에러 파라미터를 URL에서 제거 (새로고침 시 반복 표시 방지)
            // window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);


    return (
        <div className="login-page-wrapper">
            <div className="login-background-blobs-wrapper">
                <BackgroundBlobs />
            </div>
            <div className="login-page-container">
                <div className="login-form-card">
                    <h1 className="login-title">로그인</h1>
                    <p className="login-subtitle">소셜 계정으로 간편하게 로그인하고<br />모든 기능을 이용해보세요.</p>
                    <div className="social-login-buttons-container">
                        <button
                            type="button"
                            className="social-login-button kakao-login-button"
                            onClick={() => handleSocialLogin('kakao')}
                            disabled={isSocialLoginLoading === 'kakao' || !!isSocialLoginLoading}
                            aria-label="카카오 계정으로 로그인"
                        >
                            <svg className="social-login-icon kakao-icon" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
                                <path d="M9 0C4.029 0 0 3.138 0 7C0 9.039 1.206 10.845 3.108 12.015L2.582 14.956C2.529 15.262 2.811 15.513 3.099 15.37L6.091 13.898C6.683 13.961 7.293 14 7.922 14C12.971 14 17 10.862 17 7C17 3.138 12.971 0 7.922 0C7.922 0 9 0 9 0Z" fill="#000000" />
                            </svg>
                            <span className="social-login-text">
                                {isSocialLoginLoading === 'kakao' ? '카카오로 이동 중...' : '카카오 계정으로 로그인'}
                            </span>
                        </button>
                        <button
                            type="button"
                            className="social-login-button google-login-button"
                            onClick={() => handleSocialLogin('google')}
                            disabled={isSocialLoginLoading === 'google' || !!isSocialLoginLoading}
                            aria-label="Google 계정으로 로그인"
                        >
                            <svg className="social-login-icon google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="18" height="18"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /><path d="M1 1h22v22H1z" fill="none" /></svg>
                            <span className="social-login-text">
                                {isSocialLoginLoading === 'google' ? 'Google로 이동 중...' : 'Google 계정으로 로그인'}
                            </span>
                        </button>

                    </div>
                    {errorMessage && (
                        <p className="login-error-message">{errorMessage}</p>
                    )}
                    <p className="login-terms">
                        로그인 시 <a href="/terms" target="_blank" rel="noopener noreferrer">이용약관</a> 및 <a href="/privacy" target="_blank" rel="noopener noreferrer">개인정보처리방침</a>에 동의하는 것으로 간주됩니다.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;