import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { AppDispatch } from '@/store';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { ProfileRequest, ProfileResponse } from './profile-schemas';

interface ProfileState {
  profile: ProfileResponse | null;
  message: string | null;
  error: string | null;
  loading: boolean;
}

interface ErrorResponse {
  message?: string;
}

const initialState: ProfileState = {
  profile: null,
  message: null,
  error: null,
  loading: false,
};

export const getMyProfile = createAsyncThunk<ProfileResponse, void, { rejectValue: string }>(
  'profile/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<ProfileResponse>(`${API_BASE_URL}/api/profile/me`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération du profil.');
    }
  },
);

export const updateMyProfile = createAsyncThunk<
  ProfileResponse,
  ProfileRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('profile/updateMe', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<ProfileResponse>(`${API_BASE_URL}/api/profile/me`, payload);
    dispatch(setToastOpen({ isOpen: true, message: 'Profil mis à jour avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la mise à jour du profil.');
  }
});

export const uploadMyProfilePhoto = createAsyncThunk<
  ProfileResponse,
  File,
  { dispatch: AppDispatch; rejectValue: string }
>('profile/uploadPhoto', async (file, { dispatch, rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<ProfileResponse>(`${API_BASE_URL}/api/profile/me/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    dispatch(setToastOpen({ isOpen: true, message: 'Photo de profil mise à jour.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de l'envoi de la photo.");
  }
});

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getMyProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMyProfile.fulfilled, (state, action: PayloadAction<ProfileResponse>) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(getMyProfile.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération du profil.';
      })
      .addCase(updateMyProfile.fulfilled, (state, action: PayloadAction<ProfileResponse>) => {
        state.profile = action.payload;
        state.message = 'Profil mis à jour avec succès.';
      })
      .addCase(uploadMyProfilePhoto.fulfilled, (state, action: PayloadAction<ProfileResponse>) => {
        state.profile = action.payload;
      });
  },
});

export default profileSlice.reducer;
