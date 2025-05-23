client
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── prompt.md
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── tsconfig.tsbuildinfo
├── vite.config.ts
├── dist-types
│   ├── vite.config.d.ts
│   └── src
│       ├── App.d.ts
│       └── main.d.ts
├── public
│   └── (static assets, e.g., vite.svg)
└── src
    ├── App.css
    ├── App.tsx
    ├── index.css
    ├── main.tsx
    ├── vite-env.d.ts
    ├── assets
    │   └── (image/font files etc.)
    ├── components
    │   ├── common
    │   │   └── popover
    │   │       ├── GlassPopover.tsx
    │   │       ├── GlassPopover.css
    │   │       └── MenuContent
    │   │           └── ProfileMenuContent.tsx
    │   └── rootlayout
    │       ├── BackgroundBlobs.tsx
    │       ├── BackgroundBlobs.css
    │       ├── GlassNavbar.tsx
    │       ├── GlassNavbar.css
    │       ├── GlassSidebar.tsx
    │       ├── GlassSidebar.css
    │       ├── GlassSidebarRight.tsx
    │       └── GlassSidebarRight.css
    ├── pages
    │   ├── ActivityPage.tsx
    │   ├── DashboardPage.tsx
    │   ├── LibrariesPage.tsx
    │   ├── PerformanceCasesPage.tsx
    │   ├── SavedPage.tsx
    │   ├── StatisticPage.tsx
    │   └── TasksPage.tsx
    └── stores
        └── uiStore.ts

