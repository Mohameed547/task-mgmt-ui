import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppRoutes } from './routes/AppRoutes';
import { renderWithProviders } from './test/testUtils';

describe('Responsive MainLayout Rendering', () => {
  it('renders header with search bar, notifications, and user avatar', () => {
    renderWithProviders(<AppRoutes />, { initialEntries: ['/'] });
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search tasks, projects/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Notifications/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /User Profile/i })).toBeInTheDocument();
  });

  it('renders sidebar navigation with brand title and items', () => {
    renderWithProviders(<AppRoutes />, { initialEntries: ['/'] });
    expect(screen.getByRole('navigation', { name: /Sidebar Navigation/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /TaskManager/i })).toBeInTheDocument();
  });

  it('renders main workspace content and dynamic breadcrumb', () => {
    renderWithProviders(<AppRoutes />, { initialEntries: ['/tasks'] });
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /breadcrumb navigation/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /Tasks Board/i })).toBeInTheDocument();
  });

  it('renders footer component', () => {
    renderWithProviders(<AppRoutes />, { initialEntries: ['/'] });
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
