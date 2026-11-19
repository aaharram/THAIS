import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { ProvinceResponse } from './provinces-schemas';

interface ProvinceState {
  province: ProvinceResponse | null;
  allProvinces: ProvinceResponse[];
  provincesByCountry: ProvinceResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  message: string | null;
  error: string | null;
  loading: boolean;
  toastOpen: boolean;
}

interface ErrorResponse {
  message?: string;
}

const initialState: ProvinceState = {
  province: null,
  allProvinces: [],
  provincesByCountry: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  message: null,
  error: null,
  loading: false,
  toastOpen: false,
};

export const getProvincesByCountry = createAsyncThunk<
  { items: ProvinceResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  { countryId: number; forSelect?: boolean; pageNumber?: number; pageSize?: number },
  { rejectValue: string }
>(
  'province/getProvincesByCountry',
  async ({ countryId, forSelect, pageNumber = 1, pageSize = 10 }, { rejectWithValue }) => {
    try {
      
      const params = new URLSearchParams();

      if (forSelect !== undefined) params.append('forSelect', String(forSelect));
      params.append('pageNumber', String(pageNumber));
      params.append('pageSize', String(pageSize));

      const { data } = await api.get<{
        items: ProvinceResponse[];
        totalCount: number;
        pageNumber: number;
        pageSize: number;
      }>(
        `${API_BASE_URL}/api/provinces/country/${countryId}/provinces?${params.toString()}`,
        );

      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || 'Échec de la récupération des provinces par pays.',
      );
    }
  },
);

const provinceSlice = createSlice({
  name: 'province',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProvincesByCountry.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProvincesByCountry.fulfilled, (state, action) => {
        state.loading = false;
        state.provincesByCountry = action.payload.items; // Store in `provincesByCountry`
      })
      .addCase(getProvincesByCountry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Erreur lors du chargement des provinces.';
      });
  },
});

export default provinceSlice.reducer;
