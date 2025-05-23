// filepath: c:\Users\nicew\Desktop\fullstack\monorepo\client\src\components\rootlayout\GlassSidebarRight.tsx
import React from 'react';
import Tippy from '@tippyjs/react';
import './GlassSidebarRight.css';
import { useUIStore } from '../../stores/uiStore';
import { LuSettings2, LuChevronRight, LuPalette, LuSunMoon, LuBadgeInfo } from 'react-icons/lu';

const SettingsIcon = () => <LuSettings2 size={20} />;
const CloseRightSidebarIcon = () => <LuChevronRight size={22} />;

const ExpandedSidebarContent: React.FC = () => {
    return (
        <div className="sidebar-right-content-placeholder">
            <h4 className="content-title">
                <LuSettings2 size={18} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                애플리케이션 설정
            </h4>
            <p className="content-description">
                이곳에서 앱의 다양한 기본 설정을 변경하고 개인화할 수 있습니다.
            </p>
            <div className="setting-item" role="button" tabIndex={0} aria-label="테마 변경">
                <LuPalette size={17} className="setting-item-icon" />
                <span>테마 변경</span>
            </div>
            <div className="setting-item" role="button" tabIndex={0} aria-label="다크/라이트 모드 전환">
                <LuSunMoon size={17} className="setting-item-icon" />
                <span>모드 전환</span>
            </div>
            <div className="setting-item" role="button" tabIndex={0} aria-label="앱 정보 보기">
                <LuBadgeInfo size={17} className="setting-item-icon" />
                <span>앱 정보</span>
            </div>
        </div>
    );
};

const GlassSidebarRight: React.FC = () => {
    const { isRightSidebarExpanded, mobileSidebarType, currentBreakpoint, toggleRightSidebar, closeMobileSidebar } = useUIStore();

    // isVisibleOnScreen은 이 컴포넌트가 화면에 실제로 보여야 하는지 여부
    let isVisibleOnScreen = true;
    let isActuallyExpanded = false; // 데스크탑/태블릿 확장 여부 또는 모바일에서는 항상 확장된 것으로 간주

    if (currentBreakpoint === 'mobile') {
        isVisibleOnScreen = mobileSidebarType === 'right';
        isActuallyExpanded = true;
    } else {
        // 데스크탑/태블릿에서는 항상 isVisibleOnScreen = true (숨기는 로직 없음)
        isActuallyExpanded = isRightSidebarExpanded;
    }

    const tooltipContent = isActuallyExpanded ? "설정 패널 축소" : "설정 패널 확장";

    // App.tsx에서 모바일일 때 항상 렌더링하므로, 여기서 null 반환하면 안됨.
    // open 클래스로 제어.
    if (currentBreakpoint === 'mobile' && mobileSidebarType !== 'right') {
        // return null; // DOM에서 제거하면 트랜지션 안됨
    }
    // 데스크탑/태블릿에서 isRightSidebarExpanded가 false일때는 축소된 형태로 보이므로 null 반환 안함.
    // if (currentBreakpoint !== 'mobile' && !isVisibleOnScreen) return null; 

    return (
        <aside className={`glass-sidebar-right
            ${isActuallyExpanded ? 'expanded' : ''}
            ${currentBreakpoint === 'mobile' ? 'mobile-sidebar right-mobile-sidebar' : ''}
            ${currentBreakpoint === 'mobile' && isVisibleOnScreen ? 'open' : ''}
        `}>
            <div className="sidebar-header rgs-mobile-header">
                {currentBreakpoint === 'mobile' && (
                    <>
                        <Tippy content="닫기" placement="bottom" theme="custom-glass" animation="perspective" delay={[200, 0]}>
                            <button onClick={closeMobileSidebar} className="sidebar-close-button mobile-only rgs-close-btn" aria-label="설정 닫기">
                                <CloseRightSidebarIcon />
                            </button>
                        </Tippy>
                    </>
                )}
            </div>

            {currentBreakpoint !== 'mobile' && (
                <nav className="sidebar-right-nav rgs-nav">
                    <div className="sidebar-right-button-container">
                        <Tippy content={tooltipContent} placement="left" theme="custom-glass" animation="perspective" delay={[300, 0]}>
                            <button
                                onClick={toggleRightSidebar}
                                className="settings-toggle-button"
                                aria-label={tooltipContent}
                                aria-expanded={isActuallyExpanded}
                            >
                                <SettingsIcon />
                            </button>
                        </Tippy>
                    </div>
                </nav>
            )}

            {/* 모바일에서는 isVisibleOnScreen으로 콘텐츠 표시, 데스크탑에서는 isActuallyExpanded로 결정 */}
            {((currentBreakpoint === 'mobile' && isVisibleOnScreen) || (currentBreakpoint !== 'mobile' && isActuallyExpanded)) && (
                <div className="expanded-content-area rgs-content">
                    <ExpandedSidebarContent />
                </div>
            )}
        </aside>
    );
};
export default GlassSidebarRight;