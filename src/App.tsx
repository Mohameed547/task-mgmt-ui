import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AppThemeProvider } from './theme/ThemeContext';
import { AuthProvider } from './features/auth';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppThemeProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AppThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
