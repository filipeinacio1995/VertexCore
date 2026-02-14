import { create } from 'zustand';

interface User {
  id: string | number;
  username: string;
  avatar: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('tebex_user') || 'null'),
  isAuthenticated: !!localStorage.getItem('tebex_token'),
  setUser: (user) => {
    if (user) localStorage.setItem('tebex_user', JSON.stringify(user));
    else localStorage.removeItem('tebex_user');
    set({ user, isAuthenticated: !!user });
  },
  logout: () => {
    localStorage.removeItem('tebex_token');
    localStorage.removeItem('tebex_user');
    set({ user: null, isAuthenticated: false });
    window.location.href = '/';
  }
}));