import { create } from 'zustand';
import type { User, Role } from '../types/user';

interface AuthState {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasRole: (roles: Role[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
  isAuthenticated: () => get().user !== null,
  hasRole: (roles) => {
    const currentUser = get().user;
    return currentUser ? roles.includes(currentUser.role) : false;
  },
}));