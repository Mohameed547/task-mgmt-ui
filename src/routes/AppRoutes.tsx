import React from 'react';
import { Routes, Route, Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import { MainLayout } from '../layouts/MainLayout';
import { LoginPage, RegisterPage, ProtectedRoute, PublicOnlyRoute } from '../features/auth';
import { TasksPage } from '../features/tasks';

const ProjectsPage: React.FC = () => (
  <Paper sx={{ p: 4 }}>
    <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
      Projects Overview
    </Typography>
    <Typography variant="body1" color="text.secondary">
      Project management board ready for feature integration.
    </Typography>
  </Paper>
);

const SettingsPage: React.FC = () => (
  <Paper sx={{ p: 4 }}>
    <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
      Workspace Settings
    </Typography>
    <Typography variant="body1" color="text.secondary">
      Configure your workspace team members, preferences, and integrations.
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
      Back to Workspace
    </Button>
  </Paper>
);

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public-Only Routes */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected Workspace Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<TasksPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
