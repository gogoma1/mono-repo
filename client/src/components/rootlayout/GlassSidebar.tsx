// filepath: c:\Users\nicew\Desktop\fullstack\monorepo\client\src\components\rootlayout\GlassSidebar.tsx
import React from 'react';
import { NavLink } from 'react-router';
import Tippy from '@tippyjs/react';
import './GlassSidebar.css';
import { useUIStore } from '../../stores/uiStore';
import {
    LuLayoutDashboard, LuCheck, LuLibrary, LuHeart, LuActivity,
    LuChartBar, LuFileText, LuChevronLeft, LuChevronRight
} from 'react-icons/lu';

interface MenuItemData {
    path: string;
    name: string;
    icon: React.ReactNode;
    isSubItem?: boolean;
    badge?: number;
}

const DashboardIcon = () => <LuLayoutDashboard size={18} />;
const ActivityIcon = () => <LuActivity size={18} />;
const StatisticIcon = () => <LuChartBar size={18} />;
const PerformanceIcon = () => <LuFileText size={18} />;
const TasksIcon = () => <LuCheck size={18} />;
const LibrariesIcon = () => <LuLibrary size={18} />;
const SavedIcon = () => <LuHeart size={18} />;
const CloseLeftSidebarIcon = () => <LuChevronLeft size={22} />;
const TabletToggleChevronLeftIcon = () => <LuChevronLeft size={20} />;
const TabletToggleChevronRightIcon = () => <LuChevronRight size={20} />;

export const allMenuItems: MenuItemData[] = [
    { path: '/dashboard', name: '대시보드', icon: <DashboardIcon /> },
    { path: '/dashboard/activity', name: '활동', icon: <ActivityIcon />, isSubItem: true },
    { path: '/dashboard/statistic', name: '통계', icon: <StatisticIcon />, isSubItem: true },
    { path: '/dashboard/performance-cases', name: '성능 사례', icon: <PerformanceIcon />, isSubItem: true },
    { path: '/studenttabletest', name: '테이블테스트', icon: <TasksIcon />, badge: 5 },
    { path: '/students', name: '학생관리', icon: <LibrariesIcon /> },
    { path: '/mystudentpage', name: 'API테스트', icon: <SavedIcon /> },
];

