import axios from 'axios';

// You can switch between hardcoded IP or environment variable
const baseURL = process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'http://192.168.1.11:8000';

export const api = axios.create({
  baseURL,
});

// Optional: Add token from auth store to request headers, avoiding circular import
api.interceptors.request.use((config) => {
  try {
    const { useAuthStore } = require('@/store/auth-store'); // Lazy import to avoid circular dependency
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn('Auth token not attached:', err);
  }

  return config;
});