##파일구조

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

    let isVisible = true;
    let isActuallyExpanded = false;

    if (currentBreakpoint === 'mobile') {
        isVisible = mobileSidebarType === 'right';
        isActuallyExpanded = true; // 모바일에선 열리면 항상 확장된 형태로 간주
    } else {
        isVisible = true;
        isActuallyExpanded = isRightSidebarExpanded;
    }

    const tooltipContent = isActuallyExpanded ? "설정 패널 축소" : "설정 패널 확장";
    if (!isVisible) return null;

    return (
        <aside className={`glass-sidebar-right
            ${isActuallyExpanded ? 'expanded' : ''}
            ${currentBreakpoint === 'mobile' ? 'mobile-sidebar right-mobile-sidebar' : ''}
            ${isVisible && currentBreakpoint === 'mobile' ? 'open' : ''}
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

            {(currentBreakpoint === 'mobile' || isActuallyExpanded) && (
                <div className="expanded-content-area rgs-content">
                    <ExpandedSidebarContent />
                </div>
            )}
        </aside>
    );
};
export default GlassSidebarRight;

// filepath: c:\Users\nicew\Desktop\fullstack\monorepo\client\src\components\rootlayout\GlassSidebarRight.css
/* client/src/components/rootlayout/GlassSidebarRight.css */
.glass-sidebar-right {
    width: var(--sidebar-right-width);
    height: 100%;
    padding: 15px 0;
    box-sizing: border-box;
    background: var(--sidebar-glass-bg);
    backdrop-filter: var(--glass-blur-effect);
    -webkit-backdrop-filter: var(--glass-blur-effect);
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 90;
    flex-shrink: 0;
    transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1), padding 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
}

.glass-sidebar-right.expanded {
    width: var(--sidebar-right-expanded-width);
    align-items: flex-start;
    padding: 15px;
}

.sidebar-right-nav.rgs-nav {
    width: 100%;
    display: flex;
    flex-shrink: 0;
    box-sizing: border-box;
}

.glass-sidebar-right:not(.expanded) .sidebar-right-nav.rgs-nav {
    justify-content: center;
    padding: 0 5px;
}

.glass-sidebar-right.expanded .sidebar-right-nav.rgs-nav {
    justify-content: flex-start;
    margin-bottom: 18px;
}

.sidebar-right-button-container {
    display: flex;
    justify-content: center;
    align-items: center;
}

.settings-toggle-button {
    background: transparent;
    border: none;
    color: var(--icon-color);
    cursor: pointer;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 8px;
    transition: background-color 0.15s ease-out, color 0.15s ease-out;
    outline: none;
}

.settings-toggle-button:hover {
    background-color: var(--menu-item-hover-bg);
    color: var(--icon-active-color);
}

.settings-toggle-button:focus-visible {
    box-shadow: 0 0 0 2px rgba(var(--accent-color-rgb), 0.5);
}

.expanded-content-area.rgs-content {
    flex-grow: 1;
    width: 100%;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.12) transparent;
    opacity: 0;
    transform: translateY(8px);
    animation: fadeInContentRight 0.3s 0.05s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.glass-sidebar-right:not(.expanded) .expanded-content-area.rgs-content {
    display: none;
}

@keyframes fadeInContentRight {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.expanded-content-area.rgs-content::-webkit-scrollbar {
    width: 6px;
}

.expanded-content-area.rgs-content::-webkit-scrollbar-track {
    background: transparent;
}

.expanded-content-area.rgs-content::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 3px;
}

.expanded-content-area.rgs-content::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.25);
}

.sidebar-right-content-placeholder {
    color: var(--text-secondary);
}

.sidebar-right-content-placeholder .content-title {
    color: var(--text-primary);
    margin-top: 0;
    margin-bottom: 12px;
    font-size: 1.05em;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
}

.sidebar-right-content-placeholder .content-description {
    font-size: 0.88em;
    line-height: 1.5;
    margin-bottom: 20px;
    color: var(--text-placeholder);
}

.setting-item {
    display: flex;
    align-items: center;
    padding: 10px 6px;
    font-size: 0.92em;
    cursor: pointer;
    border-radius: 6px;
    transition: background-color 0.15s ease-out, color 0.15s ease-out;
    margin-bottom: 4px;
    color: var(--text-secondary);
}

.setting-item:hover {
    background-color: var(--menu-item-hover-bg);
    color: var(--text-primary);
}

.setting-item-icon {
    margin-right: 12px;
    color: var(--icon-color);
    display: inline-flex;
    align-items: center;
}

.setting-item:hover .setting-item-icon {
    color: var(--icon-active-color);
}

.mobile-sidebar.right-mobile-sidebar {
    background: var(--mobile-sidebar-glass-bg);
    backdrop-filter: var(--glass-blur-effect);
    -webkit-backdrop-filter: var(--glass-blur-effect);
    width: var(--mobile-sidebar-width-ratio);
    max-width: var(--mobile-sidebar-max-width);
    border-top-left-radius: 16px;
    border-bottom-left-radius: 16px;
    padding: 20px;
}

@media (max-width: 768px) {
    .glass-sidebar-right.mobile-sidebar .sidebar-header.rgs-mobile-header {
        width: 100%;
        margin-bottom: 15px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        min-height: 40px;
    }

    .sidebar-close-button.mobile-only.rgs-close-btn {
        display: flex;
    }

    .glass-sidebar-right.mobile-sidebar .sidebar-right-nav.rgs-nav {
        display: none;
    }

    .glass-sidebar-right.mobile-sidebar .expanded-content-area.rgs-content {
        opacity: 1;
        transform: none;
        animation: none;
        padding-top: 0;
    }
}

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
    { path: '/tasks', name: '작업', icon: <TasksIcon />, badge: 5 },
    { path: '/libraries', name: '라이브러리', icon: <LibrariesIcon /> },
    { path: '/saved', name: '저장됨', icon: <SavedIcon /> },
];

const GlassSidebar: React.FC = () => {
    const { isLeftSidebarExpanded, mobileSidebarType, currentBreakpoint, toggleLeftSidebar, closeMobileSidebar } = useUIStore();

    let sidebarShouldBeCollapsed = false;
    let isVisible = true;

    if (currentBreakpoint === 'mobile') {
        isVisible = mobileSidebarType === 'left';
        sidebarShouldBeCollapsed = false; // 모바일에서는 항상 확장된 형태로 표시
    } else if (currentBreakpoint === 'tablet') {
        isVisible = true;
        sidebarShouldBeCollapsed = !isLeftSidebarExpanded;
    } else { // desktop
        isVisible = true;
        sidebarShouldBeCollapsed = !isLeftSidebarExpanded;
    }

    const handleLinkClick = () => {
        if (currentBreakpoint === 'mobile') {
            closeMobileSidebar();
        }
    };

    if (!isVisible) return null;

    return (
        <aside className={`glass-sidebar
            ${sidebarShouldBeCollapsed ? 'collapsed' : ''}
            ${currentBreakpoint === 'mobile' ? 'mobile-sidebar left-mobile-sidebar' : ''}
            ${isVisible && currentBreakpoint === 'mobile' ? 'open' : ''}
        `}>
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

// filepath: c:\Users\nicew\Desktop\fullstack\monorepo\client\src\components\rootlayout\GlassSidebar.css
/* client/src/components/rootlayout/GlassSidebar.css */
.glass-sidebar {
    width: var(--sidebar-width);
    height: 100%;
    padding: 15px 0;
    box-sizing: border-box;
    background: var(--sidebar-glass-bg);
    backdrop-filter: var(--glass-blur-effect);
    -webkit-backdrop-filter: var(--glass-blur-effect);
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 90;
    color: var(--text-secondary);
    font-weight: 500;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.12) transparent;
    transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
}

.glass-sidebar::-webkit-scrollbar {
    width: 6px;
}

.glass-sidebar::-webkit-scrollbar-track {
    background: transparent;
}

.glass-sidebar::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 3px;
}

.glass-sidebar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.25);
}

.sidebar-header.lgs-header {
    font-size: 11px;
    color: var(--text-placeholder);
    padding: 0 15px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    min-height: 32px;
}

.glass-sidebar:not(.collapsed):not(.mobile-sidebar) .sidebar-header.lgs-header {
    justify-content: center;
    margin-bottom: 18px;
}

.glass-sidebar.mobile-sidebar .sidebar-header.lgs-header {
    justify-content: space-between;
    margin-bottom: 15px;
}

.sidebar-header-text {
    font-weight: 600;
}

.glass-sidebar.collapsed .sidebar-header.lgs-header {
    justify-content: center;
    padding: 0 5px;
    min-height: 40px;
    margin-bottom: 10px;
}

.sidebar-collapsed-grip {
    color: var(--text-placeholder);
}

.tablet-toggle-button-wrapper {
    display: flex;
    justify-content: center;
    padding: 5px 0;
    margin-bottom: 10px;
}

.glass-sidebar:not(.collapsed) .tablet-toggle-button-wrapper {
    justify-content: flex-end;
    padding-right: 15px;
}

.sidebar-toggle-button.left-sidebar-toggle.tablet-control {
    position: static;
    display: flex;
    align-items: center;
    justify-content: center;
    width: auto;
    min-width: 44px;
    height: 36px;
    padding: 0 10px;
    border-radius: 7px;
    background-color: rgba(var(--accent-color-rgb), 0.08);
    color: var(--accent-color-darker);
    border: 1px solid rgba(var(--accent-color-rgb), 0.2);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transition: background-color 0.15s ease-out, box-shadow 0.15s ease-out;
    outline: none;
}

.sidebar-toggle-button.left-sidebar-toggle.tablet-control:hover {
    background-color: rgba(var(--accent-color-rgb), 0.15);
    box-shadow: 0 2px 5px rgba(var(--accent-color-rgb), 0.2);
}

.sidebar-toggle-button.left-sidebar-toggle.tablet-control:focus-visible {
    box-shadow: 0 0 0 2px rgba(var(--accent-color-rgb), 0.5);
}

.sidebar-nav.lgs-nav {
    flex-grow: 1;
    padding: 0 10px;
}

.sidebar-nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.sidebar-nav li {
    margin-bottom: 2px;
}

.menu-item-link {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 10px 12px;
    border-radius: 7px;
    text-decoration: none;
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.15s ease-out, color 0.15s ease-out, box-shadow 0.15s ease-out;
    position: relative;
    overflow: hidden;
    white-space: nowrap;
}

.menu-item-link:hover {
    background-color: var(--menu-item-hover-bg);
    color: var(--text-primary);
}

.menu-item-link.active {
    background-color: var(--menu-item-active-bg);
    color: var(--menu-item-active-text);
    font-weight: 600;
}

.menu-icon-wrapper {
    margin-right: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    color: var(--icon-color);
    transition: color 0.15s ease-out;
}

.menu-item-link:hover .menu-icon-wrapper,
.menu-item-link.active .menu-icon-wrapper {
    color: var(--icon-active-color);
}

.menu-item-name {
    flex-grow: 1;
    line-height: 1.35;
}

.sub-menu-item-link .menu-icon-wrapper {
    margin-left: 18px;
}

.notification-badge {
    background-color: var(--notification-badge-bg);
    color: var(--notification-badge-text);
    font-size: 10px;
    font-weight: bold;
    padding: 2.5px 6.5px;
    border-radius: 10px;
    margin-left: auto;
    line-height: 1;
    flex-shrink: 0;
}

.glass-sidebar.collapsed {
    width: var(--sidebar-collapsed-width);
    padding: 15px 0;
}

.glass-sidebar.collapsed .sidebar-nav.lgs-nav {
    padding: 0 5px;
}

.glass-sidebar.collapsed .menu-item-link {
    justify-content: center;
    padding: 12px 8px;
}

.glass-sidebar.collapsed .menu-icon-wrapper {
    margin-right: 0;
}

.glass-sidebar.collapsed .menu-item-name,
.glass-sidebar.collapsed .notification-badge {
    display: none;
}

.glass-sidebar.collapsed .sub-menu-item-link .menu-icon-wrapper {
    margin-left: 0;
}

.mobile-sidebar.left-mobile-sidebar {
    background: var(--mobile-sidebar-glass-bg);
    backdrop-filter: var(--glass-blur-effect);
    -webkit-backdrop-filter: var(--glass-blur-effect);
    width: var(--mobile-sidebar-width-ratio);
    max-width: var(--mobile-sidebar-max-width);
    border-top-right-radius: 16px;
    border-bottom-right-radius: 16px;
}

.sidebar-close-button.mobile-only {
    display: none;
    background: transparent;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition: background-color 0.15s ease-out;
}

.sidebar-close-button.mobile-only:hover {
    background-color: var(--menu-item-hover-bg);
}

@media (max-width: 768px) {
    .glass-sidebar.mobile-sidebar {
        width: var(--mobile-sidebar-width-ratio) !important;
        max-width: var(--mobile-sidebar-max-width) !important;
        padding: 20px 0;
        position: fixed !important;
        top: 0;
        left: 0;
        height: 100vh !important;
        z-index: 110;
        box-shadow: 0 8px 35px rgba(0, 0, 0, 0.28);
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 0, 0, 0.12) transparent;
        transform: translateX(-100%);
        opacity: 0;
        pointer-events: none;
        transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    .glass-sidebar.mobile-sidebar.open {
        transform: translateX(0);
        opacity: 1;
        pointer-events: auto;
    }

    .glass-sidebar.mobile-sidebar .sidebar-header.lgs-header {
        padding: 0 20px;
        min-height: 40px;
    }

    .glass-sidebar.mobile-sidebar .sidebar-header-text {
        font-size: 0.95em;
        color: var(--text-primary);
    }

    .glass-sidebar.mobile-sidebar .tablet-toggle-button-wrapper {
        display: none;
    }

    .glass-sidebar.mobile-sidebar .sidebar-nav.lgs-nav {
        padding: 0 15px;
    }

    .glass-sidebar.mobile-sidebar .menu-item-link {
        font-size: 14.5px;
        padding: 12px 15px;
    }

    .glass-sidebar.mobile-sidebar .menu-icon-wrapper {
        margin-right: 15px;
    }

    .glass-sidebar.mobile-sidebar .menu-item-name,
    .glass-sidebar.mobile-sidebar .notification-badge {
        display: inline-block;
    }

    .sidebar-close-button.mobile-only.lgs-close-btn {
        display: flex;
    }
}

// filepath: c:\Users\nicew\Desktop\fullstack\monorepo\client\src\components\rootlayout\GlassNavbar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import './GlassNavbar.css';
import { useUIStore } from '../../stores/uiStore';
import { LuLayoutDashboard, LuMenu, LuSettings2, LuUser } from 'react-icons/lu';
import Tippy from '@tippyjs/react';
import GlassPopover from '../common/popover/GlassPopover';
import ProfileMenuContent from '../common/popover/MenuContent/ProfileMenuContent';

const LogoIcon = () => <LuLayoutDashboard size={26} className="navbar-logo-icon" />;
const HamburgerIcon = () => <LuMenu size={22} />;
const SettingsIconMobile = () => <LuSettings2 size={20} />;
const ProfileIcon = () => <LuUser size={22} />;

const GlassNavbar: React.FC = () => {
    const {
        currentBreakpoint,
        toggleLeftSidebar,
        toggleRightSidebar,
        mobileSidebarType,
        closeMobileSidebar,
    } = useUIStore();

    const [isProfilePopoverOpen, setIsProfilePopoverOpen] = useState(false);
    const profileButtonRef = useRef<HTMLButtonElement>(null);

    const handleProfileButtonClick = () => {
        if (currentBreakpoint === 'mobile' && mobileSidebarType && !isProfilePopoverOpen) {
            closeMobileSidebar();
        }
        setIsProfilePopoverOpen(prev => !prev);
    };

    const handleCloseProfilePopover = () => {
        setIsProfilePopoverOpen(false);
    };

    useEffect(() => {
        if (isProfilePopoverOpen) {
            handleCloseProfilePopover();
        }
    }, [currentBreakpoint]);

    return (
        <nav className="glass-navbar">
            <div className="navbar-left">
                {currentBreakpoint === 'mobile' && (
                    <Tippy content="메뉴" placement="bottom-start" theme="custom-glass" animation="perspective" delay={[300, 0]}>
                        <button
                            className={`navbar-icon-button hamburger-button ${isProfilePopoverOpen && currentBreakpoint === 'mobile' ? '' : (mobileSidebarType === 'left' ? 'active' : '')}`}
                            onClick={toggleLeftSidebar}
                            aria-label="메인 메뉴"
                            aria-expanded={mobileSidebarType === 'left'}
                        >
                            <HamburgerIcon />
                        </button>
                    </Tippy>
                )}
                {(currentBreakpoint !== 'mobile' || !mobileSidebarType) && (
                    <Link to="/dashboard" className="navbar-logo-link" aria-label="대시보드로 이동">
                        <LogoIcon />
                    </Link>
                )}
            </div>

            <div className="navbar-right">
                {currentBreakpoint === 'mobile' && (
                    <Tippy content="설정" placement="bottom-end" theme="custom-glass" animation="perspective" delay={[300, 0]}>
                        <button
                            className={`navbar-icon-button settings-button-mobile ${isProfilePopoverOpen && currentBreakpoint === 'mobile' ? '' : (mobileSidebarType === 'right' ? 'active' : '')}`}
                            onClick={toggleRightSidebar}
                            aria-label="설정"
                            aria-expanded={mobileSidebarType === 'right'}
                        >
                            <SettingsIconMobile />
                        </button>
                    </Tippy>
                )}

                <button
                    ref={profileButtonRef}
                    className={`profile-button navbar-icon-button ${isProfilePopoverOpen ? 'active' : ''}`}
                    aria-label="프로필 메뉴 열기/닫기"
                    onClick={handleProfileButtonClick}
                    aria-expanded={isProfilePopoverOpen}
                >
                    <ProfileIcon />
                </button>

                <GlassPopover
                    isOpen={isProfilePopoverOpen}
                    onClose={handleCloseProfilePopover}
                    anchorEl={profileButtonRef.current}
                    placement="bottom-end"
                    offsetY={10}
                >
                    <ProfileMenuContent onClose={handleCloseProfilePopover} />
                </GlassPopover>
            </div>
        </nav>
    );
};

export default GlassNavbar;

// filepath: c:\Users\nicew\Desktop\fullstack\monorepo\client\src\components\rootlayout\GlassNavbar.css
/* client/src/components/rootlayout/GlassNavbar.css */
.glass-navbar {
    width: 100%;
    height: var(--navbar-height);
    padding: 0 13px;
    box-sizing: border-box;
    background: var(--navbar-glass-bg);
    backdrop-filter: var(--glass-blur-effect);
    -webkit-backdrop-filter: var(--glass-blur-effect);
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    z-index: 100;
    color: var(--text-primary);
}

.navbar-left,
.navbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-right: 0px;
}

.navbar-logo-link {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: var(--text-primary);
    padding: 5px;
    border-radius: 6px;
    transition: background-color 0.2s ease;
}

.navbar-logo-link:hover {
    background-color: var(--menu-item-hover-bg);
}

.navbar-logo-icon {
    color: var(--accent-color);
}

.navbar-icon-button {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    transition: background-color 0.2s ease-out, color 0.2s ease-out;
}

.navbar-icon-button:hover {
    background-color: var(--menu-item-hover-bg);
    color: var(--text-primary);
}

.navbar-icon-button.active {
    background-color: rgba(var(--accent-color-rgb), 0.1);
    color: var(--accent-color-darker);
}

.hamburger-button,
.settings-button-mobile {
    display: none;
}

.profile-button svg {
    color: var(--text-secondary);
}

.profile-button:hover svg {
    color: var(--text-primary);
}

@media (max-width: 1024px) and (min-width: 769px) {
    .glass-navbar {
        padding: 0 20px;
    }

    .profile-button {
        margin-left: auto;
    }
}

@media (max-width: 768px) {
    .glass-navbar {
        padding: 0 10px;
        height: var(--navbar-height-mobile);
    }

    .hamburger-button {
        display: flex;
    }

    .settings-button-mobile {
        display: flex;
    }

    .navbar-logo-link {
        margin-left: 6px;
    }

    .profile-button {
        display: flex;
    }
}

결과물은 항상 하나의 코드입력창에 작성해줘. 생략하지 말고 client의 모든 파일과 컴포넌트 구조를 텍스트로 작성해줄래? .tsx파일도 포함해서

첨부한 파일들도 텍스트로 작성해줘. 하나의 코드입력창에. 인수인계 때문에 그래.

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

    let isVisible = true;
    let isActuallyExpanded = false;

    if (currentBreakpoint === 'mobile') {
        isVisible = mobileSidebarType === 'right';
        isActuallyExpanded = true; // 모바일에선 열리면 항상 확장된 형태로 간주
    } else {
        isVisible = true;
        isActuallyExpanded = isRightSidebarExpanded;
    }

    const tooltipContent = isActuallyExpanded ? "설정 패널 축소" : "설정 패널 확장";
    if (!isVisible) return null;

    return (
        <aside className={`glass-sidebar-right
            ${isActuallyExpanded ? 'expanded' : ''}
            ${currentBreakpoint === 'mobile' ? 'mobile-sidebar right-mobile-sidebar' : ''}
            ${isVisible && currentBreakpoint === 'mobile' ? 'open' : ''}
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

            {(currentBreakpoint === 'mobile' || isActuallyExpanded) && (
                <div className="expanded-content-area rgs-content">
                    <ExpandedSidebarContent />
                </div>
            )}
        </aside>
    );
};
export default GlassSidebarRight;

