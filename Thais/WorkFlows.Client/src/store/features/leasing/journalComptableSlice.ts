import { setToastOpen } from '@/store/features/toast/toastSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import {
  CompteComptableJournalRequest,
  CompteComptableJournalResponse,
  JournalComptableGeneration,
  JournalComptableResponse,
} from './journal-comptable-schemas';
import { AppDispatch } from '@/store';

interface ErrorResponse {
  message?: string;
}

interface JournalComptableState {
  journal: JournalComptableResponse | null;
  historique: JournalComptableGeneration[];
  comptes: CompteComptableJournalResponse[];
  loading: boolean;
  generating: boolean;
  error: string | null;
}

const initialState: JournalComptableState = {
  journal: null,
  historique: [],
  comptes: [],
  loading: false,
  generating: false,
  error: null,
};

export const getJournalComptable = createAsyncThunk<
  JournalComptableResponse,
  { annee: number; mois: number; noProprietaire?: number; typeJournal: string },
  { rejectValue: string }
>('journalComptable/get', async ({ annee, mois, noProprietaire, typeJournal }, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    params.append('annee', String(annee));
    params.append('mois', String(mois));
    params.append('typeJournal', typeJournal);
    if (noProprietaire) params.append('noProprietaire', String(noProprietaire));
    const { data } = await api.get<JournalComptableResponse>(
      `${API_BASE_URL}/api/journal-comptable?${params.toString()}`,
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération du journal.');
  }
});

export const genererJournalComptable = createAsyncThunk<
  JournalComptableResponse,
  { annee: number; mois: number; noProprietaire?: number; typeJournal: string; generePar: number },
  { dispatch: AppDispatch; rejectValue: string }
>('journalComptable/generer', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<JournalComptableResponse>(`${API_BASE_URL}/api/journal-comptable/generer`, payload);
    dispatch(setToastOpen({ isOpen: true, message: 'Journal comptable généré avec succès.' }));
    dispatch(getJournalComptableHistorique());
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la génération du journal.');
  }
});

export const getJournalComptableHistorique = createAsyncThunk<
  JournalComptableGeneration[],
  void,
  { rejectValue: string }
>('journalComptable/getHistorique', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get<JournalComptableGeneration[]>(`${API_BASE_URL}/api/journal-comptable/historique`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || "Échec de la récupération de l'historique.");
  }
});

export const getComptesComptableJournal = createAsyncThunk<
  CompteComptableJournalResponse[],
  void,
  { rejectValue: string }
>('journalComptable/getComptes', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get<CompteComptableJournalResponse[]>(`${API_BASE_URL}/api/comptes-comptable-journal`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des comptes.');
  }
});

export const createCompteComptableJournal = createAsyncThunk<
  CompteComptableJournalResponse,
  CompteComptableJournalRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('journalComptable/createCompte', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<CompteComptableJournalResponse>(`${API_BASE_URL}/api/comptes-comptable-journal`, payload);
    dispatch(setToastOpen({ isOpen: true, message: 'Compte créé avec succès.' }));
    dispatch(getComptesComptableJournal());
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la création du compte.');
  }
});

export const editCompteComptableJournal = createAsyncThunk<
  CompteComptableJournalResponse,
  { id: number; updatedItem: CompteComptableJournalRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('journalComptable/editCompte', async ({ id, updatedItem }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<CompteComptableJournalResponse>(
      `${API_BASE_URL}/api/comptes-comptable-journal/${id}`,
      updatedItem,
    );
    dispatch(setToastOpen({ isOpen: true, message: 'Compte modifié avec succès.' }));
    dispatch(getComptesComptableJournal());
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la modification du compte.');
  }
});

export const deleteCompteComptableJournal = createAsyncThunk<
  void,
  number,
  { dispatch: AppDispatch; rejectValue: string }
>('journalComptable/deleteCompte', async (id, { dispatch, rejectWithValue }) => {
  try {
    await api.delete(`${API_BASE_URL}/api/comptes-comptable-journal/${id}`);
    dispatch(setToastOpen({ isOpen: true, message: 'Compte supprimé avec succès.' }));
    dispatch(getComptesComptableJournal());
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la suppression du compte.');
  }
});

const journalComptableSlice = createSlice({
  name: 'journalComptable',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getJournalComptable.pending, (state) => {
        state.loading = true;
      })
      .addCase(getJournalComptable.fulfilled, (state, action: PayloadAction<JournalComptableResponse>) => {
        state.loading = false;
        state.journal = action.payload;
      })
      .addCase(getJournalComptable.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération du journal.';
      })
      .addCase(genererJournalComptable.pending, (state) => {
        state.generating = true;
      })
      .addCase(genererJournalComptable.fulfilled, (state, action: PayloadAction<JournalComptableResponse>) => {
        state.generating = false;
        state.journal = action.payload;
      })
      .addCase(genererJournalComptable.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.generating = false;
        state.error = action.payload || 'Échec de la génération du journal.';
      })
      .addCase(getJournalComptableHistorique.fulfilled, (state, action: PayloadAction<JournalComptableGeneration[]>) => {
        state.historique = action.payload;
      })
      .addCase(getComptesComptableJournal.fulfilled, (state, action: PayloadAction<CompteComptableJournalResponse[]>) => {
        state.comptes = action.payload;
      });
  },
});

export default journalComptableSlice.reducer;
