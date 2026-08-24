import React from 'react';
import { Box, Paper, CircularProgress, Typography } from '@mui/material';
import { TableSkeleton } from './TableSkeleton';

export interface LoadingStateProps {
  message?: string;
  variant?: 'skeleton' | 'spinner';
  rows?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading workspace data...',
  variant = 'skeleton',
  rows = 5,
}) => {
  if (variant === 'skeleton') {
    return (
      <Box data-testid="ux-loading-state" role="status" aria-live="polite">
        <TableSkeleton rows={rows} />
      </Box>
    );
  }

  return (
    <Paper
      data-testid="ux-loading-state"
      role="status"
      aria-live="polite"
      elevation={1}
      sx={{
        p: 6,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 2,
        gap: 2,
      }}
    >
      <CircularProgress size={40} />
      <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 500 }}>
        {message}
      </Typography>
    </Paper>
  );
};
