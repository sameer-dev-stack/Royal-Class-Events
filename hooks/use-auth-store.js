import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: Cookies.get("auth-token") || undefined,
      isAuthenticated: !!Cookies.get("auth-token"),
      viewMode: "attendee",
      isLoading: true,

      setIsLoading: (loading) => set({ isLoading: loading }),

      login: (userData, token) => {
        Cookies.set("auth-token", token, {
          expires: 30,
          secure: true,
          sameSite: 'strict'
        }); // 30 days
        const role = userData.role;
        // Default to organizer view if they have permissions
        const initialViewMode = (role === "organizer" || role === "admin") ? "organizer" : "attendee";

        set({
          user: userData,
          token: token,
          isAuthenticated: true,
          role: role,
          viewMode: initialViewMode
        });
      },

      logout: () => {
        Cookies.remove("auth-token");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          role: null,
          viewMode: "attendee"
        });
      },

      setViewMode: (mode) => {
        set({ viewMode: mode });
      },

      updateUser: (userData) => {
        set((state) => {
          const newRole = userData.role || state.role;
          // Auto-switch to organizer view if role upgrades
          let newViewMode = state.viewMode;
          if ((newRole === "organizer" || newRole === "admin") && state.role !== newRole) {
            newViewMode = "organizer";
          }

          return {
            user: { ...state.user, ...userData },
            role: newRole,
            viewMode: newViewMode
          };
        });
      }
    }),
    {
      name: "auth-storage", // local storage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAuthStore;
