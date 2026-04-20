import { create } from 'zustand';

interface User {
  phoneNumber: string;
  role: 'customer' | 'rider';
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (phoneNumber: string) => Promise<void>;
  logout: () => void;
  setRole: (role: 'customer' | 'rider') => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,

  login: async (phoneNumber: string) => {
    // In a real app, this would call the /auth/login API
    // For now, we simulate a successful login for the demo
    set({
      isAuthenticated: true,
      user: {
        phoneNumber,
        role: 'customer', // Default role
      },
    });
  },

  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
    });
  },

  setRole: (role) => {
    set((state) => ({
      user: state.user ? { ...state.user, role } : null,
    }));
  },
}));