// filepath: c:\Users\nicew\Desktop\fullstack\monorepo\client\src\components\rootlayout\GlassSidebarRight.css
/* client/src/components/rootlayout/GlassSidebarRight.css */
.glass-sidebar-right {
    width: var(--sidebar-right-width);
    height: 100%;
    padding: 15px 0;
    box-sizing: border-box;
    background: var(--sidebar-glass-bg);
    backdrop-filter: var(--glass-blur-effect);
    -webkit-backdrop-filter: var(--glass-blur-effect);
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 90;
    flex-shrink: 0;
    transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1), padding 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
}

.glass-sidebar-right.expanded {
    width: var(--sidebar-right-expanded-width);
    align-items: flex-start;
    padding: 15px;
}

.sidebar-right-nav.rgs-nav {
    width: 100%;
    display: flex;
    flex-shrink: 0;
    box-sizing: border-box;
}

.glass-sidebar-right:not(.expanded) .sidebar-right-nav.rgs-nav {
    justify-content: center;
    padding: 0 5px;
}

.glass-sidebar-right.expanded .sidebar-right-nav.rgs-nav {
    justify-content: flex-start;
    margin-bottom: 18px;
}

.sidebar-right-button-container {
    display: flex;
    justify-content: center;
    align-items: center;
}

