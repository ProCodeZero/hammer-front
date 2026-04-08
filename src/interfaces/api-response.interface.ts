export interface ApiError {
  message: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface BulkFetchResponse<T> {
  requested: number;
  found: number;
  not_found: string[];
  units: T[];
}
