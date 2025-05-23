// File: monorepo/client/src/App.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router'; // useNavigate import 확인
import BackgroundBlobs from './components/rootlayout/BackgroundBlobs';
import GlassNavbar from './components/rootlayout/GlassNavbar';
import GlassSidebar from './components/rootlayout/GlassSidebar';
import GlassSidebarRight from './components/rootlayout/GlassSidebarRight';
import { useUIStore } from './stores/uiStore';
import { useAuthStore } from './stores/authStore'; // 여전히 인증 상태 관리는 필요

// 페이지 컴포넌트 import
import LoginPage from './pages/LoginPage';
import BridgePage from './pages/BridgePage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import ActivityPage from './pages/ActivityPage';
import StatisticPage from './pages/StatisticPage';
import PerformanceCasesPage from './pages/PerformanceCasesPage';
import TasksPage from './pages/TasksPage';
import MyStudentPage from './pages/MyStudentPage';
import StudentTableTest from '../src2/pages/StudentTableTest/StudentTableTest';
// 필요하다면 LandingPage 등 다른 페이지들도 import

import './App.css';
import type { UserZod as User } from '../../shared/src/schemas/app.schema';

function App() {
  const { currentBreakpoint, mobileSidebarType, closeMobileSidebar } = useUIStore();
  // isAuthenticated와 user는 네비게이션 바 등에서 UI를 다르게 보여줄 때 여전히 사용될 수 있습니다.
  const { isAuthenticated, isLoading: isLoadingAuth, user: authUser, setUser, setLoading } = useAuthStore();
  const location = useLocation();
  // navigate는 여전히 필요할 수 있음 (예: 프로필 설정 완료 후 이동 등)
  const navigate = useNavigate();
  const [isHydrated, setIsHydrated] = useState(useAuthStore.persist.hasHydrated());

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });
    if (useAuthStore.persist.hasHydrated() && !isHydrated) {
      setIsHydrated(true);
    }
    return () => {
      unsub();
    };
  }, [isHydrated]);

  const checkInitialAuthStatus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      });
      if (response.ok) {
        const sessionData = await response.json();
        if (sessionData && sessionData.user) {
          setUser(sessionData.user as User);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('[App.tsx] Failed to check initial auth status:', error);
      setUser(null);
    }
  }, [setUser, setLoading]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    // 모든 페이지에서 초기 인증 상태는 확인 (UI 변경 등을 위해)
    checkInitialAuthStatus();
  }, [isHydrated, checkInitialAuthStatus]); // location.pathname 의존성 제거 (모든 페이지에서 실행)

  // 프로필 미설정 시 리디렉션 로직은 여전히 유효할 수 있음 (인증된 사용자 대상)
  useEffect(() => {
    if (isHydrated && isAuthenticated() && authUser && !authUser.name && location.pathname !== '/profilesetup' && location.pathname !== '/login' && location.pathname !== '/bridge') {
      // console.log('[App.tsx] User authenticated but name missing, redirecting to /profilesetup');
      // navigate('/profilesetup', { replace: true }); // 필요시 주석 해제
    }
  }, [isHydrated, isAuthenticated, authUser, location.pathname, navigate]);


  // isOnAuthFlowPage는 레이아웃 제어에 계속 사용될 수 있음
  const isOnAuthFlowPage = location.pathname === '/login' || location.pathname === '/bridge' || location.pathname === '/profilesetup';

  useEffect(() => {
    const bodyOverflow = !isOnAuthFlowPage && currentBreakpoint === 'mobile' && mobileSidebarType !== null;
    document.body.style.overflow = bodyOverflow ? 'hidden' : '';
    if (isOnAuthFlowPage) {
      document.body.classList.add('auth-active');
    } else {
      document.body.classList.remove('auth-active');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('auth-active');
    };
  }, [currentBreakpoint, mobileSidebarType, isOnAuthFlowPage]);

  const showOverlay = !isOnAuthFlowPage && currentBreakpoint === 'mobile' && mobileSidebarType !== null;

  // 로딩 화면 조건 단순화: 스토어 rehydrate 전 또는 인증 정보 로딩 중일 때만 표시
  // (페이지 접근 자체를 막지는 않으므로, 이 로딩 화면이 길게 보이지 않도록 최적화 필요)
  if (!isHydrated || isLoadingAuth) {
    // 단, 로그인/브릿지 페이지에서는 이 로딩을 건너뛰고 싶다면 이전 조건 유지 가능
    // if (!isHydrated || (isLoadingAuth && !isOnAuthFlowPage)) { ... }
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h1>애플리케이션 로딩 중...</h1>
      </div>
    );
  }

  return (
    <div className={`app-container ${currentBreakpoint}-layout ${showOverlay ? 'mobile-sidebar-active' : ''} ${isOnAuthFlowPage ? 'auth-flow-active' : ''}`}>
      {/* 네비게이션 바, 사이드바 등은 현재 경로 또는 인증 상태에 따라 조건부 렌더링 가능 */}
      {!isOnAuthFlowPage && ( // 로그인/브릿지/프로필 설정 페이지가 아닐 때만 기본 레이아웃 요소 표시
        <>
          <div className="background-blobs-wrapper"><BackgroundBlobs /></div>
          {showOverlay && (<div className={`clickable-overlay ${showOverlay ? 'active' : ''}`} onClick={closeMobileSidebar} aria-hidden="true" />)}
          {currentBreakpoint === 'mobile' && <GlassSidebar />}
          {currentBreakpoint === 'mobile' && <GlassSidebarRight />}
        </>
      )}

      <div className={!isOnAuthFlowPage ? "layout-main-wrapper" : "auth-layout-wrapper"}>
        {!isOnAuthFlowPage && <GlassNavbar />} {/* GlassNavbar 내부에서 로그인/로그아웃 버튼 등 처리 */}
        <div className={!isOnAuthFlowPage ? "content-body-wrapper" : ""}>
          {!isOnAuthFlowPage && currentBreakpoint !== 'mobile' && <GlassSidebar />}
          <main className={!isOnAuthFlowPage ? "main-content" : "auth-main-content"}>
            <Routes>
              {/* 모든 페이지를 일단 직접 렌더링. 인증 여부 상관없이. */}
              {/* 로그인 페이지: 이미 로그인했다면 대시보드로 리디렉션 (선택적 UI 개선) */}
              <Route path="/login" element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
              {/* 브릿지 페이지는 OAuth 콜백 처리를 위해 그대로 둠 */}
              <Route path="/bridge" element={<BridgePage />} />

              {/* 나머지 페이지들 */}
              <Route path="/" element={<DashboardPage />} /> {/* 예: 기본 랜딩을 대시보드로 */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/profilesetup" element={<ProfileSetupPage />} />
              <Route path="/dashboard/activity" element={<ActivityPage />} />
              <Route path="/dashboard/statistic" element={<StatisticPage />} />
              <Route path="/dashboard/performance-cases" element={<PerformanceCasesPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/mystudentpage" element={<MyStudentPage />} />
              <Route path="/studenttabletest" element={<StudentTableTest />} />

              {/* 일치하는 경로가 없을 때의 처리 (예: 404 페이지 또는 기본 페이지로 리디렉션) */}
              {/* <Route path="*" element={<NotFoundPage />} /> */}
              <Route path="*" element={<Navigate to="/" replace />} /> {/* 예: 루트로 리디렉션 */}
            </Routes>
          </main>
          {!isOnAuthFlowPage && currentBreakpoint !== 'mobile' && <GlassSidebarRight />}
        </div>
      </div>
    </div>
  );
}

export default App;