.settings-toggle-button {
    background: transparent;
    border: none;
    color: var(--icon-color);
    cursor: pointer;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 8px;
    transition: background-color 0.15s ease-out, color 0.15s ease-out;
    outline: none;
}

.settings-toggle-button:hover {
    background-color: var(--menu-item-hover-bg);
    color: var(--icon-active-color);
}

.settings-toggle-button:focus-visible {
    box-shadow: 0 0 0 2px rgba(var(--accent-color-rgb), 0.5);
}

.expanded-content-area.rgs-content {
    flex-grow: 1;
    width: 100%;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.12) transparent;
    opacity: 0;
    transform: translateY(8px);
    animation: fadeInContentRight 0.3s 0.05s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.glass-sidebar-right:not(.expanded) .expanded-content-area.rgs-content {
    display: none;
}

@keyframes fadeInContentRight {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.expanded-content-area.rgs-content::-webkit-scrollbar {
    width: 6px;
}

.expanded-content-area.rgs-content::-webkit-scrollbar-track {
    background: transparent;
}

.expanded-content-area.rgs-content::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 3px;
}

.expanded-content-area.rgs-content::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.25);
}

.sidebar-right-content-placeholder {
    color: var(--text-secondary);
}

.sidebar-right-content-placeholder .content-title {
    color: var(--text-primary);
    margin-top: 0;
    margin-bottom: 12px;
    font-size: 1.05em;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
}

.sidebar-right-content-placeholder .content-description {
    font-size: 0.88em;
    line-height: 1.5;
    margin-bottom: 20px;
    color: var(--text-placeholder);
}

.setting-item {
    display: flex;
    align-items: center;
    padding: 10px 6px;
    font-size: 0.92em;
    cursor: pointer;
    border-radius: 6px;
    transition: background-color 0.15s ease-out, color 0.15s ease-out;
    margin-bottom: 4px;
    color: var(--text-secondary);
}

.setting-item:hover {
    background-color: var(--menu-item-hover-bg);
    color: var(--text-primary);
}

.setting-item-icon {
    margin-right: 12px;
    color: var(--icon-color);
    display: inline-flex;
    align-items: center;
}

.setting-item:hover .setting-item-icon {
    color: var(--icon-active-color);
}

.mobile-sidebar.right-mobile-sidebar {
    background: var(--mobile-sidebar-glass-bg);
    backdrop-filter: var(--glass-blur-effect);
    -webkit-backdrop-filter: var(--glass-blur-effect);
    width: var(--mobile-sidebar-width-ratio);
    max-width: var(--mobile-sidebar-max-width);
    border-top-left-radius: 16px;
    border-bottom-left-radius: 16px;
    padding: 20px;
}

