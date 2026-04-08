import { configureStore } from '@reduxjs/toolkit';
import compareReducer from './compare.slice';
import factionsReducer from './factions.slice';
import { saveState } from './storage';
import { FACTIONS_PERSISTENT_STATE, UNITS_PERSISTENT_STATE } from './storage-keys';
import unitsReducer from './units.slice';

export const store = configureStore({
  reducer: {
    units: unitsReducer,
    factions: factionsReducer,
    compare: compareReducer,
  },
});

// Persist state to localStorage
store.subscribe(() => {
  saveState(store.getState().units, UNITS_PERSISTENT_STATE);
  saveState(store.getState().factions, FACTIONS_PERSISTENT_STATE);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
