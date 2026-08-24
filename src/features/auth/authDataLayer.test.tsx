import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiClient } from '../../lib/apiClient';
import { AllTheProviders } from '../../test/testUtils';
import {
  loginApi,
  registerApi,
  getMeApi,
  tokenStorage,
  useAuth,
  LoginCredentials,
  RegisterData,
  AuthUser,
} from './index';

describe('Auth Feature Data Layer', () => {
  const mockUser: AuthUser = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'USER',
    createdAt: '2026-08-24T12:00:00.000Z',
  };

  const mockToken = 'mock-jwt-token-xyz';

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Axios API Functions', () => {
    it('loginApi sends POST /auth/login and returns user & token on success', async () => {
      const credentials: LoginCredentials = { email: 'test@example.com', password: 'password123' };
      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
        data: {
          status: 'success',
          message: 'Login successful',
          data: { user: mockUser, token: mockToken },
        },
      });

      const result = await loginApi(credentials);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual({ user: mockUser, token: mockToken });
    });

    it('loginApi throws error when server returns invalid or failed response', async () => {
      const credentials: LoginCredentials = { email: 'wrong@example.com', password: 'badpassword' };
      vi.spyOn(apiClient, 'post').mockRejectedValueOnce({
        status: 'fail',
        statusCode: 401,
        message: 'Invalid email or password',
      });

      await expect(loginApi(credentials)).rejects.toEqual({
        status: 'fail',
        statusCode: 401,
        message: 'Invalid email or password',
      });
    });

    it('registerApi sends POST /auth/register and returns new user on success', async () => {
      const registerData: RegisterData = { name: 'New User', email: 'new@example.com', password: 'password123' };
      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
        data: {
          status: 'success',
          message: 'User registered successfully',
          data: mockUser,
        },
      });

      const result = await registerApi(registerData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', registerData);
      expect(result).toEqual(mockUser);
    });

    it('registerApi throws error when email already exists', async () => {
      const registerData: RegisterData = { name: 'New User', email: 'existing@example.com', password: 'password123' };
      vi.spyOn(apiClient, 'post').mockRejectedValueOnce({
        status: 'fail',
        statusCode: 409,
        message: 'User with this email already exists',
      });

      await expect(registerApi(registerData)).rejects.toEqual({
        status: 'fail',
        statusCode: 409,
        message: 'User with this email already exists',
      });
    });

    it('getMeApi sends GET /auth/me and returns current user profile', async () => {
      tokenStorage.setToken(mockToken);
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: {
          status: 'success',
          message: 'User profile retrieved successfully',
          data: mockUser,
        },
      });

      const result = await getMeApi();

      expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUser);
    });
  });

  describe('AuthProvider & useAuth Context State', () => {
    it('handles successful login and stores token & user state', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
        data: {
          status: 'success',
          message: 'Login successful',
          data: { user: mockUser, token: mockToken },
        },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AllTheProviders,
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();

      await act(async () => {
        await result.current.login({ email: 'test@example.com', password: 'password123' });
      });

      expect(tokenStorage.getToken()).toBe(mockToken);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it('handles failed login without persisting token or changing auth state', async () => {
      vi.spyOn(apiClient, 'post').mockRejectedValueOnce({
        status: 'fail',
        statusCode: 401,
        message: 'Invalid email or password',
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AllTheProviders,
      });

      await expect(
        act(async () => {
          await result.current.login({ email: 'bad@example.com', password: 'wrongpassword' });
        })
      ).rejects.toEqual({
        status: 'fail',
        statusCode: 401,
        message: 'Invalid email or password',
      });

      expect(tokenStorage.getToken()).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('handles successful registration', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
        data: {
          status: 'success',
          message: 'User registered successfully',
          data: mockUser,
        },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AllTheProviders,
      });

      let registeredUser: AuthUser | null = null;
      await act(async () => {
        registeredUser = await result.current.register({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        });
      });

      expect(registeredUser).toEqual(mockUser);
    });

    it('handles failed registration', async () => {
      vi.spyOn(apiClient, 'post').mockRejectedValueOnce({
        status: 'fail',
        statusCode: 409,
        message: 'User with this email already exists',
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AllTheProviders,
      });

      await expect(
        act(async () => {
          await result.current.register({
            name: 'Test User',
            email: 'existing@example.com',
            password: 'password123',
          });
        })
      ).rejects.toEqual({
        status: 'fail',
        statusCode: 409,
        message: 'User with this email already exists',
      });
    });

    it('retrieves authenticated user profile on mount if token exists', async () => {
      tokenStorage.setToken(mockToken);
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: {
          status: 'success',
          message: 'User profile retrieved successfully',
          data: mockUser,
        },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AllTheProviders,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
    });

    it('clears token and marks unauthenticated if token is invalid or expired', async () => {
      tokenStorage.setToken('expired-invalid-token');
      vi.spyOn(apiClient, 'get').mockRejectedValueOnce({
        status: 'fail',
        statusCode: 401,
        message: 'Authentication required',
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AllTheProviders,
      });

      await waitFor(() => {
        expect(tokenStorage.getToken()).toBeNull();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('logout clears token and resets user authentication state', async () => {
      tokenStorage.setToken(mockToken);
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: {
          status: 'success',
          message: 'User profile retrieved successfully',
          data: mockUser,
        },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AllTheProviders,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      act(() => {
        result.current.logout();
      });

      expect(tokenStorage.getToken()).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });
});
