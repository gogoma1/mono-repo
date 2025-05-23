// File: monorepo/client/src/components/common/popover/MenuContent/ProfileMenuContent.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router'; // react-router-dom에서 useNavigate 가져오기
import { LuUser, LuSettings, LuLogIn, LuLogOut } from 'react-icons/lu';
import { useAuthStore } from '../../../../stores/authStore';

// API_BASE_URL 사용 제거
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787'; // 이 줄 삭제 또는 주석
// LOGOUT_URL을 상대 경로로 변경
const LOGOUT_API_PATH = '/signout'; // Vite 프록시를 통해 백엔드로 전달될 상대 경로

interface ProfileMenuContentProps {
    onClose?: () => void;
}

// 스타일 정의
const styles = {
    popoverContent: { minWidth: '200px', backgroundColor: 'var(--glass-base-bg, rgba(255, 255, 255, 0.8))', backdropFilter: 'blur(10px)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', overflow: 'hidden', } as React.CSSProperties,
    userInfoSection: { padding: '12px 16px', borderBottom: '1px solid var(--border-color-light, rgba(0, 0, 0, 0.1))', } as React.CSSProperties,
    userName: { margin: 0, fontWeight: 600, fontSize: '15px', color: 'var(--text-color-primary, #333)', } as React.CSSProperties,
    userEmail: { margin: '4px 0 0', fontSize: '13px', color: 'var(--text-color-secondary, #777)', } as React.CSSProperties,
    menuList: { listStyle: 'none', margin: 0, padding: '8px 0', } as React.CSSProperties,
    menuItemLi: { padding: '0', } as React.CSSProperties,
    commonMenuItem: { display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: 'var(--text-color-primary, #333)', textDecoration: 'none', } as React.CSSProperties,
    menuItemIcon: { marginRight: '12px', flexShrink: 0, } as React.CSSProperties,
    menuItemText: { flexGrow: 1, } as React.CSSProperties,
};


const ProfileMenuContent: React.FC<ProfileMenuContentProps> = ({ onClose }) => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout: storeLogoutAction, isLoading } = useAuthStore(
        // 상태 변경 시 선택적 리렌더링을 위한 selector (user 객체 전체가 변경될 때만)
        // (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated, logout: state.logout, isLoading: state.isLoading })
        // 또는 기본 구독 사용
    );

    const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);

    // Link 컴포넌트 클릭 시 자동으로 onClose를 호출하도록 수정 (별도 handleItemClick 불필요)
    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    const handleLoginClick = () => {
        navigate('/login');
        handleClose();
    };

    const handleLogoutClick = async () => {
        // console.log("[ProfileMenuContent] handleLogoutClick initiated."); // 필요시 유지
        try {
            // 서버에 로그아웃 요청 (상대 경로 사용)
            const response = await fetch(LOGOUT_API_PATH, {
                method: 'GET', // 백엔드 /signout 라우트가 GET을 받는지 확인
                credentials: 'include', // 쿠키 전송을 위해 중요
            });

            // console.log("[ProfileMenuContent] Logout API response status:", response.status); // 필요시 유지
            if (!response.ok && !response.redirected) {
                // 서버에서 오류 응답 (예: 500). 리디렉션(302)은 성공으로 간주.
                const errorText = await response.text();
                console.error("[ProfileMenuContent] Logout API call failed:", response.status, errorText);
                // 사용자에게 오류를 알릴 수 있습니다. (선택 사항)
                // 이 경우에도 프론트엔드 상태는 로그아웃 처리하는 것이 안전할 수 있음
            }
            // 성공 또는 실패(네트워크 오류 제외) 여부와 관계없이 아래 finally 블록에서 프론트엔드 상태 처리
        } catch (error) {
            console.error("[ProfileMenuContent] Error during fetch logout:", error);
            // 네트워크 오류 등 fetch 자체의 예외 발생
        } finally {
            // API 호출 성공 여부와 관계없이 프론트엔드 상태는 확실히 로그아웃으로 만들고 페이지 이동
            // console.log("[ProfileMenuContent] Calling storeLogoutAction (clears local auth state)."); // 필요시 유지
            storeLogoutAction(); // Zustand 스토어에서 사용자 정보 제거

            // console.log("[ProfileMenuContent] Navigating to /login."); // 필요시 유지
            navigate('/login', { replace: true });  // 로그아웃 후 로그인 페이지로 replace

            handleClose(); // 팝오버 닫기
        }
    };

    const getMenuItemStyle = (itemName: string): React.CSSProperties => ({
        ...styles.commonMenuItem,
        backgroundColor: hoveredItem === itemName ? 'var(--hover-bg-color-light, rgba(0, 0, 0, 0.05))' : 'transparent',
        transition: 'background-color 0.2s ease-in-out',
    });

    // 스토어의 isLoading 상태와 rehydration 상태를 함께 고려하여 로딩 표시
    if (isLoading && !useAuthStore.persist.hasHydrated()) {
        return <div style={{ ...styles.popoverContent, padding: '20px', textAlign: 'center' }}><p>로딩 중...</p></div>;
    }

    return (
        <div style={styles.popoverContent}>
            {isAuthenticated() && user ? (
                <>
                    <div style={styles.userInfoSection}>
                        <p style={styles.userName}>{user.name || '사용자'}</p>
                        <p style={styles.userEmail}>{user.email}</p>
                    </div>
                    <ul style={styles.menuList}>
                        <li style={styles.menuItemLi}>
                            <Link to="/profile" style={getMenuItemStyle('profile')} onClick={handleClose} onMouseEnter={() => setHoveredItem('profile')} onMouseLeave={() => setHoveredItem(null)} aria-label="내 프로필 보기" >
                                <LuUser size={16} style={styles.menuItemIcon} /> <span style={styles.menuItemText}>내 프로필</span>
                            </Link>
                        </li>
                        <li style={styles.menuItemLi}>
                            <Link to="/settings/account" style={getMenuItemStyle('settings')} onClick={handleClose} onMouseEnter={() => setHoveredItem('settings')} onMouseLeave={() => setHoveredItem(null)} aria-label="계정 설정으로 이동" >
                                <LuSettings size={16} style={styles.menuItemIcon} /> <span style={styles.menuItemText}>계정 설정</span>
                            </Link>
                        </li>
                        <li style={styles.menuItemLi}>
                            <button type="button" style={getMenuItemStyle('logout')} onClick={handleLogoutClick} onMouseEnter={() => setHoveredItem('logout')} onMouseLeave={() => setHoveredItem(null)} aria-label="로그아웃" >
                                <LuLogOut size={16} style={styles.menuItemIcon} /> <span style={styles.menuItemText}>로그아웃</span>
                            </button>
                        </li>
                    </ul>
                </>
            ) : (
                <ul style={styles.menuList}>
                    <li style={styles.menuItemLi}>
                        <button type="button" style={getMenuItemStyle('login')} onClick={handleLoginClick} onMouseEnter={() => setHoveredItem('login')} onMouseLeave={() => setHoveredItem(null)} aria-label="로그인" >
                            <LuLogIn size={16} style={styles.menuItemIcon} /> <span style={styles.menuItemText}>로그인</span>
                        </button>
                    </li>
                </ul>
            )}
        </div>
    );
};

export default ProfileMenuContent;