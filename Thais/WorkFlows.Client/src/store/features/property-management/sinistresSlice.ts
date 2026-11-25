import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { nullifyEmptyDates } from '@/store/shared/nullifyEmptyDates';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { SinistreRequest, SinistreResponse } from './sinistre-schemas';

const DATE_FIELDS: (keyof SinistreRequest)[] = [
  'dateDeclaration',
  'dateExpertise',
  'dateReclamation',
  'dateRemboursement',
];
const sanitizePayload = (payload: SinistreRequest): SinistreRequest => nullifyEmptyDates(payload, DATE_FIELDS);

interface ErrorResponse {
  message?: string;
}

interface SinistresState {
  item: SinistreResponse | null;
  allItems: SinistreResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
}

const initialState: SinistresState = {
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

export const getAllSinistres = createAsyncThunk<
  { items: SinistreResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('sinistres/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: SinistreResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/sinistres?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des sinistres.');
  }
});

export const getSinistreById = createAsyncThunk<SinistreResponse, number, { rejectValue: string }>(
  'sinistres/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<SinistreResponse>(`${API_BASE_URL}/api/sinistres/${id}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération du sinistre.');
    }
  },
);

export const createSinistre = createAsyncThunk<
  SinistreResponse,
  SinistreRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('sinistres/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<SinistreResponse>(`${API_BASE_URL}/api/sinistres`, sanitizePayload(payload));
    dispatch(setToastOpen({ isOpen: true, message: 'Sinistre créé avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la création du sinistre.');
  }
});

export const editSinistre = createAsyncThunk<
  SinistreResponse,
  { id: number; updatedItem: SinistreRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('sinistres/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<SinistreResponse>(`${API_BASE_URL}/api/sinistres/${id}`, sanitizePayload(updatedItem));
    dispatch(setToastOpen({ isOpen: true, message: 'Sinistre modifié avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la modification du sinistre.');
  }
});

export type SinistreAttachmentKind = 'expertise-locataire' | 'expertise-bailleur' | 'pv-expertise';

export const uploadSinistreAttachment = createAsyncThunk<
  SinistreResponse,
  { id: number; kind: SinistreAttachmentKind; file: File },
  { dispatch: AppDispatch; rejectValue: string }
>('sinistres/uploadAttachment', async ({ id, kind, file }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<SinistreResponse>(
      `${API_BASE_URL}/api/sinistres/${id}/attachment/${kind}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de l'envoi du fichier.");
  }
});

export const downloadSinistreAttachment = async (id: number, kind: SinistreAttachmentKind, fileName: string) => {
  const response = await api.get(`${API_BASE_URL}/api/sinistres/${id}/attachment/${kind}`, {
    responseType: 'blob',
  });
  const url = URL.createObjectURL(response.data as Blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

export const deleteSinistre = createAsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>(
  'sinistres/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/sinistres/${id}`);
      dispatch(setToastOpen({ isOpen: true, message: 'Sinistre supprimé avec succès.' }));
      dispatch(getAllSinistres({}));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la suppression du sinistre.');
    }
  },
);

const sinistresSlice = createSlice({
  name: 'sinistres',
  initialState,
  reducers: {
    setSinistre: (state, action: PayloadAction<SinistreResponse>) => {
      state.item = action.payload;
    },
    resetSinistre: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllSinistres.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllSinistres.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllSinistres.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des sinistres.';
      })
      .addCase(getSinistreById.fulfilled, (state, action: PayloadAction<SinistreResponse>) => {
        state.item = action.payload;
      })
      .addCase(createSinistre.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la création du sinistre.';
      })
      .addCase(editSinistre.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la modification du sinistre.';
      })
      .addCase(deleteSinistre.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la suppression du sinistre.';
      })
      .addCase(uploadSinistreAttachment.fulfilled, (state, action: PayloadAction<SinistreResponse>) => {
        state.item = action.payload;
      })
      .addCase(uploadSinistreAttachment.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de l'envoi du fichier.";
      });
  },
});

export const { setSinistre, resetSinistre } = sinistresSlice.actions;
export default sinistresSlice.reducer;
