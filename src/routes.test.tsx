import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppRoutes } from './routes/AppRoutes';
import { renderWithProviders } from './test/testUtils';

describe('Router Setup', () => {
  it('renders Home Page on root route "/"', () => {
    renderWithProviders(<AppRoutes />, { initialEntries: ['/'] });
    expect(screen.getByRole('heading', { level: 1, name: /Task Management Application/i })).toBeInTheDocument();
    expect(screen.getByText(/View Dashboard/i)).toBeInTheDocument();
  });

  it('renders Tasks Page on "/tasks" route', () => {
    renderWithProviders(<AppRoutes />, { initialEntries: ['/tasks'] });
    expect(screen.getByRole('heading', { level: 1, name: /Tasks Dashboard/i })).toBeInTheDocument();
  });

  it('renders NotFound Page on unknown route', () => {
    renderWithProviders(<AppRoutes />, { initialEntries: ['/non-existent-route'] });
    expect(screen.getByText(/404 - Page Not Found/i)).toBeInTheDocument();
  });
});
