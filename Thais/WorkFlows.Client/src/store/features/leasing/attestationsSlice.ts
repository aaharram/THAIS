import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { nullifyEmptyDates } from '@/store/shared/nullifyEmptyDates';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { AttestationRequest, AttestationResponse } from './attestation-schemas';

const DATE_FIELDS: (keyof AttestationRequest)[] = ['dateAttestation', 'dateDebut', 'dateFin'];
const sanitizeAttestationPayload = (payload: AttestationRequest): AttestationRequest =>
  nullifyEmptyDates(payload, DATE_FIELDS);

interface ErrorResponse {
  message?: string;
}

interface AttestationsState {
  item: AttestationResponse | null;
  allItems: AttestationResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
}

const initialState: AttestationsState = {
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

export const getAllAttestations = createAsyncThunk<
  { items: AttestationResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('attestations/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: AttestationResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/attestations?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des attestations.');
  }
});

export const getAttestationById = createAsyncThunk<AttestationResponse, number, { rejectValue: string }>(
  'attestations/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<AttestationResponse>(`${API_BASE_URL}/api/attestations/${id}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération de l\'attestation.');
    }
  },
);

export const createAttestation = createAsyncThunk<
  AttestationResponse,
  AttestationRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('attestations/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<AttestationResponse>(`${API_BASE_URL}/api/attestations`, sanitizeAttestationPayload(payload));
    dispatch(setToastOpen({ isOpen: true, message: 'Attestation créée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de la création de l'attestation.");
  }
});

export const editAttestation = createAsyncThunk<
  AttestationResponse,
  { id: number; updatedItem: AttestationRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('attestations/edit', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<AttestationResponse>(`${API_BASE_URL}/api/attestations/${id}`, sanitizeAttestationPayload(updatedItem));
    dispatch(setToastOpen({ isOpen: true, message: 'Attestation modifiée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de la modification de l'attestation.");
  }
});

export const deleteAttestation = createAsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>(
  'attestations/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/attestations/${id}`);
      dispatch(setToastOpen({ isOpen: true, message: 'Attestation supprimée avec succès.' }));
      dispatch(getAllAttestations({}));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || "Échec de la suppression de l'attestation.");
    }
  },
);

const attestationsSlice = createSlice({
  name: 'attestations',
  initialState,
  reducers: {
    setAttestation: (state, action: PayloadAction<AttestationResponse>) => {
      state.item = action.payload;
    },
    resetAttestation: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllAttestations.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllAttestations.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllAttestations.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des attestations.';
      })
      .addCase(getAttestationById.fulfilled, (state, action: PayloadAction<AttestationResponse>) => {
        state.item = action.payload;
      })
      .addCase(createAttestation.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la création de l'attestation.";
      })
      .addCase(editAttestation.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la modification de l'attestation.";
      })
      .addCase(deleteAttestation.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la suppression de l'attestation.";
      });
  },
});

export const { setAttestation, resetAttestation } = attestationsSlice.actions;
export default attestationsSlice.reducer;
