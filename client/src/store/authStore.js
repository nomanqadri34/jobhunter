import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,

      login: async (descopeToken) => {
        set({ loading: true });
        try {
          const response = await authService.login(descopeToken);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            loading: false
          });
          return response;
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
        localStorage.removeItem('auth-storage');
      },

      connectGoogle: async (code) => {
        try {
          await authService.connectGoogle(code);
          const user = { ...get().user, googleConnected: true };
          set({ user });
        } catch (error) {
          throw error;
        }
      },

      connectLinkedIn: async (code) => {
        try {
          await authService.connectLinkedIn(code);
          const user = { ...get().user, linkedinConnected: true };
          set({ user });
        } catch (error) {
          throw error;
        }
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);