import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import App from './App';
import { tokenStorage } from './features/auth';
import { apiClient } from './lib/apiClient';

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders login page on root route when unauthenticated', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  it('renders workspace dashboard when user is authenticated', async () => {
    tokenStorage.setToken('mock-jwt-token');
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: {
        status: 'success',
        data: { id: '1', name: 'John Doe', email: 'john@example.com' },
      },
    });

    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Workspace Dashboard/i })).toBeInTheDocument();
    });
  });
});
