import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthState, AuthUser } from "./Auth.types";
import { useExplotacionStore } from "../explotacion/Explotacion.store";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token: string, user: AuthUser) => {
        document.cookie = `agrospaceview-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
        set({ token, user, isAuthenticated: true });
      },

      clearAuth: () => {
        document.cookie = "agrospaceview-token=; path=/; max-age=0";
        useExplotacionStore.getState().clearExplotaciones();
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: "agrospaceview-auth",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
