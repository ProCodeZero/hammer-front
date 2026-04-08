import {
  COMPARE_PERSISTENT_STATE,
  FACTIONS_PERSISTENT_STATE,
  UNITS_PERSISTENT_STATE,
} from './storage-keys';

export function loadState<T>(key: string): T | undefined {
  try {
    if (typeof window === 'undefined') return undefined;
    const jsonState = localStorage.getItem(key);
    if (!jsonState) return undefined;

    const parsed = JSON.parse(jsonState);

    if (key === UNITS_PERSISTENT_STATE) {
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        !Array.isArray(parsed.items) ||
        (parsed.total !== undefined && typeof parsed.total !== 'number') ||
        (parsed.limit !== undefined && typeof parsed.limit !== 'number')
      ) {
        console.warn('Invalid persisted units state structure, clearing...');
        localStorage.removeItem(key);
        return undefined;
      }
    }

    if (key === FACTIONS_PERSISTENT_STATE) {
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.items)) {
        console.warn('Invalid persisted factions state structure, clearing...');
        localStorage.removeItem(key);
        return undefined;
      }
    }

    if (key === COMPARE_PERSISTENT_STATE) {
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.comparedIds)) {
        console.warn('Invalid persisted compare state structure, clearing...');
        localStorage.removeItem(key);
        return undefined;
      }
    }

    return parsed;
  } catch (e) {
    console.error('Failed to load state:', e);
    localStorage.removeItem(key);
    return undefined;
  }
}

export function saveState<T>(state: T, key: string): void {
  try {
    if (typeof window === 'undefined') return;
    const stringState = JSON.stringify(state);
    localStorage.setItem(key, stringState);
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}
