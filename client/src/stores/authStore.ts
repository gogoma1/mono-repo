// File: monorepo/client/src/stores/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserZod as User } from '../../../shared/src/schemas/app.schema';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: () => boolean;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isLoading: true,
            isAuthenticated: () => !!get().user,
            setUser: (user) => set({ user, isLoading: false }),
            setLoading: (loading) => set({ isLoading: loading }),
            logout: () => {
                console.log('[authStore] logout action called: Clearing user state.'); // 스토어 로그아웃 로깅
                set({ user: null, isLoading: false });
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: (state) => { // 수정된 부분: state 파라미터 사용
                console.log('[authStore] onRehydrateStorage triggered.');
                // 이 함수는 스토리지에서 상태를 불러온 *직후* 실행됨 (상태가 적용되기 전)
                // 실제 상태 변경은 리턴값이나 내부 set으로 해야 하지만,
                // 여기서는 주로 초기 isLoading 상태를 관리하는 데 사용하거나,
                // 혹은 상태가 로드되었음을 알리는 플래그를 설정하는 데 사용.
                // 직접 state를 변경하는 것은 권장되지 않음.
                // 대신, App.tsx에서 onFinishHydration을 사용하는 것이 더 명확함.
                // 여기서는 isLoading을 false로 설정하지 않고 App.tsx에서 관리.
                return (restoredState, error) => {
                    if (error) {
                        console.error("[authStore] Failed to rehydrate from storage:", error);
                    }
                    if (restoredState) {
                        console.log("[authStore] State successfully rehydrated.");
                        // Rehydration 후 초기 isLoading 상태는 App.tsx에서 API 호출 전 true로 설정.
                        // 여기서 restoredState.isLoading = false; 로 직접 변경하지 않음.
                        // useAuthStore.setState({ isLoading: false }); // 이렇게는 가능
                    }
                };
            }
        }
    )
);