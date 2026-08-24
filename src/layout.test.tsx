import { screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AppRoutes } from './routes/AppRoutes';
import { renderWithProviders } from './test/testUtils';
import { tokenStorage } from './features/auth';
import { apiClient } from './lib/apiClient';

describe('Responsive MainLayout Rendering', () => {
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

  it('renders header with search bar, notifications, and user avatar', async () => {
    renderWithProviders(<AppRoutes />, { initialEntries: ['/'] });

    await waitFor(() => {
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Search tasks, projects/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Notifications/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /User Profile/i })).toBeInTheDocument();
    });
  });

  it('renders sidebar navigation with brand title and items', async () => {
    renderWithProviders(<AppRoutes />, { initialEntries: ['/'] });

    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: /Sidebar Navigation/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /TaskManager/i })).toBeInTheDocument();
    });
  });

  it('renders main workspace content and dynamic breadcrumb', async () => {
    renderWithProviders(<AppRoutes />, { initialEntries: ['/tasks'] });

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: /breadcrumb navigation/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: /Tasks Board/i })).toBeInTheDocument();
    });
  });

  it('renders footer component', async () => {
    renderWithProviders(<AppRoutes />, { initialEntries: ['/'] });

    await waitFor(() => {
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });
  });
});
