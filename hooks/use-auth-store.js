import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: Cookies.get("auth-token") || undefined,
      isAuthenticated: !!Cookies.get("auth-token"),
      role: null,

      login: (userData, token) => {
        Cookies.set("auth-token", token, { expires: 30 }); // 30 days
        set({
          user: userData,
          token: token,
          isAuthenticated: true,
          role: userData.role
        });
      },

      logout: () => {
        Cookies.remove("auth-token");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          role: null
        });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
          role: userData.role || state.role
        }));
      }
    }),
    {
      name: "auth-storage", // local storage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAuthStore;