@media (max-width: 768px) {
    .glass-sidebar-right.mobile-sidebar .sidebar-header.rgs-mobile-header {
        width: 100%;
        margin-bottom: 15px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        min-height: 40px;
    }

    .sidebar-close-button.mobile-only.rgs-close-btn {
        display: flex;
    }

    .glass-sidebar-right.mobile-sidebar .sidebar-right-nav.rgs-nav {
        display: none;
    }

    .glass-sidebar-right.mobile-sidebar .expanded-content-area.rgs-content {
        opacity: 1;
        transform: none;
        animation: none;
        padding-top: 0;
    }
}

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
    { path: '/tasks', name: '작업', icon: <TasksIcon />, badge: 5 },
    { path: '/libraries', name: '라이브러리', icon: <LibrariesIcon /> },
    { path: '/saved', name: '저장됨', icon: <SavedIcon /> },
];

const GlassSidebar: React.FC = () => {
    const { isLeftSidebarExpanded, mobileSidebarType, currentBreakpoint, toggleLeftSidebar, closeMobileSidebar } = useUIStore();

    let sidebarShouldBeCollapsed = false;
    let isVisible = true;

    if (currentBreakpoint === 'mobile') {
        isVisible = mobileSidebarType === 'left';
        sidebarShouldBeCollapsed = false; // 모바일에서는 항상 확장된 형태로 표시
    } else if (currentBreakpoint === 'tablet') {
        isVisible = true;
        sidebarShouldBeCollapsed = !isLeftSidebarExpanded;
    } else { // desktop
        isVisible = true;
        sidebarShouldBeCollapsed = !isLeftSidebarExpanded;
    }

    const handleLinkClick = () => {
        if (currentBreakpoint === 'mobile') {
            closeMobileSidebar();
        }
    };

    if (!isVisible) return null;

    return (
        <aside className={`glass-sidebar
            ${sidebarShouldBeCollapsed ? 'collapsed' : ''}
            ${currentBreakpoint === 'mobile' ? 'mobile-sidebar left-mobile-sidebar' : ''}
            ${isVisible && currentBreakpoint === 'mobile' ? 'open' : ''}
        `}>
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

// filepath: c:\Users\nicew\Desktop\fullstack\monorepo\client\src\components\rootlayout\GlassSidebar.css
/* client/src/components/rootlayout/GlassSidebar.css */
.glass-sidebar {
    width: var(--sidebar-width);
    height: 100%;
    padding: 15px 0;
    box-sizing: border-box;
    background: var(--sidebar-glass-bg);
    backdrop-filter: var(--glass-blur-effect);
    -webkit-backdrop-filter: var(--glass-blur-effect);
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 90;
    color: var(--text-secondary);
    font-weight: 500;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.12) transparent;
    transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
}

.glass-sidebar::-webkit-scrollbar {
    width: 6px;
}

.glass-sidebar::-webkit-scrollbar-track {
    background: transparent;
}

.glass-sidebar::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 3px;
}

.glass-sidebar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.25);
}

.sidebar-header.lgs-header {
    font-size: 11px;
    color: var(--text-placeholder);
    padding: 0 15px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    min-height: 32px;
}

.glass-sidebar:not(.collapsed):not(.mobile-sidebar) .sidebar-header.lgs-header {
    justify-content: center;
    margin-bottom: 18px;
}

.glass-sidebar.mobile-sidebar .sidebar-header.lgs-header {
    justify-content: space-between;
    margin-bottom: 15px;
}

.sidebar-header-text {
    font-weight: 600;
}

.glass-sidebar.collapsed .sidebar-header.lgs-header {
    justify-content: center;
    padding: 0 5px;
    min-height: 40px;
    margin-bottom: 10px;
}

.sidebar-collapsed-grip {
    color: var(--text-placeholder);
}

.tablet-toggle-button-wrapper {
    display: flex;
    justify-content: center;
    padding: 5px 0;
    margin-bottom: 10px;
}

.glass-sidebar:not(.collapsed) .tablet-toggle-button-wrapper {
    justify-content: flex-end;
    padding-right: 15px;
}

.sidebar-toggle-button.left-sidebar-toggle.tablet-control {
    position: static;
    display: flex;
    align-items: center;
    justify-content: center;
    width: auto;
    min-width: 44px;
    height: 36px;
    padding: 0 10px;
    border-radius: 7px;
    background-color: rgba(var(--accent-color-rgb), 0.08);
    color: var(--accent-color-darker);
    border: 1px solid rgba(var(--accent-color-rgb), 0.2);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transition: background-color 0.15s ease-out, box-shadow 0.15s ease-out;
    outline: none;
}

.sidebar-toggle-button.left-sidebar-toggle.tablet-control:hover {
    background-color: rgba(var(--accent-color-rgb), 0.15);
    box-shadow: 0 2px 5px rgba(var(--accent-color-rgb), 0.2);
}

.sidebar-toggle-button.left-sidebar-toggle.tablet-control:focus-visible {
    box-shadow: 0 0 0 2px rgba(var(--accent-color-rgb), 0.5);
}

.sidebar-nav.lgs-nav {
    flex-grow: 1;
    padding: 0 10px;
}

.sidebar-nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.sidebar-nav li {
    margin-bottom: 2px;
}

.menu-item-link {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 10px 12px;
    border-radius: 7px;
    text-decoration: none;
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.15s ease-out, color 0.15s ease-out, box-shadow 0.15s ease-out;
    position: relative;
    overflow: hidden;
    white-space: nowrap;
}

.menu-item-link:hover {
    background-color: var(--menu-item-hover-bg);
    color: var(--text-primary);
}

.menu-item-link.active {
    background-color: var(--menu-item-active-bg);
    color: var(--menu-item-active-text);
    font-weight: 600;
}

.menu-icon-wrapper {
    margin-right: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    color: var(--icon-color);
    transition: color 0.15s ease-out;
}

.menu-item-link:hover .menu-icon-wrapper,
.menu-item-link.active .menu-icon-wrapper {
    color: var(--icon-active-color);
}

.menu-item-name {
    flex-grow: 1;
    line-height: 1.35;
}

.sub-menu-item-link .menu-icon-wrapper {
    margin-left: 18px;
}

.notification-badge {
    background-color: var(--notification-badge-bg);
    color: var(--notification-badge-text);
    font-size: 10px;
    font-weight: bold;
    padding: 2.5px 6.5px;
    border-radius: 10px;
    margin-left: auto;
    line-height: 1;
    flex-shrink: 0;
}

.glass-sidebar.collapsed {
    width: var(--sidebar-collapsed-width);
    padding: 15px 0;
}

.glass-sidebar.collapsed .sidebar-nav.lgs-nav {
    padding: 0 5px;
}

.glass-sidebar.collapsed .menu-item-link {
    justify-content: center;
    padding: 12px 8px;
}

.glass-sidebar.collapsed .menu-icon-wrapper {
    margin-right: 0;
}

.glass-sidebar.collapsed .menu-item-name,
.glass-sidebar.collapsed .notification-badge {
    display: none;
}

.glass-sidebar.collapsed .sub-menu-item-link .menu-icon-wrapper {
    margin-left: 0;
}

