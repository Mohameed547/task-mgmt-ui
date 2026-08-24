import { screen, fireEvent, within, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AppRoutes } from './routes/AppRoutes';
import { renderWithProviders } from './test/testUtils';
import { tokenStorage } from './features/auth';
import { apiClient } from './lib/apiClient';

describe('Sidebar & Navigation Behavior', () => {
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

  it('renders all navigation links (Dashboard, Tasks, Projects, Settings)', async () => {
    renderWithProviders(<AppRoutes />, { initialEntries: ['/'] });

    await waitFor(() => {
      const sidebar = screen.getByRole('navigation', { name: /Sidebar Navigation/i });
      expect(within(sidebar).getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
      expect(within(sidebar).getByRole('link', { name: 'Tasks' })).toBeInTheDocument();
      expect(within(sidebar).getByRole('link', { name: 'Projects' })).toBeInTheDocument();
      expect(within(sidebar).getByRole('link', { name: 'Settings' })).toBeInTheDocument();
    });
  });

  it('highlights current active route page link', async () => {
    renderWithProviders(<AppRoutes />, { initialEntries: ['/tasks'] });

    await waitFor(() => {
      const sidebar = screen.getByRole('navigation', { name: /Sidebar Navigation/i });
      const tasksLink = within(sidebar).getByRole('link', { name: 'Tasks' });
      expect(tasksLink).toHaveAttribute('aria-current', 'page');
    });
  });

  it('renders collapse sidebar button on desktop', async () => {
    renderWithProviders(<AppRoutes />, { initialEntries: ['/'] });

    await waitFor(() => {
      const collapseBtn = screen.getByRole('button', { name: /Collapse sidebar/i });
      expect(collapseBtn).toBeInTheDocument();
      expect(collapseBtn).toHaveAttribute('aria-expanded', 'true');

      fireEvent.click(collapseBtn);
      expect(screen.getByRole('button', { name: /Expand sidebar/i })).toBeInTheDocument();
    });
  });
});
