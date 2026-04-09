import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../helpers/api';
import { normalizeUnitList, type Unit } from '../interfaces/unit.interface';
import { loadState } from './storage';
import { UNITS_PERSISTENT_STATE } from './storage-keys';

export interface UnitsFilters {
  name?: string;
  faction?: string;
  faction_type?: 'Imperium' | 'Chaos' | 'Xenos' | 'Unaligned';
  type?: 'unit' | 'model';
  has_invuln?: boolean;
  has_transport?: boolean;
  keyword?: string;
  points_min?: number;
  points_max?: number;
  sort_by?: 'name' | 'points' | 'faction' | '-name' | '-points' | '-faction';
}

export interface UnitsState {
  items: Unit[];
  filters: UnitsFilters;
  loading: boolean;
  error: string | null;
  total: number;
  limit: number;
  offset: number;
}

const initialState: UnitsState = {
  items: loadState<UnitsState>(UNITS_PERSISTENT_STATE)?.items ?? [],
  filters: {},
  loading: false,
  error: null,
  total: 0,
  limit: 100,
  offset: 0,
};

export const syncFiltersFromUrl = createAsyncThunk(
  'units/syncFiltersFromUrl',
  async (searchParams: URLSearchParams, { dispatch }) => {
    const filters: UnitsFilters = {};

    const name = searchParams.get('name');
    if (name) filters.name = name;

    const faction = searchParams.get('faction');
    if (faction) filters.faction = faction;

    const faction_type = searchParams.get('faction_type') as UnitsFilters['faction_type'];
    if (faction_type) filters.faction_type = faction_type;

    const type = searchParams.get('type') as UnitsFilters['type'];
    if (type) filters.type = type;

    const has_invuln = searchParams.get('has_invuln');
    if (has_invuln === 'true') filters.has_invuln = true;

    const has_transport = searchParams.get('has_transport');
    if (has_transport === 'true') filters.has_transport = true;

    const keyword = searchParams.get('keyword');
    if (keyword) filters.keyword = keyword;

    const points_min = searchParams.get('points_min');
    if (points_min) filters.points_min = parseInt(points_min, 10);

    const points_max = searchParams.get('points_max');
    if (points_max) filters.points_max = parseInt(points_max, 10);

    const sort_by = searchParams.get('sort_by') as UnitsFilters['sort_by'];
    if (sort_by) filters.sort_by = sort_by;

    dispatch(unitsActions.setFilters(filters));
    return filters;
  },
);

export const fetchUnits = createAsyncThunk(
  'units/fetchUnits',
  async (
    params: { filters?: UnitsFilters; limit?: number; offset?: number },
    { rejectWithValue },
  ) => {
    try {
      const { filters = {}, limit = 100, offset = 0 } = params;
      const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.UNITS}`, {
        params: { ...filters, limit, offset },
        timeout: 10000,
      });

      return normalizeUnitList(response.data);
    } catch (e) {
      if (e instanceof AxiosError) {
        return rejectWithValue(e.response?.data?.message || e.message);
      }
      return rejectWithValue('Failed to fetch units');
    }
  },
);

export const fetchUnitById = createAsyncThunk(
  'units/fetchUnitById',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await axios.get<Unit>(`${API_BASE_URL}${ENDPOINTS.UNIT_BY_ID(id)}`);
      return data;
    } catch (e) {
      if (e instanceof AxiosError) {
        return rejectWithValue(e.response?.data?.message || e.message);
      }
      return rejectWithValue('Failed to fetch unit');
    }
  },
);

export const unitsSlice = createSlice({
  name: 'units',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<UnitsFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.offset = 0;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.offset = 0;
    },
    setPagination: (state, action: PayloadAction<{ limit?: number; offset?: number }>) => {
      if (action.payload.limit !== undefined) state.limit = action.payload.limit;
      if (action.payload.offset !== undefined) state.offset = action.payload.offset;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnits.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.units;
        state.total = action.payload.total ?? 0;
      })
      .addCase(fetchUnits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUnitById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUnitById.fulfilled, (state, action) => {
        state.loading = false;
        const existing = state.items.findIndex((u) => u.id === action.payload.id);
        if (existing >= 0) {
          state.items[existing] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(fetchUnitById.rejected, (state, action) => {
        state.loading = false;
        const errorMsg = action.payload as string;
        state.error = errorMsg.includes('404') ? 'NOT_FOUND' : errorMsg;
      });
  },
});

export default unitsSlice.reducer;
export const unitsActions = unitsSlice.actions;
