import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { IFetchParams } from '@/store/shared/IFetchParams.ts';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { PaiementRequest, PaiementResponse, PaiementSummary, RapportComptableResponse } from './paiement-schemas';

interface ErrorResponse {
  message?: string;
}

export interface ImporterRemiseLigne {
  refPaiement: string;
  numRemiseBancaire: string;
}

export interface ImporterRemiseResponse {
  nombreAssocies: number;
  referencesIntrouvables: string[];
}

interface PaiementSummaryParams extends IFetchParams {
  noProprietaire?: number;
  noEncaisseur?: number;
}

interface PaiementListParams extends PaiementSummaryParams {
  annee?: number;
  mois?: number;
  statutAnnulation?: 'en-attente' | 'annule';
}

interface PaiementsState {
  allItems: PaiementSummary[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  historique: PaiementResponse[];
  historiqueTotalCount: number;
  historiquePageNumber: number;
  historiquePageSize: number;
  historiqueTotalMontant: number;
  error: string | null;
  loading: boolean;
}

const initialState: PaiementsState = {
  allItems: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  historique: [],
  historiqueTotalCount: 0,
  historiquePageNumber: 1,
  historiquePageSize: 10,
  historiqueTotalMontant: 0,
  error: null,
  loading: false,
};

export const getPaiementsSummary = createAsyncThunk<
  { items: PaiementSummary[]; totalCount: number; pageNumber: number; pageSize: number },
  PaiementSummaryParams,
  { rejectValue: string }
>('paiements/getSummary', async (params, { rejectWithValue }) => {
  try {
    const urlParams = new URLSearchParams();
    urlParams.append('pageNumber', String(params.pageNumber || 1));
    urlParams.append('pageSize', String(params.pageSize || 10));
    if (params.search) urlParams.append('search', params.search);
    if (params.noProprietaire) urlParams.append('noProprietaire', String(params.noProprietaire));
    if (params.noEncaisseur) urlParams.append('noEncaisseur', String(params.noEncaisseur));

    const { data } = await api.get<{
      items: PaiementSummary[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/paiements/summary?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des paiements.');
  }
});

export const getPaiements = createAsyncThunk<
  { items: PaiementResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  PaiementListParams,
  { rejectValue: string }
>('paiements/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = new URLSearchParams();
    urlParams.append('pageNumber', String(params.pageNumber || 1));
    urlParams.append('pageSize', String(params.pageSize || 10));
    if (params.search) urlParams.append('search', params.search);
    if (params.noProprietaire) urlParams.append('noProprietaire', String(params.noProprietaire));
    if (params.noEncaisseur) urlParams.append('noEncaisseur', String(params.noEncaisseur));
    if (params.annee) urlParams.append('annee', String(params.annee));
    if (params.mois) urlParams.append('mois', String(params.mois));
    if (params.statutAnnulation) urlParams.append('statutAnnulation', params.statutAnnulation);

    const { data } = await api.get<{
      items: PaiementResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/paiements?${urlParams.toString()}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des encaissements.');
  }
});

export const getPaiementsTotal = createAsyncThunk<number, PaiementListParams, { rejectValue: string }>(
  'paiements/getTotal',
  async (params, { rejectWithValue }) => {
    try {
      const urlParams = new URLSearchParams();
      if (params.search) urlParams.append('search', params.search);
      if (params.noProprietaire) urlParams.append('noProprietaire', String(params.noProprietaire));
      if (params.noEncaisseur) urlParams.append('noEncaisseur', String(params.noEncaisseur));
      if (params.annee) urlParams.append('annee', String(params.annee));
      if (params.mois) urlParams.append('mois', String(params.mois));
      if (params.statutAnnulation) urlParams.append('statutAnnulation', params.statutAnnulation);

      const { data } = await api.get<{ totalMontant: number }>(
        `${API_BASE_URL}/api/paiements/total?${urlParams.toString()}`,
      );
      return data.totalMontant;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Échec du calcul du total.');
    }
  },
);

export const creerPaiement = createAsyncThunk<
  PaiementResponse,
  PaiementRequest,
  { dispatch: AppDispatch; rejectValue: string }
>(
  'paiements/create',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.post<PaiementResponse>(`${API_BASE_URL}/api/paiements`, payload);
      dispatch(setToastOpen({ isOpen: true, message: 'Paiement enregistré avec succès.' }));
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || "Échec de l'enregistrement du paiement.");
    }
  },
);

