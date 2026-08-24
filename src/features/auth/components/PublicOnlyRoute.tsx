import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';

export const PublicOnlyRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box
        data-testid="auth-loading-spinner"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
          gap: 2,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          Verifying session...
        </Typography>
      </Box>
    );
  }

  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};
