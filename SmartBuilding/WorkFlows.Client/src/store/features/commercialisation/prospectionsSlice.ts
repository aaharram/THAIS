import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { nullifyEmptyDates } from '@/store/shared/nullifyEmptyDates';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { ProspectionRequest, ProspectionResponse } from './prospection-schemas';

const DATE_FIELDS: (keyof ProspectionRequest)[] = ['dateAjout', 'dateAdjudication', 'dateContrat'];
const sanitizeProspectionPayload = (payload: ProspectionRequest): ProspectionRequest =>
  nullifyEmptyDates(payload, DATE_FIELDS);

interface ErrorResponse {
  message?: string;
}

interface ProspectionsState {
  item: ProspectionResponse | null;
  allItems: ProspectionResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
}

const initialState: ProspectionsState = {
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

export const getAllProspections = createAsyncThunk<
  { items: ProspectionResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('prospections/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: ProspectionResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/prospections?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des prospections.');
  }
});

export const getProspectionById = createAsyncThunk<ProspectionResponse, number, { rejectValue: string }>(
  'prospections/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<ProspectionResponse>(`${API_BASE_URL}/api/prospections/${id}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération de la prospection.');
    }
  },
);

export const createProspection = createAsyncThunk<
  ProspectionResponse,
  ProspectionRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('prospections/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<ProspectionResponse>(`${API_BASE_URL}/api/prospections`, sanitizeProspectionPayload(payload));
    dispatch(setToastOpen({ isOpen: true, message: 'Prospection créée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la création de la prospection.');
  }
});

export const editProspection = createAsyncThunk<
  ProspectionResponse,
  { id: number; updatedItem: ProspectionRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('prospections/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<ProspectionResponse>(`${API_BASE_URL}/api/prospections/${id}`, sanitizeProspectionPayload(updatedItem));
    dispatch(setToastOpen({ isOpen: true, message: 'Prospection modifiée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la modification de la prospection.');
  }
});

export const deleteProspection = createAsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>(
  'prospections/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/prospections/${id}`);
      dispatch(setToastOpen({ isOpen: true, message: 'Prospection supprimée avec succès.' }));
      dispatch(getAllProspections({}));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la suppression de la prospection.');
    }
  },
);

const prospectionsSlice = createSlice({
  name: 'prospections',
  initialState,
  reducers: {
    setProspection: (state, action: PayloadAction<ProspectionResponse>) => {
      state.item = action.payload;
    },
    resetProspection: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllProspections.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllProspections.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllProspections.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des prospections.';
      })
      .addCase(getProspectionById.fulfilled, (state, action: PayloadAction<ProspectionResponse>) => {
        state.item = action.payload;
      })
      .addCase(createProspection.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la création de la prospection.';
      })
      .addCase(editProspection.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la modification de la prospection.';
      })
      .addCase(deleteProspection.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la suppression de la prospection.';
      });
  },
});

export const { setProspection, resetProspection } = prospectionsSlice.actions;
export default prospectionsSlice.reducer;
