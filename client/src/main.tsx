// File: monorepo/client/src/main.tsx (React Query Devtools 제외)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App.tsx';
import './index.css'; // 전역 CSS

// Tippy.js 스타일 (그대로 유지)
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/perspective.css'; // 또는 다른 원하는 애니메이션

// React Query 관련 import
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// QueryClient 인스턴스 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,       // 5분 동안 데이터를 fresh 상태로 간주
      gcTime: 1000 * 60 * 30,         // 30분 동안 사용되지 않으면 가비지 컬렉션
      retry: 1,                       // API 요청 실패 시 1번 재시도
      refetchOnWindowFocus: false,    // 창 포커스 시 자동 refetch 비활성화 (필요에 따라 true)
    },
    mutations: {
      // 뮤테이션 기본 옵션 (필요시)
    }
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);