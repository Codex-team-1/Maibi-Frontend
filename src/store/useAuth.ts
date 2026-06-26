import { create } from 'zustand';
import { tokenStore } from '@/lib/api';
import { login as apiLogin, getMe } from '@/api';
import type { AdminProfile } from '@/api';

interface AuthState {
  admin: AdminProfile | null;
  /** True until the initial token check resolves. */
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  /** Validate any persisted token on app start. */
  bootstrap: () => Promise<void>;
  setAdmin: (admin: AdminProfile) => void;
}

export const useAuth = create<AuthState>((set) => ({
  admin: null,
  initializing: true,

  login: async (email, password) => {
    const { token, admin } = await apiLogin(email, password);
    tokenStore.set(token);
    set({ admin });
  },

  logout: () => {
    tokenStore.clear();
    set({ admin: null });
  },

  bootstrap: async () => {
    if (!tokenStore.get()) {
      set({ initializing: false });
      return;
    }
    try {
      const admin = await getMe();
      set({ admin, initializing: false });
    } catch {
      tokenStore.clear();
      set({ admin: null, initializing: false });
    }
  },

  setAdmin: (admin) => set({ admin }),
}));
