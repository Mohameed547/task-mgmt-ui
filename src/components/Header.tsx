import React, { useState } from 'react';
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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import Brightness4 from '@mui/icons-material/Brightness4';
import Brightness7 from '@mui/icons-material/Brightness7';
import NotificationsNone from '@mui/icons-material/NotificationsNone';
import Logout from '@mui/icons-material/Logout';
import { useAppTheme } from '../theme/ThemeContext';
import { useAuth } from '../features/auth';

export interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const theme = useTheme();
  const { mode, toggleThemeMode } = useAppTheme();
  const { user, logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const userName = user?.name || 'Workspace User';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

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

          {/* User Profile Avatar & Menu */}
          <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="User Profile Menu">
              <IconButton
                aria-label="User Profile"
                size="small"
                onClick={handleProfileMenuOpen}
                aria-controls={isMenuOpen ? 'user-profile-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={isMenuOpen ? 'true' : undefined}
              >
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: theme.palette.primary.main,
                    fontSize: '0.875rem',
                    fontWeight: 700,
                  }}
                >
                  {userInitials}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Typography
              variant="subtitle2"
              sx={{ display: { xs: 'none', lg: 'block' }, fontWeight: 600 }}
            >
              {userName}
            </Typography>

            <Menu
              id="user-profile-menu"
              anchorEl={anchorEl}
              open={isMenuOpen}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              slotProps={{
                paper: {
                  elevation: 3,
                  sx: { minWidth: 160, mt: 1 },
                },
              }}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText primary="Log out" primaryTypographyProps={{ color: 'error.main', fontWeight: 600 }} />
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
