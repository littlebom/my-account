import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId: string;
}

interface Company {
    id: string;
    code: string;
    name: string;
    taxId: string | null;
    branchCode: string;
}

interface AppState {
    // User state
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;

    // Company context
    currentCompany: Company | null;
    companies: Company[];

    // UI state
    sidebarCollapsed: boolean;
    theme: 'light' | 'dark' | 'system';

    // Actions
    setUser: (user: User | null) => void;
    setAccessToken: (token: string | null) => void;
    logout: () => void;
    setCurrentCompany: (company: Company | null) => void;
    setCompanies: (companies: Company[]) => void;
    toggleSidebar: () => void;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            // Initial state
            user: null,
            accessToken: null,
            isAuthenticated: false,
            currentCompany: null,
            companies: [],
            sidebarCollapsed: false,
            theme: 'system',

            // Actions
            setUser: (user) =>
                set({
                    user,
                    isAuthenticated: !!user,
                }),

            setAccessToken: (accessToken) => {
                if (typeof window !== 'undefined') {
                    if (accessToken) {
                        localStorage.setItem('accessToken', accessToken);
                    } else {
                        localStorage.removeItem('accessToken');
                    }
                }
                set({ accessToken });
            },

            logout: () => {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('accessToken');
                }
                set({
                    user: null,
                    accessToken: null,
                    isAuthenticated: false,
                    currentCompany: null,
                });
            },

            setCurrentCompany: (currentCompany) => set({ currentCompany }),

            setCompanies: (companies) => set({ companies }),

            toggleSidebar: () =>
                set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

            setTheme: (theme) => set({ theme }),
        }),
        {
            name: 'cloud-accounting-storage',
            partialize: (state) => ({
                theme: state.theme,
                sidebarCollapsed: state.sidebarCollapsed,
                currentCompany: state.currentCompany,
            }),
        }
    )
);

// Selectors (for optimized re-renders)
export const useUser = () => useAppStore((state) => state.user);
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated);
export const useCurrentCompany = () => useAppStore((state) => state.currentCompany);
export const useTheme = () => useAppStore((state) => state.theme);
