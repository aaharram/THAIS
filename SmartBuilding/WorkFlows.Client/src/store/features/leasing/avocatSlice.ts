import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { AvocatRequest, AvocatResponse } from './avocat-schemas';

interface ErrorResponse {
  message?: string;
}

interface AvocatState {
  item: AvocatResponse | null;
  allItems: AvocatResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
}

const initialState: AvocatState = {
  item: null,
  allItems: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  error: null,
  loading: false,
};

const buildUrlParams = (noContentieux: number, params: IFetchParams) => {
  const urlParams = new URLSearchParams();
  urlParams.append('noContentieux', String(noContentieux));
  urlParams.append('pageNumber', String(params.pageNumber || 1));
  urlParams.append('pageSize', String(params.pageSize || 10));
  if (params.search) urlParams.append('search', params.search);
  if (params.filters) {
    Object.entries(params.filters).forEach(([field, values], i) => {
      urlParams.append(`Filters[${i}].Field`, field);
      values.forEach((value, j) => urlParams.append(`Filters[${i}].Values[${j}]`, String(value)));
    });
  }
  return urlParams;
};

export const getAllAvocats = createAsyncThunk<
  { items: AvocatResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  { noContentieux: number } & IFetchParams,
  { rejectValue: string }
>('avocat/getAll', async ({ noContentieux, ...params }, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(noContentieux, params);
    const { data } = await api.get<{
      items: AvocatResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/avocats?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des avocats.');
  }
});

export const getAvocatById = createAsyncThunk<AvocatResponse, number, { rejectValue: string }>(
  'avocat/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<AvocatResponse>(`${API_BASE_URL}/api/avocats/${id}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || "Échec de la récupération de l'avocat.");
    }
  },
);

export const createAvocat = createAsyncThunk<AvocatResponse, AvocatRequest, { dispatch: AppDispatch; rejectValue: string }>(
  'avocat/create',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.post<AvocatResponse>(`${API_BASE_URL}/api/avocats`, payload);
      dispatch(setToastOpen({ isOpen: true, message: 'Avocat ajouté avec succès.' }));
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || "Échec de l'ajout de l'avocat.");
    }
  },
);

export const editAvocat = createAsyncThunk<
  AvocatResponse,
  { id: number; updatedItem: AvocatRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('avocat/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<AvocatResponse>(`${API_BASE_URL}/api/avocats/${id}`, updatedItem);
    dispatch(setToastOpen({ isOpen: true, message: 'Avocat modifié avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de la modification de l'avocat.");
  }
});

export const deleteAvocat = createAsyncThunk<
  void,
  { id: number; noContentieux: number },
  { dispatch: AppDispatch; rejectValue: string }
>('avocat/delete', async ({ id, noContentieux }, { dispatch, rejectWithValue }) => {
  try {
    await api.delete(`${API_BASE_URL}/api/avocats/${id}`);
    dispatch(setToastOpen({ isOpen: true, message: 'Avocat supprimé avec succès.' }));
    dispatch(getAllAvocats({ noContentieux }));
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de la suppression de l'avocat.");
  }
});

const avocatSlice = createSlice({
  name: 'avocat',
  initialState,
  reducers: {
    setAvocat: (state, action: PayloadAction<AvocatResponse>) => {
      state.item = action.payload;
    },
    resetAvocat: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllAvocats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllAvocats.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllAvocats.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des avocats.';
      })
      .addCase(getAvocatById.fulfilled, (state, action: PayloadAction<AvocatResponse>) => {
        state.item = action.payload;
      })
      .addCase(createAvocat.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de l'ajout de l'avocat.";
      })
      .addCase(editAvocat.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la modification de l'avocat.";
      })
      .addCase(deleteAvocat.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la suppression de l'avocat.";
      });
  },
});

export const { setAvocat, resetAvocat } = avocatSlice.actions;
export default avocatSlice.reducer;
