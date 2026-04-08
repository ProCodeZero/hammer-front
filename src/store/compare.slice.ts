import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { loadState, saveState } from './storage';
import { COMPARE_PERSISTENT_STATE } from './storage-keys';

export interface CompareState {
  comparedIds: string[];
}

const initialState: CompareState = loadState<CompareState>(COMPARE_PERSISTENT_STATE) ?? {
  comparedIds: [],
};

export const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    toggle: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const index = state.comparedIds.indexOf(id);
      if (index === -1) {
        // Add if not present (max 4 units)
        if (state.comparedIds.length < 4) {
          state.comparedIds.push(id);
        }
      } else {
        // Remove if present
        state.comparedIds.splice(index, 1);
      }
    },
    add: (state, action: PayloadAction<string>) => {
      if (!state.comparedIds.includes(action.payload) && state.comparedIds.length < 4) {
        state.comparedIds.push(action.payload);
      }
    },
    remove: (state, action: PayloadAction<string>) => {
      state.comparedIds = state.comparedIds.filter((id) => id !== action.payload);
    },
    clear: (state) => {
      state.comparedIds = [];
    },
    set: (state, action: PayloadAction<string[]>) => {
      state.comparedIds = action.payload.slice(0, 4);
    },
  },
});

// Persist to localStorage
const originalReducer = compareSlice.reducer;
compareSlice.reducer = (state, action) => {
  const newState = originalReducer(state, action);
  saveState(newState as CompareState, COMPARE_PERSISTENT_STATE);
  return newState;
};

export default compareSlice.reducer;
export const compareActions = compareSlice.actions;
