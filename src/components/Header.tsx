import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Button } from '@mui/material';
import { Brightness4, Brightness7, TaskAlt } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useAppTheme } from '../theme/ThemeContext';

export const Header: React.FC = () => {
  const { mode, toggleThemeMode } = useAppTheme();

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', flexGrow: 1 }}>
          <TaskAlt color="primary" sx={{ mr: 1, fontSize: 28 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 700, letterSpacing: -0.5 }}>
            TaskManager
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button component={RouterLink} to="/" color="inherit">
            Home
          </Button>
          <Button component={RouterLink} to="/tasks" color="inherit">
            Tasks
          </Button>
          <IconButton onClick={toggleThemeMode} color="inherit" aria-label="toggle dark/light mode">
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
