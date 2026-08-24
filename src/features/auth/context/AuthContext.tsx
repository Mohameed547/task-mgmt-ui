import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { AuthUser, LoginCredentials, RegisterData, LoginResponseData, AuthContextType } from '../types/auth.types';
import { tokenStorage } from '../api/authApi';
import { useMeQuery, useLoginMutation, useRegisterMutation, AUTH_QUERY_KEYS } from '../hooks/useAuthQueries';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(() => tokenStorage.getToken());
  const queryClient = useQueryClient();

  const meQuery = useMeQuery();
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();

  // If meQuery fails (e.g. 401 Unauthorized), clear invalid token
  useEffect(() => {
    if (meQuery.isError && token) {
      tokenStorage.removeToken();
      setTokenState(null);
      queryClient.setQueryData(AUTH_QUERY_KEYS.me, null);
    }
  }, [meQuery.isError, token, queryClient]);

  const user: AuthUser | null = token ? meQuery.data || null : null;
  const isAuthenticated = Boolean(token && user);
  const isLoading = Boolean(token && meQuery.isLoading);

  const login = async (credentials: LoginCredentials): Promise<LoginResponseData> => {
    const result = await loginMutation.mutateAsync(credentials);
    setTokenState(result.token);
    return result;
  };

  const register = async (data: RegisterData): Promise<AuthUser> => {
    return await registerMutation.mutateAsync(data);
  };

  const logout = () => {
    tokenStorage.removeToken();
    setTokenState(null);
    queryClient.setQueryData(AUTH_QUERY_KEYS.me, null);
    queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.me });
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
