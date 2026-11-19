import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { api } from '../../services/authConfig';
import {
  deleteToken,
  getRememberMePreference,
  getToken,
  saveToken,
} from '../../services/tokenService';

interface ErrorResponse {
  message?: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  name: string;
  email: string;
  role: string;
  id: number;
  token: string;
  requiresPasswordReset?: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  auth: LoginResponse | null;
  message: string | null;
  warning: string | null;
  error: string | null;
  loading: boolean;
  toastOpen: boolean;
}

export const login = createAsyncThunk<
  LoginResponse,
  LoginRequest & { isLdap?: boolean; rememberMe: boolean },
  { rejectValue: string | { requiresPasswordReset: boolean } }
>(
  'auth/login',
  async ({ username, password, isLdap, rememberMe }, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.post<LoginResponse>(`${API_BASE_URL}/api/auth/login`, {
        username,
        password,
        isLdap,
      });

      saveToken('auth', JSON.stringify(data), rememberMe);
      saveToken('token', data.token, rememberMe);

      dispatch(setToastOpen({ isOpen: true, message: 'Connexion réussie!' }));

      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ requiresPasswordReset?: boolean }>;
      if (axiosError.response?.data?.requiresPasswordReset)
        return rejectWithValue({ requiresPasswordReset: true });
      dispatch(setToastOpen({ isOpen: true, error: 'Échec de la connexion.' }));
      return rejectWithValue('Échec de la connexion.');
    }
  },
);

export const logout = createAsyncThunk<string, boolean, { rejectValue: string }>(
  'auth/logout',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const auth = getToken('auth');
      if (!auth) return rejectWithValue('Aucun utilisateur connecté.');

      const { email } = JSON.parse(auth);
      await api.post(`${API_BASE_URL}/api/auth/logout`, { userName: email });

      deleteToken('auth');
      deleteToken('token');
      dispatch(
        setToastOpen({
          isOpen: true,
          message: 'Déconnexion réussie!',
        }),
      );

      return 'Déconnexion réussie!';
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      dispatch(setToastOpen({ isOpen: true, error: 'Échec de la déconnexion.' }));
      return rejectWithValue(axiosError?.response?.data?.message || 'Échec de la déconnexion.');
    }
  },
);

// Add new thunk for first password reset
export const firstResetPassword = createAsyncThunk<
  { message: string },
  { username: string; newPassword: string },
  { rejectValue: string }
>('auth/firstResetPassword', async (resetData, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<{ message: string }>(
      `${API_BASE_URL}/api/auth/first-reset-password`,
      {
        username: resetData.username,
        newPassword: resetData.newPassword,
      },
    );

    dispatch(
      setToastOpen({
        isOpen: true,
        message: data.message || 'Password reset successfully!',
      }),
    );

    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    dispatch(
      setToastOpen({
        isOpen: true,
        error: 'Password reset failed!',
      }),
    );
    return rejectWithValue(axiosError?.response?.data?.message || 'Password reset failed!');
  }
});

export const forceLogin = createAsyncThunk<LoginResponse, LoginRequest, { rejectValue: string }>(
  'auth/forceLogin',
  async (loginRequest, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.post<LoginResponse>(
        `${API_BASE_URL}/api/auth/force-login`,
        loginRequest,
      );
      localStorage.setItem('auth', JSON.stringify(data));
      localStorage.setItem('token', JSON.stringify(data.token));
      dispatch(setToastOpen({ isOpen: true, message: 'Connexion forcée réussie!' }));
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      dispatch(
        setToastOpen({
          isOpen: true,
          error: (axiosError?.response?.data as string) || 'Échec de la connexion forcée.',
        }),
      );
      return rejectWithValue(
        (axiosError?.response?.data as string) || 'Échec de la connexion forcée.',
      );
    }
  },
);

export const forgetPassword = createAsyncThunk<string, { email: string }, { rejectValue: string }>(
  'auth/forgetPassword',
  async (forgetPasswordData, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.post<string>(
        `${API_BASE_URL}/api/auth/forgetPassword`,
        forgetPasswordData,
      );
      dispatch(
        setToastOpen({
          isOpen: true,
          message: 'Instructions de réinitialisation envoyées!',
        }),
      );
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      dispatch(
        setToastOpen({
          isOpen: true,
          error: "Échec de l'envoi des instructions de réinitialisation.",
        }),
      );
      return rejectWithValue(
        axiosError?.response?.data?.message ||
          "Échec de l'envoi des instructions de réinitialisation.",
      );
    }
  },
);

const getStoredAuth = (): LoginResponse | null => {
  try {
    const rememberMe = getRememberMePreference();
    const storage = rememberMe ? localStorage : sessionStorage;
    const auth = storage.getItem('auth');
    return auth ? JSON.parse(auth) : null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  isAuthenticated: !!getStoredAuth(),
  auth: getStoredAuth(),
  message: null,
  warning: null,
  error: null,
  loading: false,
  toastOpen: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    cleanToken: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('auth');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.auth = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : '';
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.isAuthenticated = false;
        state.auth = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Logout failed!';
      })
      .addCase(forceLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forceLogin.fulfilled, (state, action) => {
        state.auth = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        state.loading = false;
        localStorage.setItem('auth', JSON.stringify(action.payload));
        localStorage.setItem('token', JSON.stringify(action.payload.token));
      })
      .addCase(forceLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Force login failed!';
      })
      .addCase(forgetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
      })
      .addCase(forgetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Password reset failed!';
      });
  },
});

export const { cleanToken } = authSlice.actions;

export default authSlice.reducer;