export const demanderAnnulationPaiement = createAsyncThunk<
  PaiementResponse,
  number,
  { dispatch: AppDispatch; rejectValue: string }
>('paiements/demanderAnnulation', async (numero, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<PaiementResponse>(`${API_BASE_URL}/api/paiements/${numero}/demander-annulation`);
    dispatch(setToastOpen({ isOpen: true, message: "Demande d'annulation envoyée." }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de la demande d'annulation.");
  }
});

export const rejeterAnnulationPaiement = createAsyncThunk<
  PaiementResponse,
  number,
  { dispatch: AppDispatch; rejectValue: string }
>('paiements/rejeterAnnulation', async (numero, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<PaiementResponse>(`${API_BASE_URL}/api/paiements/${numero}/rejeter-annulation`);
    dispatch(setToastOpen({ isOpen: true, message: "Demande d'annulation rejetée." }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec du rejet.');
  }
});

export const confirmerAnnulationPaiement = createAsyncThunk<
  PaiementResponse,
  number,
  { dispatch: AppDispatch; rejectValue: string }
>('paiements/confirmerAnnulation', async (numero, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<PaiementResponse>(`${API_BASE_URL}/api/paiements/${numero}/confirmer-annulation`);
    dispatch(setToastOpen({ isOpen: true, message: 'Encaissement annulé avec succès.' }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de la confirmation de l'annulation.");
  }
});

export const importerRemisePaiements = createAsyncThunk<
  ImporterRemiseResponse,
  ImporterRemiseLigne[],
  { dispatch: AppDispatch; rejectValue: string }
>('paiements/importerRemise', async (lignes, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<ImporterRemiseResponse>(`${API_BASE_URL}/api/paiements/importer-remise`, {
      lignes,
    });
    dispatch(
      setToastOpen({
        isOpen: true,
        message: `${data.nombreAssocies} encaissement(s) associé(s) à une remise bancaire.`,
      }),
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de l'import de la remise bancaire.");
  }
});

export const genererRapportComptable = createAsyncThunk<
  RapportComptableResponse,
  { annee?: number; mois?: number; noProprietaire?: number },
  { dispatch: AppDispatch; rejectValue: string }
>('paiements/rapportComptable', async (params, { dispatch, rejectWithValue }) => {
  try {
    const urlParams = new URLSearchParams();
    if (params.annee) urlParams.append('annee', String(params.annee));
    if (params.mois) urlParams.append('mois', String(params.mois));
    if (params.noProprietaire) urlParams.append('noProprietaire', String(params.noProprietaire));

    const { data } = await api.post<RapportComptableResponse>(
      `${API_BASE_URL}/api/paiements/rapport-comptable?${urlParams.toString()}`,
    );
    dispatch(setToastOpen({ isOpen: true, message: `${data.lignes.length} encaissement(s) exporté(s).` }));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la génération du rapport comptable.');
  }
});

const paiementsSlice = createSlice({
  name: 'paiements',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPaiementsSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPaiementsSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getPaiementsSummary.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des paiements.';
      })
      .addCase(getPaiements.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPaiements.fulfilled, (state, action) => {
        state.loading = false;
        state.historique = action.payload.items;
        state.historiqueTotalCount = action.payload.totalCount;
        state.historiquePageNumber = action.payload.pageNumber;
        state.historiquePageSize = action.payload.pageSize;
      })
      .addCase(getPaiements.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des encaissements.';
      })
      .addCase(getPaiementsTotal.fulfilled, (state, action) => {
        state.historiqueTotalMontant = action.payload;
      })
      .addCase(creerPaiement.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de l'enregistrement du paiement.";
      })
      .addCase(demanderAnnulationPaiement.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la demande d'annulation.";
      })
      .addCase(rejeterAnnulationPaiement.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Échec du rejet.';
      })
      .addCase(confirmerAnnulationPaiement.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || "Échec de la confirmation de l'annulation.";
      });
  },
});

export default paiementsSlice.reducer;
