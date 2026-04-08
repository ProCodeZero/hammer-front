export class ApiError extends Error {
  public message: string;
  public status?: number;
  public endpoint?: string;

  constructor(message: string, status?: number, endpoint?: string) {
    super(message);
    this.message = message;
    this.status = status;
    this.endpoint = endpoint;
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: unknown, endpoint?: string): ApiError => {
  if (error instanceof ApiError) return error;

  if (error instanceof Error) {
    if (error.message.includes('timeout')) {
      return new ApiError('Request timed out. Please try again.', 408, endpoint);
    }
    if (error.message.includes('NetworkError')) {
      return new ApiError('Network error. Please check your connection.', 0, endpoint);
    }
    return new ApiError(error.message, undefined, endpoint);
  }

  return new ApiError('An unexpected error occurred', undefined, endpoint);
};

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};
