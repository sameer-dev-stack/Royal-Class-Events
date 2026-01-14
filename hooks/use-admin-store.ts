import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AdminState {
    isVerified: boolean;
    adminId: string | null;
    setVerified: (id: string | null) => void;
    clearAdminSession: () => void;
}

export const useAdminStore = create<AdminState>()(
    persist(
        (set) => ({
            isVerified: false,
            adminId: null,
            setVerified: (id) => set({ isVerified: true, adminId: id }),
            clearAdminSession: () => set({ isVerified: false, adminId: null }),
        }),
        {
            name: "admin-session-storage",
            storage: createJSONStorage(() => sessionStorage), // Security: Clears on tab close
        }
    )
);
