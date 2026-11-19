import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { LocalRequest, LocalResponse } from './local-schemas';

interface ErrorResponse {
  message?: string;
}

interface LocauxState {
  item: LocalResponse | null;
  allItems: LocalResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
}

const initialState: LocauxState = {
  item: null,
  allItems: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  error: null,
  loading: false,
};

export const getAllLocaux = createAsyncThunk<
  { items: LocalResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('locaux/getAll', async (params, { rejectWithValue }) => {
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
      items: LocalResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/locaux?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des locaux.');
  }
});

export const getArchivedLocaux = createAsyncThunk<
  { items: LocalResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('locaux/getArchived', async (params, { rejectWithValue }) => {
  try {
    const urlParams = new URLSearchParams();
    urlParams.append('pageNumber', String(params.pageNumber || 1));
    urlParams.append('pageSize', String(params.pageSize || 10));
    if (params.search) urlParams.append('search', params.search);

    const { data } = await api.get<{
      items: LocalResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/locaux/archives?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des locaux archivés.');
  }
});

export const reactivateLocal = createAsyncThunk<
  LocalResponse,
  number,
  { dispatch: AppDispatch; rejectValue: string }
>('locaux/reactivate', async (id, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<LocalResponse>(`${API_BASE_URL}/api/locaux/${id}/reactivate`);
    dispatch(setToastOpen({ isOpen: true, message: 'Local réactivé avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la réactivation du local.');
  }
});

export const getLocalById = createAsyncThunk<LocalResponse, number, { rejectValue: string }>(
  'locaux/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<LocalResponse>(`${API_BASE_URL}/api/locaux/${id}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération du local.');
    }
  },
);

export const createLocal = createAsyncThunk<
  LocalResponse,
  LocalRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('locaux/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<LocalResponse>(`${API_BASE_URL}/api/locaux`, payload);
    dispatch(setToastOpen({ isOpen: true, message: 'Local créé avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la création du local.');
  }
});

export const editLocal = createAsyncThunk<
  LocalResponse,
  { id: number; updatedItem: LocalRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('locaux/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<LocalResponse>(`${API_BASE_URL}/api/locaux/${id}`, updatedItem);
    dispatch(setToastOpen({ isOpen: true, message: 'Local modifié avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la modification du local.');
  }
});

export const deleteLocal = createAsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>(
  'locaux/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/locaux/${id}`);
      dispatch(setToastOpen({ isOpen: true, message: 'Local supprimé avec succès.' }));
      dispatch(getAllLocaux({}));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la suppression du local.');
    }
  },
);

const locauxSlice = createSlice({
  name: 'locaux',
  initialState,
  reducers: {
    setLocal: (state, action: PayloadAction<LocalResponse>) => {
      state.item = action.payload;
    },
    resetLocal: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllLocaux.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllLocaux.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllLocaux.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des locaux.';
      })
      .addCase(getLocalById.fulfilled, (state, action: PayloadAction<LocalResponse>) => {
        state.item = action.payload;
      })
      .addCase(createLocal.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la création du local.';
      })
      .addCase(editLocal.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la modification du local.';
      })
      .addCase(deleteLocal.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la suppression du local.';
      })
      .addCase(getArchivedLocaux.pending, (state) => {
        state.loading = true;
      })
      .addCase(getArchivedLocaux.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getArchivedLocaux.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des locaux archivés.';
      })
      .addCase(reactivateLocal.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la réactivation du local.';
      });
  },
});

export const { setLocal, resetLocal } = locauxSlice.actions;
export default locauxSlice.reducer;
