import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppThemeProvider } from '../theme/ThemeContext';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

interface AllTheProvidersProps {
  children: React.ReactNode;
  initialEntries?: string[];
}

export const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children, initialEntries = ['/'] }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </AppThemeProvider>
    </QueryClientProvider>
  );
};

export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { initialEntries?: string[] }
) => {
  const { initialEntries, ...renderOptions } = options || {};
  return render(ui, {
    wrapper: ({ children }) => <AllTheProviders initialEntries={initialEntries}>{children}</AllTheProviders>,
    ...renderOptions,
  });
};
