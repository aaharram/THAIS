import { store } from '@/store';
import { logout } from '@/store/features/authentification/authSlice';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import axios, { AxiosError } from 'axios';
import { deleteToken, getToken } from './tokenService';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

let isLoggingOut = false;
let logoutPromise: Promise<unknown> | null = null;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Authorization header
api.interceptors.request.use((config) => {
  const token = getToken('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/logout')
    ) {
      originalRequest._retry = true;
      if (!isLoggingOut) {
        isLoggingOut = true;
        logoutPromise = store
          .dispatch(logout(false))
          .unwrap()
          .finally(() => {
            isLoggingOut = false;
            logoutPromise = null;
            // Always clean localStorage after logout
            deleteToken('auth');
            deleteToken('token');
          });
        await logoutPromise;

        store.dispatch(
          setToastOpen({
            isOpen: true,
            message: 'Session expirée. Veuillez vous reconnecter.',
          }),
        );
      } else if (logoutPromise) {
        await logoutPromise;
      }
    }

    return Promise.reject(error);
  },
);
