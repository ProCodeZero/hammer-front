import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../helpers/api';
import type { FactionDetails, FactionSummary } from '../interfaces/faction.interface';
import { loadState } from './storage';

export const FACTIONS_PERSISTENT_STATE = 'openhammer_factions';

export interface FactionsState {
  items: FactionSummary[];
  details: Record<string, FactionDetails>;
  loading: boolean;
  error: string | null;
}

const initialState: FactionsState = {
  items: loadState<FactionsState>(FACTIONS_PERSISTENT_STATE)?.items ?? [],
  details: {},
  loading: false,
  error: null,
};

export const fetchFactions = createAsyncThunk(
  'factions/fetchFactions',
  async ({ factionType }: { factionType?: string }, { rejectWithValue }) => {
    try {
      const url = factionType
        ? `${API_BASE_URL}${ENDPOINTS.FACTIONS}?faction_type=${factionType}`
        : `${API_BASE_URL}${ENDPOINTS.FACTIONS}`;

      const { data } = await axios.get<FactionSummary[]>(url);
      return data;
    } catch (e) {
      if (e instanceof AxiosError) {
        return rejectWithValue(e.response?.data?.message || e.message);
      }
      return rejectWithValue('Failed to fetch factions');
    }
  },
);

export const fetchFactionDetails = createAsyncThunk(
  'factions/fetchFactionDetails',
  async (name: string, { rejectWithValue }) => {
    try {
      const { data } = await axios.get<FactionDetails>(
        `${API_BASE_URL}${ENDPOINTS.FACTION_DETAILS(name)}`,
      );
      return { name, details: data };
    } catch (e) {
      if (e instanceof AxiosError) {
        return rejectWithValue(e.response?.data?.message || e.message);
      }
      return rejectWithValue('Failed to fetch faction details');
    }
  },
);

export const factionsSlice = createSlice({
  name: 'factions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addFactionToDetails: (
      state,
      action: PayloadAction<{ name: string; details: FactionDetails }>,
    ) => {
      state.details[action.payload.name] = action.payload.details;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchFactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchFactionDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFactionDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.details[action.payload.name] = action.payload.details;
      })
      .addCase(fetchFactionDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Persist to localStorage
const originalReducer = factionsSlice.reducer;
factionsSlice.reducer = (state, action) => {
  const newState = originalReducer(state, action);
  if (newState.items?.length) {
    const toPersist = {
      items: newState.items,
      loading: newState.loading,
      error: newState.error,
    } as Omit<FactionsState, 'details'>;
    localStorage?.setItem(FACTIONS_PERSISTENT_STATE, JSON.stringify(toPersist));
  }
  return newState;
};

export default factionsSlice.reducer;
export const factionsActions = factionsSlice.actions;
