import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { LocataireRequest, LocataireResponse } from './locataire-schemas';

interface ErrorResponse {
  message?: string;
}

interface LocatairesState {
  item: LocataireResponse | null;
  allItems: LocataireResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
}

const initialState: LocatairesState = {
  item: null,
  allItems: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  error: null,
  loading: false,
};

export const getAllLocataires = createAsyncThunk<
  { items: LocataireResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('locataires/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = new URLSearchParams();
    urlParams.append('pageNumber', String(params.pageNumber || 1));
    urlParams.append('pageSize', String(params.pageSize || 10));
    if (params.search) urlParams.append('search', params.search);
    if (params.filters) {
      Object.entries(params.filters).forEach(([field, values], i) => {
        urlParams.append(`Filters[${i}].Field`, field);
        values.forEach((value, j) => urlParams.append(`Filters[${i}].Values[${j}]`, String(value)));
      });
    }

    const { data } = await api.get<{
      items: LocataireResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/locataires?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des locataires.');
  }
});

export const getArchivedLocataires = createAsyncThunk<
  { items: LocataireResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('locataires/getArchived', async (params, { rejectWithValue }) => {
  try {
    const urlParams = new URLSearchParams();
    urlParams.append('pageNumber', String(params.pageNumber || 1));
    urlParams.append('pageSize', String(params.pageSize || 10));
    if (params.search) urlParams.append('search', params.search);
    if (params.filters) {
      Object.entries(params.filters).forEach(([field, values], i) => {
        urlParams.append(`Filters[${i}].Field`, field);
        values.forEach((value, j) => urlParams.append(`Filters[${i}].Values[${j}]`, String(value)));
      });
    }

    const { data } = await api.get<{
      items: LocataireResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/locataires/archives?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des locataires archivés.');
  }
});

export const reactivateLocataire = createAsyncThunk<
  LocataireResponse,
  number,
  { dispatch: AppDispatch; rejectValue: string }
>('locataires/reactivate', async (id, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<LocataireResponse>(`${API_BASE_URL}/api/locataires/${id}/reactivate`);
    dispatch(setToastOpen({ isOpen: true, message: 'Locataire réactivé avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la réactivation du locataire.');
  }
});

export const getLocataireById = createAsyncThunk<LocataireResponse, number, { rejectValue: string }>(
  'locataires/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<LocataireResponse>(`${API_BASE_URL}/api/locataires/${id}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération du locataire.');
    }
  },
);

export const createLocataire = createAsyncThunk<
  LocataireResponse,
  LocataireRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('locataires/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<LocataireResponse>(`${API_BASE_URL}/api/locataires`, payload);
    dispatch(setToastOpen({ isOpen: true, message: 'Locataire créé avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la création du locataire.');
  }
});

export const editLocataire = createAsyncThunk<
  LocataireResponse,
  { id: number; updatedItem: LocataireRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('locataires/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<LocataireResponse>(`${API_BASE_URL}/api/locataires/${id}`, updatedItem);
    dispatch(setToastOpen({ isOpen: true, message: 'Locataire modifié avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la modification du locataire.');
  }
});

export const deleteLocataire = createAsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>(
  'locataires/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/locataires/${id}`);
      dispatch(setToastOpen({ isOpen: true, message: 'Locataire supprimé avec succès.' }));
      dispatch(getAllLocataires({}));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la suppression du locataire.');
    }
  },
);

const locatairesSlice = createSlice({
  name: 'locataires',
  initialState,
  reducers: {
    setLocataire: (state, action: PayloadAction<LocataireResponse>) => {
      state.item = action.payload;
    },
    resetLocataire: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllLocataires.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllLocataires.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllLocataires.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des locataires.';
      })
      .addCase(getLocataireById.fulfilled, (state, action: PayloadAction<LocataireResponse>) => {
        state.item = action.payload;
      })
      .addCase(createLocataire.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la création du locataire.';
      })
      .addCase(editLocataire.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la modification du locataire.';
      })
      .addCase(deleteLocataire.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la suppression du locataire.';
      })
      .addCase(getArchivedLocataires.pending, (state) => {
        state.loading = true;
      })
      .addCase(getArchivedLocataires.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getArchivedLocataires.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des locataires archivés.';
      })
      .addCase(reactivateLocataire.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la réactivation du locataire.';
      });
  },
});

export const { setLocataire, resetLocataire } = locatairesSlice.actions;
export default locatairesSlice.reducer;
