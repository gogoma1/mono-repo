// filepath: client/src/pages/ProfileSetupPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import BackgroundBlobs from '../components/rootlayout/BackgroundBlobs'; // 배경 블롭
import './ProfileSetupPage.css'; // ProfileSetupPage.css import

const POSITIONS = ['학생', '원장', '강사', '학부모'] as const;
type PositionType = typeof POSITIONS[number];

const ProfileSetupPage: React.FC = () => {
    const navigate = useNavigate();

    const [academyName, setAcademyName] = useState('');
    const [region, setRegion] = useState('');
    const [selectedPosition, setSelectedPosition] = useState<PositionType | ''>('');

    const [userId, setUserId] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userName, setUserName] = useState('');

    const [isLoading, setIsLoading] = useState(false); // API 호출 로딩
    const [isPageLoading, setIsPageLoading] = useState(true); // 세션 정보 로딩
    const [formError, setFormError] = useState('');
    const [apiErrorMessage, setApiErrorMessage] = useState('');

    useEffect(() => {
        const fetchSession = async () => {
            setIsPageLoading(true);
            try {
                const response = await fetch('/api/auth/session');
                if (response.ok) {
                    const data = await response.json();
                    if (data.user && data.user.id) {
                        // 프로필이 이미 있는지 한번 더 확인 (사용자가 직접 /profilesetup으로 왔을 경우)
                        const profileCheckResponse = await fetch('/api/profiles/check');
                        if (profileCheckResponse.ok) {
                            const profileData = await profileCheckResponse.json();
                            if (profileData.exists) {
                                navigate('/dashboard', { replace: true }); // 이미 프로필 있으면 대시보드로
                                return;
                            }
                        }
                        // 프로필 없으면 정보 설정
                        setUserId(data.user.id);
                        setUserEmail(data.user.email);
                        setUserName(data.user.name);
                    } else {
                        navigate('/login', { replace: true });
                    }
                } else {
                    navigate('/login', { replace: true });
                }
            } catch (error) {
                console.error('세션 로딩 오류 (ProfileSetupPage):', error);
                setApiErrorMessage('사용자 정보를 불러올 수 없습니다.');
                // navigate('/login', { replace: true }); // 필요시 로그인으로 강제 이동
            } finally {
                setIsPageLoading(false);
            }
        };
        fetchSession();
    }, [navigate]);

    const validateForm = (): boolean => {
        if (!selectedPosition) {
            setFormError('직급을 선택해 주세요.');
            return false;
        }
        if (!academyName.trim()) {
            setFormError('학원 이름을 입력해 주세요.');
            return false;
        }
        if (!region.trim()) {
            setFormError('지역을 입력해 주세요.');
            return false;
        }
        setFormError('');
        return true;
    };

    const handleSaveProfile = async (event: React.FormEvent) => {
        event.preventDefault();
        setApiErrorMessage('');
        if (!validateForm() || isLoading) return;
        setIsLoading(true);

        try {
            const response = await fetch('/api/profiles/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: userId, email: userEmail, name: userName,
                    position: selectedPosition,
                    academyName: academyName.trim(),
                    region: region.trim(),
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                setApiErrorMessage(data.error || '프로필 저장에 실패했습니다.');
            } else {
                navigate('/dashboard', { replace: true });
            }
        } catch (error) {
            setApiErrorMessage('프로필 저장 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isPageLoading) {
        return (
            <div className="profile-setup-page-wrapper">
                <div className="profile-setup-container" style={{ textAlign: 'center' }}>
                    <p>사용자 정보를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-setup-page-wrapper">
            <div className="login-background-blobs-wrapper"> {/* LoginPage와 동일한 배경 사용 */}
                <BackgroundBlobs />
            </div>
            <div className="profile-setup-container"> {/* z-index로 블롭 위에 오도록 CSS에서 처리 필요 */}
                <h1 className="profile-setup-title">프로필 설정</h1>
                <p className="profile-setup-subtitle">서비스 이용을 위해 추가 정보를 입력해 주세요.</p>
                <form onSubmit={handleSaveProfile} className="profile-setup-form">
                    <div className="form-group">
                        <label className="form-label">직급</label>
                        <div className="position-buttons-group">
                            {POSITIONS.map((pos) => (
                                <button
                                    type="button"
                                    key={pos}
                                    className={`position-button ${selectedPosition === pos ? 'active' : ''}`}
                                    onClick={() => setSelectedPosition(pos)}
                                >
                                    {pos}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="academyName" className="form-label">학원 이름</label>
                        <input
                            type="text" id="academyName" value={academyName}
                            onChange={(e) => setAcademyName(e.target.value)}
                            placeholder="학원 이름을 입력하세요" className="form-input" required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="region" className="form-label">지역</label>
                        <input
                            type="text" id="region" value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            placeholder="예: 서울특별시 강남구" className="form-input" required
                        />
                    </div>
                    {(formError || apiErrorMessage) && (
                        <p className="error-message">{formError || apiErrorMessage}</p>
                    )}
                    <button type="submit" disabled={isLoading || !!formError || isPageLoading} className="submit-button">
                        {isLoading ? '저장 중...' : '저장하고 시작하기'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileSetupPage;