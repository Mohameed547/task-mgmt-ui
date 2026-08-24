import type { PaletteOptions } from '@mui/material/styles';

export const lightPalette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: '#4f46e5',
    light: '#6366f1',
    dark: '#4338ca',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#ec4899',
    light: '#f472b6',
    dark: '#db2777',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f8fafc',
    paper: '#ffffff',
  },
  text: {
    primary: '#0f172a',
    secondary: '#475569',
  },
  divider: '#e2e8f0',
};

export const darkPalette: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: '#6366f1',
    light: '#818cf8',
    dark: '#4f46e5',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#f472b6',
    light: '#fbcfe8',
    dark: '#ec4899',
    contrastText: '#ffffff',
  },
  background: {
    default: '#0f172a',
    paper: '#1e293b',
  },
  text: {
    primary: '#f8fafc',
    secondary: '#94a3b8',
  },
  divider: '#334155',
};
