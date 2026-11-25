import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { BuildingMapMarkerResponse } from './building-map-marker-schemas';

interface ErrorResponse {
  message?: string;
}

interface BuildingMapMarkersState {
  allItems: BuildingMapMarkerResponse[];
  error: string | null;
  loading: boolean;
}

const initialState: BuildingMapMarkersState = {
  allItems: [],
  error: null,
  loading: false,
};

// RMANew (Classes/Carte.vb, GetImmeubles) : filtré côté serveur par Réseau
// (noProprietaire) et Destinations (noBuildingType) - le filtre "Actifs" (un building
// précis) est appliqué côté client sur ce même résultat, pas via un 3e paramètre serveur.
export const getBuildingMapMarkers = createAsyncThunk<
  BuildingMapMarkerResponse[],
  { noProprietaire?: number; noBuildingType?: number },
  { rejectValue: string }
>('buildingMapMarkers/getAll', async (params, { rejectWithValue }) => {
  try {
    const urlParams = new URLSearchParams();
    if (params.noProprietaire) urlParams.append('noProprietaire', String(params.noProprietaire));
    if (params.noBuildingType) urlParams.append('noBuildingType', String(params.noBuildingType));
    const { data } = await api.get<BuildingMapMarkerResponse[]>(
      `${API_BASE_URL}/api/buildings/map-markers?${urlParams.toString()}`,
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Échec de la récupération des actifs.');
  }
});

const buildingMapMarkersSlice = createSlice({
  name: 'buildingMapMarkers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getBuildingMapMarkers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBuildingMapMarkers.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload;
      })
      .addCase(getBuildingMapMarkers.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des actifs.';
      });
  },
});

export default buildingMapMarkersSlice.reducer;
