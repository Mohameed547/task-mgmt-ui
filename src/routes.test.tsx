import { screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AppRoutes } from './routes/AppRoutes';
import { renderWithProviders } from './test/testUtils';
import { tokenStorage } from './features/auth';
import { apiClient } from './lib/apiClient';

describe('Router Setup', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();

    tokenStorage.setToken('mock-jwt-token');
    vi.spyOn(apiClient, 'get').mockImplementation((url) => {
      if (url === '/auth/me') {
        return Promise.resolve({
          data: {
            status: 'success',
            data: { id: '1', name: 'John Doe', email: 'john@example.com' },
          },
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders Home Page on root route "/" for authenticated user', async () => {
    renderWithProviders(<AppRoutes />, { initialEntries: ['/'] });

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Workspace Dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Create Task/i })).toBeInTheDocument();
    });
  });

  it('renders Tasks Page on "/tasks" route for authenticated user', async () => {
    renderWithProviders(<AppRoutes />, { initialEntries: ['/tasks'] });

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Tasks Board/i })).toBeInTheDocument();
    });
  });

  it('renders NotFound Page on unknown route', async () => {
    renderWithProviders(<AppRoutes />, { initialEntries: ['/non-existent-route'] });

    await waitFor(() => {
      expect(screen.getByText(/404 - Page Not Found/i)).toBeInTheDocument();
    });
  });
});
