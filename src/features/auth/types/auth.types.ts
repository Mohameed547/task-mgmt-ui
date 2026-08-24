import type { ApiResponse } from '../../../types';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponseData {
  user: AuthUser;
  token: string;
}

export type AuthResponse<T = unknown> = ApiResponse<T>;

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResponseData>;
  register: (data: RegisterData) => Promise<AuthUser>;
  logout: () => void;
}
