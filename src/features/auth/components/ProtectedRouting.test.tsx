import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderWithProviders } from '../../../test/testUtils';
import { apiClient } from '../../../lib/apiClient';
import { AppRoutes } from '../../../routes/AppRoutes';
import { tokenStorage } from '../api/authApi';

const mockApiGet = (url: string) => {
  if (url === '/auth/me') {
    return Promise.resolve({
      data: {
        status: 'success',
        data: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
      },
    });
  }
  if (url === '/tasks') {
    return Promise.resolve({
      data: {
        status: 'success',
        data: [],
      },
    });
  }
  return Promise.reject(new Error('Not found'));
};

describe('Protected Routing and Auth Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('unauthenticated redirect: redirects unauthenticated users from protected /tasks route to /login', async () => {
    renderWithProviders(<AppRoutes />, { initialEntries: ['/tasks'] });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.queryByText(/tasks board/i)).not.toBeInTheDocument();
    });
  });

  it('authenticated access: allows authenticated users to access protected /tasks route', async () => {
    tokenStorage.setToken('valid-jwt-token');
    vi.spyOn(apiClient, 'get').mockImplementation(mockApiGet as any);

    renderWithProviders(<AppRoutes />, { initialEntries: ['/tasks'] });

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /tasks board/i })).toBeInTheDocument();
    });
  });

  it('public-only redirect: redirects authenticated users away from /login to dashboard', async () => {
    tokenStorage.setToken('valid-jwt-token');
    vi.spyOn(apiClient, 'get').mockImplementation(mockApiGet as any);

    renderWithProviders(<AppRoutes />, { initialEntries: ['/login'] });

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /tasks board/i })).toBeInTheDocument();
    });
  });

  it('auth initialization loading: displays loading indicator while validating session', async () => {
    tokenStorage.setToken('valid-jwt-token');

    let resolveMe: any;
    const mePromise = new Promise((resolve) => {
      resolveMe = resolve;
    });

    vi.spyOn(apiClient, 'get').mockImplementationOnce(() => mePromise as any);

    renderWithProviders(<AppRoutes />, { initialEntries: ['/tasks'] });

    expect(screen.getByTestId('auth-loading-spinner')).toBeInTheDocument();
    expect(screen.getByText(/verifying session\.\.\./i)).toBeInTheDocument();

    // Cleanup promise
    resolveMe({
      data: {
        status: 'success',
        data: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
      },
    });
  });

  it('invalid session: handles expired or invalid session by clearing storage and redirecting to /login', async () => {
    tokenStorage.setToken('expired-invalid-token');

    vi.spyOn(apiClient, 'get').mockRejectedValueOnce({
      status: 'fail',
      statusCode: 401,
      message: 'Token is expired or invalid',
    });

    renderWithProviders(<AppRoutes />, { initialEntries: ['/'] });

    await waitFor(() => {
      expect(tokenStorage.getToken()).toBeNull();
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  it('logout behavior: logging out clears user session and redirects to /login', async () => {
    tokenStorage.setToken('valid-jwt-token');
    vi.spyOn(apiClient, 'get').mockImplementation(mockApiGet as any);

    renderWithProviders(<AppRoutes />, { initialEntries: ['/'] });

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /tasks board/i })).toBeInTheDocument();
    });

    // Open User Profile Menu in Header
    const userProfileButton = screen.getByRole('button', { name: /user profile/i });
    fireEvent.click(userProfileButton);

    // Click Log out menu item
    const logoutMenuItem = screen.getByText(/log out/i);
    fireEvent.click(logoutMenuItem);

    await waitFor(() => {
      expect(tokenStorage.getToken()).toBeNull();
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    });
  });
});
