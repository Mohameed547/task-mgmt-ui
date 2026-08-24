import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppRoutes } from './routes/AppRoutes';
import { renderWithProviders } from './test/testUtils';

describe('Router Setup', () => {
  it('renders Home Page on root route "/"', () => {
    renderWithProviders(<AppRoutes />, { initialEntries: ['/'] });
    expect(screen.getByRole('heading', { level: 1, name: /Workspace Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Create Task/i })).toBeInTheDocument();
  });

  it('renders Tasks Page on "/tasks" route', () => {
    renderWithProviders(<AppRoutes />, { initialEntries: ['/tasks'] });
    expect(screen.getByRole('heading', { level: 1, name: /Tasks Board/i })).toBeInTheDocument();
  });

  it('renders NotFound Page on unknown route', () => {
    renderWithProviders(<AppRoutes />, { initialEntries: ['/non-existent-route'] });
    expect(screen.getByText(/404 - Page Not Found/i)).toBeInTheDocument();
  });
});
