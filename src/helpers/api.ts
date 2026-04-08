export const API_BASE_URL = 'http://127.0.0.1:8000';
export const API_TIMEOUT = 10000;

interface ApiErrorResponse {
  message?: string;
  error?: string;
  detail?: string;
  [key: string]: unknown;
}

export const ENDPOINTS = {
  ROOT: '/',
  STATS: '/stats',
  FACTIONS: '/factions',
  FACTION_DETAILS: (name: string) => `/factions/${encodeURIComponent(name)}/details`,
  FACTION_UNITS: (name: string) => `/factions/${encodeURIComponent(name)}/units`,
  FACTION_STATS: (name: string) => `/factions/${encodeURIComponent(name)}/stats`,
  FACTION_KEYWORDS: (name: string) => `/factions/${encodeURIComponent(name)}/keywords`,
  UNITS: '/units',
  UNIT_BY_ID: (id: string) => `/units/${encodeURIComponent(id)}`,
  UNITS_SEARCH: (name: string) => `/units/search/name/${encodeURIComponent(name)}`,
  UNITS_RANDOM: '/units/random',
  UNITS_EXPENSIVE: '/units/expensive',
  UNITS_CHEAP: '/units/cheap',
  UNITS_COUNT: '/units/count',
  UNITS_COMPARE: '/units/compare',
  ABILITIES_SEARCH: (term: string) => `/abilities/search/${encodeURIComponent(term)}`,
  KEYWORDS_LIST: '/abilities/keywords/list',
  KEYWORDS_SEARCH: (keyword: string) => `/abilities/keywords/search/${encodeURIComponent(keyword)}`,
  SPECIAL_RULES_LIST: '/abilities/special-rules/list',
  SPECIAL_RULES_SEARCH: (rule: string) =>
    `/abilities/special-rules/search/${encodeURIComponent(rule)}`,
  BULK_UNITS_BY_IDS: '/bulk/units/by-ids',
  BULK_UNITS_BY_NAMES: '/bulk/units/by-names',
  BULK_STATS_BY_KEYWORD: '/bulk/stats/by-keyword',
  BULK_STATS_BY_FACTION_TYPE: '/bulk/stats/by-faction-type',
  BULK_STATS_BY_FACTION: '/bulk/stats/by-faction',
  BULK_EXPORT: '/bulk/export/all-units-summary',
};

const parseApiError = (data: ApiErrorResponse): string => {
  return data.message || data.error || data.detail || 'Unknown API error';
};

export const api = {
  get: async <T>(endpoint: string, params?: Record<string, unknown>): Promise<T> => {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(API_TIMEOUT),
    });
    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as ApiErrorResponse;
      throw new Error(`${parseApiError(errorData)} (Status: ${response.status})`);
    }
    return response.json();
  },

  getList: async <T>(
    endpoint: string,
    params?: Record<string, unknown>,
  ): Promise<{ units: T[]; total?: number; limit?: number; offset?: number }> => {
    return api.get(endpoint, params);
  },

  getOne: async <T>(endpoint: string, params?: Record<string, unknown>): Promise<T> => {
    return api.get<T>(endpoint, params);
  },
};
