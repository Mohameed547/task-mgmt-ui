import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loginApi, registerApi, getMeApi, tokenStorage } from '../api/authApi';
import type { LoginCredentials, RegisterData, AuthUser, LoginResponseData } from '../types/auth.types';

export const AUTH_QUERY_KEYS = {
  me: ['auth', 'me'] as const,
};

/**
 * Custom query hook for fetching the current authenticated user profile
 */
export const useMeQuery = () => {
  const token = tokenStorage.getToken();
  return useQuery<AuthUser>({
    queryKey: AUTH_QUERY_KEYS.me,
    queryFn: getMeApi,
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Custom mutation hook for user login
 */
export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<LoginResponseData, Error, LoginCredentials>({
    mutationFn: loginApi,
    onSuccess: (data) => {
      tokenStorage.setToken(data.token);
      queryClient.setQueryData(AUTH_QUERY_KEYS.me, data.user);
    },
  });
};

/**
 * Custom mutation hook for user registration
 */
export const useRegisterMutation = () => {
  return useMutation<AuthUser, Error, RegisterData>({
    mutationFn: registerApi,
  });
};
