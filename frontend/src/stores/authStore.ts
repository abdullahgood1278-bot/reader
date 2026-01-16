import { create } from 'zustand';
import { authAPI } from '../services/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  continueAsGuest: () => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isGuest: !!localStorage.getItem('isGuest'),
  isLoading: false,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.login(email, password);
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  register: async (email: string, username: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.register(email, username, password);
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.removeItem('isGuest');
      set({ user, token, isAuthenticated: true, isGuest: false, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  continueAsGuest: () => {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const guestUser = {
      id: guestId,
      email: null,
      username: `Guest_${Math.random().toString(36).substr(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    
    const guestToken = btoa(JSON.stringify({ guestId, timestamp: Date.now() }));
    
    localStorage.setItem('token', guestToken);
    localStorage.setItem('isGuest', 'true');
    set({ user: guestUser, token: guestToken, isAuthenticated: true, isGuest: true, isLoading: false });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isGuest');
    set({ user: null, token: null, isAuthenticated: false, isGuest: false });
  },
  
  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false });
      return;
    }
    
    try {
      const response = await authAPI.getMe();
      set({ user: response.data.user, isAuthenticated: true });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));
