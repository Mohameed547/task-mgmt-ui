import type { Components, Theme } from '@mui/material/styles';

export const components: Components<Omit<Theme, 'components'>> = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        padding: '6px 16px',
        textTransform: 'none',
        fontWeight: 600,
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.15)',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        border: '1px solid',
        borderColor: 'inherit',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      rounded: {
        borderRadius: 8,
      },
      elevation1: {
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        fontWeight: 600,
        fontSize: '0.75rem',
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        margin: '2px 8px',
        padding: '8px 12px',
        '&.Mui-selected': {
          fontWeight: 600,
        },
      },
    },
  },
};
