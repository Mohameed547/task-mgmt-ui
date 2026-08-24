export interface ApiResponse<T = unknown> {
  status: 'success' | 'fail' | 'error';
  message?: string;
  data?: T;
  errors?: string[];
  statusCode?: number;
}

export interface ApiErrorPayload {
  status: 'fail' | 'error';
  statusCode?: number;
  message: string;
  errors?: string[];
}
