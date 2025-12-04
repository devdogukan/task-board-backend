import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, type User, type RegisterData, type LoginData } from '@/api/auth.api';
import { STORAGE_KEYS } from '@/lib/constants';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  setAuth: (user: User | null, token: string | null) => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (data: LoginData) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authApi.login(data);
          const { user, token } = response.data;
          
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || 'Login failed. Please try again.';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null,
          });
          throw new Error(errorMessage);
        }
      },

      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true, error: null });
          await authApi.register(data);
          set({ isLoading: false, error: null });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || 'Registration failed. Please try again.';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw new Error(errorMessage);
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          // Continue with logout even if API call fails
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      refreshToken: async () => {
        try {
          const response = await authApi.refreshToken();
          const { user, token } = response.data;
          
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
          set({
            user,
            token,
            isAuthenticated: true,
            error: null,
          });
        } catch (error: any) {
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });
          throw error;
        }
      },

      getCurrentUser: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await authApi.getCurrentUser();
          const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
          
          set({
            user: response.data,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          throw error;
        }
      },

      setAuth: (user: User | null, token: string | null) => {
        if (token) {
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
        } else {
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        }
        set({
          user,
          token,
          isAuthenticated: !!user && !!token,
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