.mobile-sidebar.left-mobile-sidebar {
    background: var(--mobile-sidebar-glass-bg);
    backdrop-filter: var(--glass-blur-effect);
    -webkit-backdrop-filter: var(--glass-blur-effect);
    width: var(--mobile-sidebar-width-ratio);
    max-width: var(--mobile-sidebar-max-width);
    border-top-right-radius: 16px;
    border-bottom-right-radius: 16px;
}

.sidebar-close-button.mobile-only {
    display: none;
    background: transparent;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition: background-color 0.15s ease-out;
}

.sidebar-close-button.mobile-only:hover {
    background-color: var(--menu-item-hover-bg);
}

@media (max-width: 768px) {
    .glass-sidebar.mobile-sidebar {
        width: var(--mobile-sidebar-width-ratio) !important;
        max-width: var(--mobile-sidebar-max-width) !important;
        padding: 20px 0;
        position: fixed !important;
        top: 0;
        left: 0;
        height: 100vh !important;
        z-index: 110;
        box-shadow: 0 8px 35px rgba(0, 0, 0, 0.28);
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 0, 0, 0.12) transparent;
        transform: translateX(-100%);
        opacity: 0;
        pointer-events: none;
        transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    .glass-sidebar.mobile-sidebar.open {
        transform: translateX(0);
        opacity: 1;
        pointer-events: auto;
    }

    .glass-sidebar.mobile-sidebar .sidebar-header.lgs-header {
        padding: 0 20px;
        min-height: 40px;
    }

    .glass-sidebar.mobile-sidebar .sidebar-header-text {
        font-size: 0.95em;
        color: var(--text-primary);
    }

    .glass-sidebar.mobile-sidebar .tablet-toggle-button-wrapper {
        display: none;
    }

    .glass-sidebar.mobile-sidebar .sidebar-nav.lgs-nav {
        padding: 0 15px;
    }

    .glass-sidebar.mobile-sidebar .menu-item-link {
        font-size: 14.5px;
        padding: 12px 15px;
    }

    .glass-sidebar.mobile-sidebar .menu-icon-wrapper {
        margin-right: 15px;
    }

    .glass-sidebar.mobile-sidebar .menu-item-name,
    .glass-sidebar.mobile-sidebar .notification-badge {
        display: inline-block;
    }

    .sidebar-close-button.mobile-only.lgs-close-btn {
        display: flex;
    }
}

// filepath: c:\Users\nicew\Desktop\fullstack\monorepo\client\src\components\rootlayout\GlassNavbar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import './GlassNavbar.css';
import { useUIStore } from '../../stores/uiStore';
import { LuLayoutDashboard, LuMenu, LuSettings2, LuUser } from 'react-icons/lu';
import Tippy from '@tippyjs/react';
import GlassPopover from '../common/popover/GlassPopover';
import ProfileMenuContent from '../common/popover/MenuContent/ProfileMenuContent';

const LogoIcon = () => <LuLayoutDashboard size={26} className="navbar-logo-icon" />;
const HamburgerIcon = () => <LuMenu size={22} />;
const SettingsIconMobile = () => <LuSettings2 size={20} />;
const ProfileIcon = () => <LuUser size={22} />;

const GlassNavbar: React.FC = () => {
    const {
        currentBreakpoint,
        toggleLeftSidebar,
        toggleRightSidebar,
        mobileSidebarType,
        closeMobileSidebar,
    } = useUIStore();

    const [isProfilePopoverOpen, setIsProfilePopoverOpen] = useState(false);
    const profileButtonRef = useRef<HTMLButtonElement>(null);

    const handleProfileButtonClick = () => {
        if (currentBreakpoint === 'mobile' && mobileSidebarType && !isProfilePopoverOpen) {
            closeMobileSidebar();
        }
        setIsProfilePopoverOpen(prev => !prev);
    };

    const handleCloseProfilePopover = () => {
        setIsProfilePopoverOpen(false);
    };

    useEffect(() => {
        if (isProfilePopoverOpen) {
            handleCloseProfilePopover();
        }
    }, [currentBreakpoint]);

    return (
        <nav className="glass-navbar">
            <div className="navbar-left">
                {currentBreakpoint === 'mobile' && (
                    <Tippy content="메뉴" placement="bottom-start" theme="custom-glass" animation="perspective" delay={[300, 0]}>
                        <button
                            className={`navbar-icon-button hamburger-button ${isProfilePopoverOpen && currentBreakpoint === 'mobile' ? '' : (mobileSidebarType === 'left' ? 'active' : '')}`}
                            onClick={toggleLeftSidebar}
                            aria-label="메인 메뉴"
                            aria-expanded={mobileSidebarType === 'left'}
                        >
                            <HamburgerIcon />
                        </button>
                    </Tippy>
                )}
                {(currentBreakpoint !== 'mobile' || !mobileSidebarType) && (
                    <Link to="/dashboard" className="navbar-logo-link" aria-label="대시보드로 이동">
                        <LogoIcon />
                    </Link>
                )}
            </div>

            <div className="navbar-right">
                {currentBreakpoint === 'mobile' && (
                    <Tippy content="설정" placement="bottom-end" theme="custom-glass" animation="perspective" delay={[300, 0]}>
                        <button
                            className={`navbar-icon-button settings-button-mobile ${isProfilePopoverOpen && currentBreakpoint === 'mobile' ? '' : (mobileSidebarType === 'right' ? 'active' : '')}`}
                            onClick={toggleRightSidebar}
                            aria-label="설정"
                            aria-expanded={mobileSidebarType === 'right'}
                        >
                            <SettingsIconMobile />
                        </button>
                    </Tippy>
                )}

                <button
                    ref={profileButtonRef}
                    className={`profile-button navbar-icon-button ${isProfilePopoverOpen ? 'active' : ''}`}
                    aria-label="프로필 메뉴 열기/닫기"
                    onClick={handleProfileButtonClick}
                    aria-expanded={isProfilePopoverOpen}
                >
                    <ProfileIcon />
                </button>

                <GlassPopover
                    isOpen={isProfilePopoverOpen}
                    onClose={handleCloseProfilePopover}
                    anchorEl={profileButtonRef.current}
                    placement="bottom-end"
                    offsetY={10}
                >
                    <ProfileMenuContent onClose={handleCloseProfilePopover} />
                </GlassPopover>
            </div>
        </nav>
    );
};

export default GlassNavbar;

// filepath: c:\Users\nicew\Desktop\fullstack\monorepo\client\src\components\rootlayout\GlassNavbar.css
/* client/src/components/rootlayout/GlassNavbar.css */
.glass-navbar {
    width: 100%;
    height: var(--navbar-height);
    padding: 0 13px;
    box-sizing: border-box;
    background: var(--navbar-glass-bg);
    backdrop-filter: var(--glass-blur-effect);
    -webkit-backdrop-filter: var(--glass-blur-effect);
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    z-index: 100;
    color: var(--text-primary);
}

.navbar-left,
.navbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-right: 0px;
}

.navbar-logo-link {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: var(--text-primary);
    padding: 5px;
    border-radius: 6px;
    transition: background-color 0.2s ease;
}

