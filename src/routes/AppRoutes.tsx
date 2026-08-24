import React from 'react';
import { Routes, Route, Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import { MainLayout } from '../layouts/MainLayout';

const HomePage: React.FC = () => (
  <Paper sx={{ p: 4, textAlign: 'center' }}>
    <Typography variant="h3" component="h1" gutterBottom color="primary">
      Task Management Application
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
      Welcome to your productivity workspace. Clean, fast, and secure task management.
    </Typography>
    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
      <Button variant="contained" color="primary" component={RouterLink} to="/tasks">
        View Dashboard
      </Button>
    </Box>
  </Paper>
);

const TasksPage: React.FC = () => (
  <Paper sx={{ p: 4 }}>
    <Typography variant="h4" component="h1" gutterBottom color="primary">
      Tasks Dashboard
    </Typography>
    <Typography variant="body1" color="text.secondary">
      Task management dashboard UI ready for feature integration.
    </Typography>
  </Paper>
);

const NotFoundPage: React.FC = () => (
  <Paper sx={{ p: 4, textAlign: 'center' }}>
    <Typography variant="h3" color="error" gutterBottom>
      404 - Page Not Found
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
      The page you are looking for does not exist.
    </Typography>
    <Button variant="contained" component={RouterLink} to="/">
      Back to Home
    </Button>
  </Paper>
);

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
