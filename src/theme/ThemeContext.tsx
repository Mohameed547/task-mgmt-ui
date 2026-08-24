import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { lightPalette, darkPalette } from './palette';
import { typography } from './typography';
import { components } from './components';

type PaletteMode = 'light' | 'dark';

interface ThemeContextType {
  mode: PaletteMode;
  toggleThemeMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleThemeMode: () => {},
});

export const useAppTheme = () => useContext(ThemeContext);

interface AppThemeProviderProps {
  children: ReactNode;
}

export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<PaletteMode>('light');

  const toggleThemeMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: mode === 'light' ? lightPalette : darkPalette,
        typography,
        components,
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleThemeMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
