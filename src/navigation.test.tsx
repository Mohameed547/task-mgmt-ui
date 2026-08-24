import { screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppRoutes } from './routes/AppRoutes';
import { renderWithProviders } from './test/testUtils';

describe('Sidebar & Navigation Behavior', () => {
  it('renders all navigation links (Dashboard, Tasks, Projects, Settings)', () => {
    renderWithProviders(<AppRoutes />, { initialEntries: ['/'] });
    const sidebar = screen.getByRole('navigation', { name: /Sidebar Navigation/i });
    expect(within(sidebar).getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(within(sidebar).getByRole('link', { name: 'Tasks' })).toBeInTheDocument();
    expect(within(sidebar).getByRole('link', { name: 'Projects' })).toBeInTheDocument();
    expect(within(sidebar).getByRole('link', { name: 'Settings' })).toBeInTheDocument();
  });

  it('highlights current active route page link', () => {
    renderWithProviders(<AppRoutes />, { initialEntries: ['/tasks'] });
    const sidebar = screen.getByRole('navigation', { name: /Sidebar Navigation/i });
    const tasksLink = within(sidebar).getByRole('link', { name: 'Tasks' });
    expect(tasksLink).toHaveAttribute('aria-current', 'page');
  });

  it('renders collapse sidebar button on desktop', () => {
    renderWithProviders(<AppRoutes />, { initialEntries: ['/'] });
    const collapseBtn = screen.getByRole('button', { name: /Collapse sidebar/i });
    expect(collapseBtn).toBeInTheDocument();
    expect(collapseBtn).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(collapseBtn);
    expect(screen.getByRole('button', { name: /Expand sidebar/i })).toBeInTheDocument();
  });
});