.navbar-logo-link:hover {
    background-color: var(--menu-item-hover-bg);
}

.navbar-logo-icon {
    color: var(--accent-color);
}

.navbar-icon-button {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    transition: background-color 0.2s ease-out, color 0.2s ease-out;
}

.navbar-icon-button:hover {
    background-color: var(--menu-item-hover-bg);
    color: var(--text-primary);
}

.navbar-icon-button.active {
    background-color: rgba(var(--accent-color-rgb), 0.1);
    color: var(--accent-color-darker);
}

.hamburger-button,
.settings-button-mobile {
    display: none;
}

.profile-button svg {
    color: var(--text-secondary);
}

.profile-button:hover svg {
    color: var(--text-primary);
}

@media (max-width: 1024px) and (min-width: 769px) {
    .glass-navbar {
        padding: 0 20px;
    }

    .profile-button {
        margin-left: auto;
    }
}

@media (max-width: 768px) {
    .glass-navbar {
        padding: 0 10px;
        height: var(--navbar-height-mobile);
    }

    .hamburger-button {
        display: flex;
    }

    .settings-button-mobile {
        display: flex;
    }

    .navbar-logo-link {
        margin-left: 6px;
    }

    .profile-button {
        display: flex;
    }
}

// filepath: c:\Users\nicew\Desktop\fullstack\monorepo\client\src\stores\uiStore.ts
import { create } from 'zustand';

const breakpoints = {
    mobile: 768, // 모바일 화면 너비 기준 (이하)
    tablet: 1024, // 태블릿 화면 너비 기준 (이하, 모바일 초과)
};

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

const getCurrentBreakpoint = (): Breakpoint => {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width < breakpoints.mobile) return 'mobile';
    if (width < breakpoints.tablet) return 'tablet';
    return 'desktop';
};

interface UIState {
    isRightSidebarExpanded: boolean;
    toggleRightSidebar: () => void;
    setRightSidebarExpanded: (expanded: boolean) => void;
    isLeftSidebarExpanded: boolean;
    toggleLeftSidebar: () => void;
    setLeftSidebarExpanded: (expanded: boolean) => void;
    mobileSidebarType: 'left' | 'right' | null;
    openMobileSidebar: (type: 'left' | 'right') => void;
    closeMobileSidebar: () => void;
    currentBreakpoint: Breakpoint;
    updateBreakpoint: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
    isRightSidebarExpanded: false,
    toggleRightSidebar: () => {
        const currentBp = get().currentBreakpoint;
        if (currentBp === 'mobile') {
            if (get().mobileSidebarType === 'right') {
                get().closeMobileSidebar();
            } else {
                get().openMobileSidebar('right');
            }
        } else {
            set((state) => ({ isRightSidebarExpanded: !state.isRightSidebarExpanded }));
        }
    },
    setRightSidebarExpanded: (expanded) => set({ isRightSidebarExpanded: expanded }),
    isLeftSidebarExpanded: true,
    toggleLeftSidebar: () => {
        const currentBp = get().currentBreakpoint;
        if (currentBp === 'mobile') {
            if (get().mobileSidebarType === 'left') {
                get().closeMobileSidebar();
            } else {
                get().openMobileSidebar('left');
            }
        } else {
            set((state) => ({ isLeftSidebarExpanded: !state.isLeftSidebarExpanded }));
        }
    },
    setLeftSidebarExpanded: (expanded) => set({ isLeftSidebarExpanded: expanded }),
    mobileSidebarType: null,
    openMobileSidebar: (type) => {
        set({ mobileSidebarType: type });
    },
    closeMobileSidebar: () => set({ mobileSidebarType: null }),
    currentBreakpoint: getCurrentBreakpoint(),
    updateBreakpoint: () => {
        const newBreakpoint = getCurrentBreakpoint();
        const oldBreakpoint = get().currentBreakpoint;
        if (newBreakpoint !== oldBreakpoint) {
            set({ currentBreakpoint: newBreakpoint });
            get().closeMobileSidebar();
            if (newBreakpoint === 'desktop') {
                get().setLeftSidebarExpanded(true);
            } else if (newBreakpoint === 'tablet') {
                get().setLeftSidebarExpanded(false);
            }
        }
    },
}));

if (typeof window !== 'undefined') {
    const { updateBreakpoint, setLeftSidebarExpanded, currentBreakpoint } = useUIStore.getState();
    window.addEventListener('resize', updateBreakpoint);
    const initialBp = currentBreakpoint;
    if (initialBp === 'desktop') {
        setLeftSidebarExpanded(true);
    } else {
        setLeftSidebarExpanded(false);
    }
    useUIStore.getState().updateBreakpoint();
}

// filepath: c:\Users\nicew\Desktop\fullstack\monorepo\client\src\main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router';
import App from './App.tsx'
import './index.css'
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/perspective.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

// filepath: c:\Users\nicew\Desktop\fullstack\monorepo\client\src\index.css
:root {
  --base-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  --app-bg-color: #fdfcfa;
  --text-primary: #2c3e50;
  --text-secondary: #576574;
  --text-placeholder: #a5b1c2;
  --text-on-accent: #ffffff;
  --accent-color: #e67e22;
  --accent-color-rgb: 230, 126, 34;
  --accent-color-darker: #d35400;
  --glass-base-bg-rgb: 255, 253, 250;
  --glass-bg-opacity-navbar: 0.5;
  --glass-bg-opacity-sidebar: 0.5;
  --glass-bg-opacity-mobile-sidebar: 0.90;
  --glass-blur-effect: blur(10px) saturate(150%);
  --navbar-glass-bg: rgba(var(--glass-base-bg-rgb), var(--glass-bg-opacity-navbar));
  --sidebar-glass-bg: rgba(var(--glass-base-bg-rgb), var(--glass-bg-opacity-sidebar));
  --mobile-sidebar-glass-bg: rgba(var(--glass-base-bg-rgb), var(--glass-bg-opacity-mobile-sidebar));
  --navbar-height: 45px;
  --navbar-height-mobile: 45px;
  --sidebar-width: 210px;
  --sidebar-collapsed-width: 65px;
  --sidebar-right-width: 60px;
  --sidebar-right-expanded-width: 250px;
  --mobile-sidebar-width-ratio: 78vw;
  --mobile-sidebar-max-width: 330px;
  --main-content-border-radius: 18px;
  --main-content-bg-color: #fffdf9;
  --menu-item-hover-bg: rgba(0, 0, 0, 0.04);
  --menu-item-active-bg: rgba(var(--accent-color-rgb), 0.12);
  --menu-item-active-text: var(--accent-color-darker);
  --icon-color: var(--text-secondary);
  --icon-active-color: var(--accent-color-darker);
  --notification-badge-bg: #e74c3c;
  --notification-badge-text: white;
  --tooltip-bg-rgb: 35, 35, 45;
  --tooltip-bg-opacity: 0.96;
  --tooltip-text-color: #e8e8e8;
  --tooltip-border-radius: 6px;
  --tooltip-padding: 8px 12px;
  --tooltip-font-size: 12px;
  --tooltip-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  --tooltip-arrow-size: 7px;
  --tooltip-backdrop-blur: 4px;
  --mobile-overlay-bg-rgb: 255, 255, 255;
  --mobile-overlay-bg-opacity: 0.25;
  --mobile-overlay-blur: 2.5px;
}