const GlassSidebar: React.FC = () => {
    const { isLeftSidebarExpanded, mobileSidebarType, currentBreakpoint, toggleLeftSidebar, closeMobileSidebar } = useUIStore();

    let sidebarShouldBeCollapsed = false;
    // isVisible은 이 컴포넌트가 화면에 실제로 보여야 하는지 여부 (모바일에서는 mobileSidebarType으로 결정)
    let isVisibleOnScreen = true;

    if (currentBreakpoint === 'mobile') {
        isVisibleOnScreen = mobileSidebarType === 'left';
        sidebarShouldBeCollapsed = false;
    } else if (currentBreakpoint === 'tablet') {
        sidebarShouldBeCollapsed = !isLeftSidebarExpanded;
    } else { // desktop
        sidebarShouldBeCollapsed = !isLeftSidebarExpanded;
    }

    const handleLinkClick = () => {
        if (currentBreakpoint === 'mobile') {
            closeMobileSidebar();
        }
    };

    // 모바일이면서, 이 사이드바가 열릴 타입('left')이 아니면 렌더링하지 않음 (DOM에서는 제거)
    // App.tsx에서 항상 렌더링하도록 변경했으므로, 이 조건은 필요 없어지거나,
    // 애니메이션을 위해 DOM에 남겨두고 CSS로 숨기려면 이 return null을 제거해야 합니다.
    // 여기서는 App.tsx에서 이미 제어하므로, 이 컴포넌트가 렌더링 될 때는 currentBreakpoint === 'mobile'이면 mobileSidebarType === 'left'라고 가정할 수 없습니다.
    // 대신, mobile이면서 type이 'left'가 아닐때는 아무것도 렌더링하지 않도록 하는게 CSS 복잡도를 줄일 수 있습니다.
    // 하지만 트랜지션을 위해서는 DOM에 있어야 하므로, null 반환은 하지 않습니다.
    // App.tsx에서 <GlassSidebar />를 호출한다는 것은 currentBreakpoint === 'mobile' 일 때 mobileSidebarType을 신경쓰지 않고 일단 DOM에 넣는다는 의미.
    // 그러면 open 클래스만 제어하면 됩니다.
    if (currentBreakpoint === 'mobile' && mobileSidebarType !== 'left') {
        // DOM에 존재는 하지만, open 클래스가 없어서 CSS에 의해 숨겨지고 트랜지션이 적용됩니다.
        // return null; // DOM에서 제거하면 트랜지션 안됨
    }
    // 데스크탑/태블릿일 때 isVisibleOnScreen (항상 true) 이지만,
    // 만약 데스크탑/태블릿에서 사이드바 자체를 숨기는 로직이 있다면 여기에 추가. 현재는 없음.
    // if (currentBreakpoint !== 'mobile' && !isVisibleOnScreen) return null;


    return (
        <aside className={`glass-sidebar
            ${sidebarShouldBeCollapsed ? 'collapsed' : ''}
            ${currentBreakpoint === 'mobile' ? 'mobile-sidebar left-mobile-sidebar' : ''}
            ${currentBreakpoint === 'mobile' && isVisibleOnScreen ? 'open' : ''}
        `}>
            {/* isVisibleOnScreen 조건은 모바일에서만 의미가 있고, 데스크탑/태블릿에서는 항상 true임 */}
            {/* 따라서 모바일에서만 사이드바 내용이 보이도록 하려면 아래와 같이 콘텐츠 영역을 isVisibleOnScreen으로 감쌀 수 있음 */}
            {/* 또는 CSS에서 .mobile-sidebar:not(.open) { display: none; } 처럼 처리 */}
            {/* 현재는 open 클래스로 CSS에서 제어하므로 내부 컨텐츠 조건부 렌더링은 불필요 */}

            <div className="sidebar-header lgs-header">
                {currentBreakpoint === 'mobile' && (
                    <>
                        <span className="sidebar-header-text">메뉴</span>
                        <Tippy content="닫기" placement="bottom" theme="custom-glass" animation="perspective" delay={[200, 0]}>
                            <button onClick={closeMobileSidebar} className="sidebar-close-button mobile-only lgs-close-btn" aria-label="메뉴 닫기">
                                <CloseLeftSidebarIcon />
                            </button>
                        </Tippy>
                    </>
                )}
                {currentBreakpoint !== 'mobile' && (
                    <>
                        {(!sidebarShouldBeCollapsed) && <span className="sidebar-header-text">MAIN</span>}
                    </>
                )}
            </div>

            {currentBreakpoint === 'tablet' && (
                <div className="tablet-toggle-button-wrapper">
                    <Tippy content={isLeftSidebarExpanded ? "메뉴 축소" : "메뉴 확장"} placement="right" theme="custom-glass" animation="perspective" delay={[200, 0]}>
                        <button
                            onClick={toggleLeftSidebar}
                            className="sidebar-toggle-button left-sidebar-toggle tablet-control"
                            aria-label={isLeftSidebarExpanded ? "메뉴 축소" : "메뉴 확장"}
                        >
                            {isLeftSidebarExpanded ? <TabletToggleChevronLeftIcon /> : <TabletToggleChevronRightIcon />}
                        </button>
                    </Tippy>
                </div>
            )}

            <nav className="sidebar-nav lgs-nav">
                <ul>
                    {allMenuItems.map((item) => {
                        const isMobileView = currentBreakpoint === 'mobile';
                        const showFullText = (!sidebarShouldBeCollapsed || isMobileView);
                        const itemAriaLabel = `${item.name}${item.badge ? `, 알림 ${item.badge}개` : ''}`;

                        return (
                            <li key={item.path} className={`${item.isSubItem ? 'sub-menu-item-li' : ''} ${(sidebarShouldBeCollapsed && !isMobileView) ? 'li-collapsed' : ''}`}>
                                <Tippy
                                    content={item.name}
                                    placement="right"
                                    theme="custom-glass"
                                    animation="perspective"
                                    delay={[350, 0]}
                                    disabled={showFullText}
                                >
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) => `menu-item-link ${isActive ? 'active' : ''} ${item.isSubItem ? 'sub-menu-item-link' : ''} ${(sidebarShouldBeCollapsed && !isMobileView) ? 'link-collapsed' : ''}`}
                                        onClick={handleLinkClick}
                                        aria-label={itemAriaLabel}
                                    >
                                        <span className="menu-icon-wrapper">{item.icon}</span>
                                        {showFullText && <span className="menu-item-name">{item.name}</span>}
                                        {showFullText && item.badge && (
                                            <span className="notification-badge" aria-label={`알림 ${item.badge}개`}>{item.badge}</span>
                                        )}
                                    </NavLink>
                                </Tippy>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
};
export default GlassSidebar;