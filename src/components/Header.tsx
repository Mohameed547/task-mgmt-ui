import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  InputBase,
  Avatar,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import Brightness4 from '@mui/icons-material/Brightness4';
import Brightness7 from '@mui/icons-material/Brightness7';
import NotificationsNone from '@mui/icons-material/NotificationsNone';
import { useAppTheme } from '../theme/ThemeContext';

export interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const theme = useTheme();
  const { mode, toggleThemeMode } = useAppTheme();

  return (
    <AppBar
      component="header"
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        zIndex: theme.zIndex.drawer - 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64 }}>
        {/* Left Side: Mobile Menu Button & Search */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            color="inherit"
            aria-label="open navigation menu"
            edge="start"
            onClick={onMobileMenuToggle}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Search Input Bar */}
          <Box
            sx={{
              position: 'relative',
              borderRadius: 1.5,
              backgroundColor: alpha(theme.palette.text.primary, 0.05),
              '&:hover': {
                backgroundColor: alpha(theme.palette.text.primary, 0.08),
              },
              width: { xs: '160px', sm: '280px', md: '360px' },
              display: 'flex',
              alignItems: 'center',
              px: 1.5,
              py: 0.5,
            }}
          >
            <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
            <InputBase
              placeholder="Search tasks, projects..."
              inputProps={{ 'aria-label': 'Search tasks, projects' }}
              sx={{
                width: '100%',
                fontSize: '0.875rem',
                color: 'text.primary',
              }}
            />
          </Box>
        </Box>

        {/* Right Side: Actions (Notifications, Theme Toggle, User Avatar) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Notifications">
            <IconButton color="inherit" aria-label="Notifications" size="medium">
              <NotificationsNone />
            </IconButton>
          </Tooltip>

          <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
            <IconButton
              onClick={toggleThemeMode}
              color="inherit"
              aria-label="toggle dark/light mode"
              size="medium"
            >
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>

          {/* User Profile Avatar */}
          <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="User Profile">
              <IconButton aria-label="User Profile" size="small">
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: theme.palette.primary.main,
                    fontSize: '0.875rem',
                    fontWeight: 700,
                  }}
                >
                  JD
                </Avatar>
              </IconButton>
            </Tooltip>
            <Typography
              variant="subtitle2"
              sx={{ display: { xs: 'none', lg: 'block' }, fontWeight: 600 }}
            >
              John Doe
            </Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
