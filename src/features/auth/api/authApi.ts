import { apiClient } from '../../../lib/apiClient';
import type { ApiResponse } from '../../../types';
import type {
  AuthUser,
  LoginCredentials,
  RegisterData,
  LoginResponseData,
} from '../types/auth.types';

const TOKEN_KEY = 'token';

export const tokenStorage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  removeToken: (): void => localStorage.removeItem(TOKEN_KEY),
};

const normalizeUser = (userData: any): AuthUser => {
  if (!userData) return userData;
  return {
    id: userData.id || userData._id || '',
    name: userData.name || '',
    email: userData.email || '',
    role: userData.role,
    createdAt: userData.createdAt,
    updatedAt: userData.updatedAt,
  };
};

/**
 * Registers a new user via POST /auth/register
 */
export const registerApi = async (data: RegisterData): Promise<AuthUser> => {
  const response = await apiClient.post<ApiResponse<any>>('/auth/register', data);
  const rawUser = response.data.data;
  return normalizeUser(rawUser);
};

/**
 * Authenticates user via POST /auth/login
 */
export const loginApi = async (credentials: LoginCredentials): Promise<LoginResponseData> => {
  const response = await apiClient.post<ApiResponse<{ user: any; token: string }>>(
    '/auth/login',
    credentials
  );
  const payload = response.data.data;
  if (!payload || !payload.token) {
    throw new Error('Invalid authentication response from server');
  }
  return {
    user: normalizeUser(payload.user),
    token: payload.token,
  };
};

/**
 * Fetches current authenticated user via GET /auth/me
 */
export const getMeApi = async (): Promise<AuthUser> => {
  const response = await apiClient.get<ApiResponse<any>>('/auth/me');
  const rawUser = response.data.data;
  return normalizeUser(rawUser);
};
