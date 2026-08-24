import React from 'react';
import { Paper, Alert, Button, AlertTitle } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Data',
  message = 'An unexpected error occurred while fetching information. Please verify your connection.',
  onRetry,
  retryText = 'Retry',
}) => {
  // Sanitize message to hide raw stack traces
  const cleanMessage =
    message.includes('Error:') || message.includes('at ')
      ? 'An unexpected network error occurred. Please try again.'
      : message;

  return (
    <Paper data-testid="ux-error-state" elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Alert
        severity="error"
        action={
          onRetry ? (
            <Button
              color="inherit"
              size="small"
              onClick={onRetry}
              startIcon={<RefreshIcon />}
              sx={{ fontWeight: 600, textTransform: 'none' }}
            >
              {retryText}
            </Button>
          ) : undefined
        }
      >
        <AlertTitle sx={{ fontWeight: 700 }}>{title}</AlertTitle>
        {cleanMessage}
      </Alert>
    </Paper>
  );
};