body {
  margin: 0;
  font-family: var(--base-font-family);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--app-bg-color);
  color: var(--text-primary);
  overflow: hidden;
  line-height: 1.5;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

.tippy-box[data-theme~='custom-glass'] {
  font-family: var(--base-font-family);
  font-size: var(--tooltip-font-size);
  font-weight: 500;
  line-height: 1.4;
  background-color: rgba(var(--tooltip-bg-rgb), var(--tooltip-bg-opacity));
  color: var(--tooltip-text-color);
  border-radius: var(--tooltip-border-radius);
  padding: var(--tooltip-padding);
  box-shadow: var(--tooltip-shadow);
  backdrop-filter: blur(var(--tooltip-backdrop-blur)) saturate(110%);
  -webkit-backdrop-filter: blur(var(--tooltip-backdrop-blur)) saturate(110%);
}

.tippy-box[data-theme~='custom-glass'] .tippy-arrow {
  color: rgba(var(--tooltip-bg-rgb), var(--tooltip-bg-opacity));
  width: calc(var(--tooltip-arrow-size) * 2);
  height: calc(var(--tooltip-arrow-size) * 2);
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.18);
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.28);
}

* {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.18) rgba(0, 0, 0, 0.03);
}

// filepath: c:\Users\nicew\Desktop\fullstack\monorepo\client\src\App.tsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import BackgroundBlobs from './components/rootlayout/BackgroundBlobs';
import GlassNavbar from './components/rootlayout/GlassNavbar';
import GlassSidebar from './components/rootlayout/GlassSidebar';
import GlassSidebarRight from './components/rootlayout/GlassSidebarRight';
import { useUIStore } from './stores/uiStore';
import DashboardPage from './pages/DashboardPage';
import ActivityPage from './pages/ActivityPage';
import StatisticPage from './pages/StatisticPage';
import PerformanceCasesPage from './pages/PerformanceCasesPage';
import TasksPage from './pages/TasksPage';
import LibrariesPage from './pages/LibrariesPage';
import SavedPage from './pages/SavedPage';
import './App.css';

function App() {
  const {
    currentBreakpoint,
    mobileSidebarType,
    closeMobileSidebar,
    setLeftSidebarExpanded,
  } = useUIStore();

  useEffect(() => {
    if (currentBreakpoint === 'desktop') {
      setLeftSidebarExpanded(true);
    } else {
      setLeftSidebarExpanded(false);
    }
  }, [currentBreakpoint, setLeftSidebarExpanded]);

  useEffect(() => {
    if (currentBreakpoint === 'mobile' && mobileSidebarType) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [currentBreakpoint, mobileSidebarType]);

  const showOverlay = currentBreakpoint === 'mobile' && mobileSidebarType !== null;

  return (
    <div className={`app-container ${currentBreakpoint}-layout ${showOverlay ? 'mobile-sidebar-active' : ''}`}>
      <div className="background-blobs-wrapper">
        <BackgroundBlobs />
      </div>
      {showOverlay && (
        <div
          className={`clickable-overlay ${showOverlay ? 'open' : ''}`}
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}
      {currentBreakpoint === 'mobile' && mobileSidebarType === 'left' && <GlassSidebar />}
      {currentBreakpoint === 'mobile' && mobileSidebarType === 'right' && <GlassSidebarRight />}
      <div className="layout-main-wrapper">
        <GlassNavbar />
        <div className="content-body-wrapper">
          {currentBreakpoint !== 'mobile' && <GlassSidebar />}
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard/activity" element={<ActivityPage />} />
              <Route path="/dashboard/statistic" element={<StatisticPage />} />
              <Route path="/dashboard/performance-cases" element={<PerformanceCasesPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/libraries" element={<LibrariesPage />} />
              <Route path="/saved" element={<SavedPage />} />
              <Route path="*" element={<div style={{ padding: '50px', textAlign: 'center' }}><h1>404 - 페이지를 찾을 수 없습니다.</h1></div>} />
            </Routes>
          </main>
          {currentBreakpoint !== 'mobile' && <GlassSidebarRight />}
        </div>
      </div>
    </div>
  );
}

export default App;

// filepath: c:\Users\nicew\Desktop\fullstack\monorepo\client\src\App.css
.app-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.background-blobs-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.layout-main-wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
}

.content-body-wrapper {
  display: flex;
  flex-grow: 1;
  overflow: hidden;
  position: relative;
}

.main-content {
  flex-grow: 1;
  background-color: var(--main-content-bg-color);
  padding: 25px;
  overflow-y: auto;
  position: relative;
  z-index: 5;
  height: 100%;
  box-sizing: border-box;
  border-top-left-radius: var(--main-content-border-radius);
  border-top-right-radius: var(--main-content-border-radius);
  box-shadow:
    inset 0px 6px 12px -6px rgba(0, 0, 0, 0.07),
    inset 5px 0px 10px -5px rgba(0, 0, 0, 0.05),
    inset -5px 0px 10px -5px rgba(0, 0, 0, 0.045);
}

.clickable-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 105;
  background-color: rgba(var(--mobile-overlay-bg-rgb), var(--mobile-overlay-bg-opacity));
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease-in-out, visibility 0s 0.3s linear;
  cursor: pointer;
  backdrop-filter: blur(var(--mobile-overlay-blur)) saturate(100%);
  -webkit-backdrop-filter: blur(var(--mobile-overlay-blur)) saturate(100%);
}

.clickable-overlay.open {
  opacity: 1;
  visibility: visible;
  transition: opacity 0.3s ease-in-out, visibility 0s 0s linear;
}

@media (max-width: 1024px) and (min-width: 769px) {
  .main-content {
    padding: 20px;
    border-top-left-radius: calc(var(--main-content-border-radius) - 3px);
    border-top-right-radius: calc(var(--main-content-border-radius) - 3px);
  }
}

@media (max-width: 768px) {
  .app-container {
    overflow-x: hidden;
  }

  .main-content {
    padding: 15px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    box-shadow: none;
  }

  .mobile-sidebar {
    position: fixed !important;
    top: 0;
    height: 100vh !important;
    z-index: 110;
    box-shadow: 0 8px 35px rgba(0, 0, 0, 0.28);
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.12) transparent;
    left: 0;
    transform: translateX(-100%);
    opacity: 0;
    pointer-events: none;
    transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .mobile-sidebar.right-mobile-sidebar {
    left: auto;
    right: 0;
    transform: translateX(100%);
  }

  .mobile-sidebar.open {
    transform: translateX(0);
    opacity: 1;
    pointer-events: auto;
  }
}