import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { FactureRequest, FactureResponse } from './facture-schemas';

interface ErrorResponse {
  message?: string;
}

interface FacturesState {
  item: FactureResponse | null;
  allItems: FactureResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  error: string | null;
  loading: boolean;
}

const initialState: FacturesState = {
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

export const getAllFactures = createAsyncThunk<
  { items: FactureResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('factures/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = buildUrlParams(params);
    const { data } = await api.get<{
      items: FactureResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/factures?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des factures.');
  }
});

export const getFactureById = createAsyncThunk<FactureResponse, number, { rejectValue: string }>(
  'factures/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<FactureResponse>(`${API_BASE_URL}/api/factures/${id}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération de la facture.');
    }
  },
);

export const genererFacture = createAsyncThunk<
  FactureResponse,
  FactureRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('factures/generer', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<FactureResponse>(`${API_BASE_URL}/api/factures/generer`, payload);
    dispatch(setToastOpen({ isOpen: true, message: 'Facture générée avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la génération de la facture.');
  }
});

export const marquerFactureEditee = createAsyncThunk<
  FactureResponse,
  number,
  { dispatch: AppDispatch; rejectValue: string }
>('factures/marquerEdite', async (id, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<FactureResponse>(`${API_BASE_URL}/api/factures/${id}/marquer-edite`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    dispatch(setToastOpen({ isOpen: true, message: "Échec du marquage de la facture." }));
    return rejectWithValue(axiosError.response?.data?.message || 'Échec du marquage de la facture.');
  }
});

export const telechargerFacturePdf = createAsyncThunk<
  void,
  { id: number; nomLocataire?: string | null },
  { dispatch: AppDispatch; rejectValue: string }
>('factures/telechargerPdf', async ({ id, nomLocataire }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.get<Blob>(`${API_BASE_URL}/api/factures/${id}/pdf`, { responseType: 'blob' });
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Facture-${id}${nomLocataire ? '-' + nomLocataire.replace(/[^a-zA-Z0-9]+/g, '_') : ''}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
    dispatch(marquerFactureEditee(id));
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec du téléchargement de la facture.');
  }
});

export const demanderAnnulationFacture = createAsyncThunk<
  FactureResponse,
  number,
  { dispatch: AppDispatch; rejectValue: string }
>('factures/demanderAnnulation', async (id, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<FactureResponse>(`${API_BASE_URL}/api/factures/${id}/demander-annulation`);
    dispatch(setToastOpen({ isOpen: true, message: "Demande d'annulation enregistrée." }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de la demande d'annulation.");
  }
});

export const confirmerAnnulationFacture = createAsyncThunk<
  FactureResponse,
  number,
  { dispatch: AppDispatch; rejectValue: string }
>('factures/confirmerAnnulation', async (id, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<FactureResponse>(`${API_BASE_URL}/api/factures/${id}/confirmer-annulation`);
    dispatch(setToastOpen({ isOpen: true, message: 'Annulation confirmée.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de la confirmation d'annulation.");
  }
});

export const annulerDemandeAnnulationFacture = createAsyncThunk<
  FactureResponse,
  number,
  { dispatch: AppDispatch; rejectValue: string }
>('factures/annulerDemandeAnnulation', async (id, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<FactureResponse>(
      `${API_BASE_URL}/api/factures/${id}/annuler-demande-annulation`,
    );
    dispatch(setToastOpen({ isOpen: true, message: "Demande d'annulation retirée." }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec du retrait de la demande.');
  }
});

export const deleteFacture = createAsyncThunk<void, number, { dispatch: AppDispatch; rejectValue: string }>(
  'factures/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/factures/${id}`);
      dispatch(setToastOpen({ isOpen: true, message: 'Facture supprimée avec succès.' }));
      dispatch(getAllFactures({}));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec de la suppression de la facture.');
    }
  },
);

const facturesSlice = createSlice({
  name: 'factures',
  initialState,
  reducers: {
    resetFacture: (state) => {
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllFactures.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllFactures.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllFactures.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des factures.';
      })
      .addCase(getFactureById.fulfilled, (state, action: PayloadAction<FactureResponse>) => {
        state.item = action.payload;
      })
      .addCase(genererFacture.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la génération de la facture.';
      })
      .addCase(marquerFactureEditee.fulfilled, (state, action: PayloadAction<FactureResponse>) => {
        const idx = state.allItems.findIndex((f) => f.numero === action.payload.numero);
        if (idx !== -1) state.allItems[idx] = action.payload;
      })
      .addCase(demanderAnnulationFacture.fulfilled, (state, action: PayloadAction<FactureResponse>) => {
        const idx = state.allItems.findIndex((f) => f.numero === action.payload.numero);
        if (idx !== -1) state.allItems[idx] = action.payload;
      })
      .addCase(demanderAnnulationFacture.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la demande d'annulation.";
      })
      .addCase(confirmerAnnulationFacture.fulfilled, (state, action: PayloadAction<FactureResponse>) => {
        const idx = state.allItems.findIndex((f) => f.numero === action.payload.numero);
        if (idx !== -1) state.allItems[idx] = action.payload;
      })
      .addCase(confirmerAnnulationFacture.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la confirmation d'annulation.";
      })
      .addCase(annulerDemandeAnnulationFacture.fulfilled, (state, action: PayloadAction<FactureResponse>) => {
        const idx = state.allItems.findIndex((f) => f.numero === action.payload.numero);
        if (idx !== -1) state.allItems[idx] = action.payload;
      })
      .addCase(annulerDemandeAnnulationFacture.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec du retrait de la demande.';
      })
      .addCase(deleteFacture.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec de la suppression de la facture.';
      });
  },
});

export const { resetFacture } = facturesSlice.actions;
export default facturesSlice.reducer;
