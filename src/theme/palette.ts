import type { PaletteOptions } from '@mui/material/styles';

export const lightPalette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: '#2563eb',
    light: '#60a5fa',
    dark: '#1d4ed8',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#475569',
    light: '#64748b',
    dark: '#334155',
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
  info: {
    main: '#0284c7',
  },
  warning: {
    main: '#d97706',
  },
  error: {
    main: '#dc2626',
  },
  success: {
    main: '#16a34a',
  },
};

export const darkPalette: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: '#3b82f6',
    light: '#93c5fd',
    dark: '#1d4ed8',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#94a3b8',
    light: '#cbd5e1',
    dark: '#64748b',
    contrastText: '#0f172a',
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
  info: {
    main: '#38bdf8',
  },
  warning: {
    main: '#fbbf24',
  },
  error: {
    main: '#f87171',
  },
  success: {
    main: '#4ade80',
  },
};
