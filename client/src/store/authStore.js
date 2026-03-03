import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL, withCredentials: true});

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        try {
          const { data } = await API.post('/auth/login', { email, password });
          set({ user: data, token: data.token, isAuthenticated: true });
          localStorage.setItem('token', data.token);
          return { success: true };
        } catch (err) {
          return { success: false, message: err.response?.data?.message || 'Login failed' };
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('token');
      },

      setUser: (user) => set({ user, isAuthenticated: true }),
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
    }
  )
);

// Axios interceptor to add token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;