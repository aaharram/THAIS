import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { nullifyEmptyDates } from '@/store/shared/nullifyEmptyDates';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { BailRequest, BailResponse } from './bail-schemas';

const DATE_FIELDS: (keyof BailRequest)[] = ['dateDebut', 'dateGestion', 'dateFin'];
const sanitizeBailPayload = (payload: BailRequest): BailRequest => nullifyEmptyDates(payload, DATE_FIELDS);

interface ErrorResponse {
  message?: string;
}

interface BauxState {
  item: BailResponse | null;
  allItems: BailResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
}

const initialState: BauxState = {
  item: null,
  allItems: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  error: null,
  loading: false,
};

const buildUrlParams = (params: IFetchParams) => {
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
  return urlParams;
};

export const getAllBaux = createAsyncThunk<
  { items: BailResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('baux/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: BailResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/baux?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des baux.');
  }
});

export const getArchivedBaux = createAsyncThunk<
  { items: BailResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('baux/getArchived', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: BailResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/baux/archives?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des baux archivés.');
  }
});

export const reactivateBail = createAsyncThunk<
  BailResponse,
  number,
  { dispatch: AppDispatch; rejectValue: string }
>('baux/reactivate', async (id, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<BailResponse>(`${API_BASE_URL}/api/baux/${id}/reactivate`);
    dispatch(setToastOpen({ isOpen: true, message: 'Bail réactivé avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la réactivation du bail.');
  }
});

export const getBailById = createAsyncThunk<BailResponse, number, { rejectValue: string }>(
  'baux/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<BailResponse>(`${API_BASE_URL}/api/baux/${id}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération du bail.');
    }
  },
);

export const createBail = createAsyncThunk<
  BailResponse,
  BailRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('baux/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<BailResponse>(`${API_BASE_URL}/api/baux`, sanitizeBailPayload(payload));
    dispatch(setToastOpen({ isOpen: true, message: 'Bail créé avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la création du bail.');
  }
});

export const editBail = createAsyncThunk<
  BailResponse,
  { id: number; updatedItem: BailRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('baux/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<BailResponse>(`${API_BASE_URL}/api/baux/${id}`, sanitizeBailPayload(updatedItem));
    dispatch(setToastOpen({ isOpen: true, message: 'Bail modifié avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la modification du bail.');
  }
});

export const deleteBail = createAsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>(
  'baux/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/baux/${id}`);
      dispatch(setToastOpen({ isOpen: true, message: 'Bail supprimé avec succès.' }));
      dispatch(getAllBaux({}));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la suppression du bail.');
    }
  },
);

const bauxSlice = createSlice({
  name: 'baux',
  initialState,
  reducers: {
    setBail: (state, action: PayloadAction<BailResponse>) => {
      state.item = action.payload;
    },
    resetBail: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllBaux.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllBaux.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllBaux.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des baux.';
      })
      .addCase(getBailById.fulfilled, (state, action: PayloadAction<BailResponse>) => {
        state.item = action.payload;
      })
      .addCase(createBail.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la création du bail.';
      })
      .addCase(editBail.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la modification du bail.';
      })
      .addCase(deleteBail.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la suppression du bail.';
      })
      .addCase(getArchivedBaux.pending, (state) => {
        state.loading = true;
      })
      .addCase(getArchivedBaux.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getArchivedBaux.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des baux archivés.';
      })
      .addCase(reactivateBail.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la réactivation du bail.';
      });
  },
});

export const { setBail, resetBail } = bauxSlice.actions;
export default bauxSlice.reducer;
