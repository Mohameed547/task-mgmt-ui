import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  IconButton,
  Divider,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import Dashboard from '@mui/icons-material/Dashboard';
import Assignment from '@mui/icons-material/Assignment';
import Folder from '@mui/icons-material/Folder';
import Settings from '@mui/icons-material/Settings';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import TaskAlt from '@mui/icons-material/TaskAlt';
import { Link as RouterLink, useLocation } from 'react-router-dom';

export const DRAWER_WIDTH = 260;
export const COLLAPSED_DRAWER_WIDTH = 68;

export interface SidebarNavProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  desktopCollapsed: boolean;
  onDesktopToggle: () => void;
}

export const navItems = [
  { label: 'Dashboard', path: '/', icon: <Dashboard /> },
  { label: 'Tasks', path: '/tasks', icon: <Assignment /> },
  { label: 'Projects', path: '/projects', icon: <Folder /> },
  { label: 'Settings', path: '/settings', icon: <Settings /> },
];

export const SidebarNav: React.FC<SidebarNavProps> = ({
  mobileOpen,
  onMobileClose,
  desktopCollapsed,
  onDesktopToggle,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const drawerContent = (
    <Box
      component="aside"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      {/* Sidebar Header / Logo */}
      <Box
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: desktopCollapsed && !isMobile ? 'center' : 'space-between',
          px: desktopCollapsed && !isMobile ? 1 : 2,
        }}
      >
        <Box
          component={RouterLink}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
            overflow: 'hidden',
          }}
          aria-label="TaskManager Workspace Home"
        >
          <TaskAlt color="primary" sx={{ fontSize: 28, flexShrink: 0 }} />
          {(!desktopCollapsed || isMobile) && (
            <Typography
              variant="h6"
              sx={{
                ml: 1.5,
                fontWeight: 700,
                letterSpacing: -0.5,
                whiteSpace: 'nowrap',
                color: theme.palette.text.primary,
              }}
            >
              TaskManager
            </Typography>
          )}
        </Box>

        {!isMobile && (
          <Tooltip title={desktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <IconButton
              onClick={onDesktopToggle}
              size="small"
              aria-label={desktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!desktopCollapsed}
            >
              {desktopCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Divider />

      {/* Navigation Links */}
      <Box component="nav" aria-label="Sidebar Navigation" sx={{ flexGrow: 1, py: 1 }}>
        <List disablePadding>
          {navItems.map((item) => {
            const isSelected = location.pathname === item.path;
            const linkContent = (
              <ListItem disablePadding key={item.path} sx={{ display: 'block' }}>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  selected={isSelected}
                  onClick={isMobile ? onMobileClose : undefined}
                  aria-label={item.label}
                  aria-current={isSelected ? 'page' : undefined}
                  sx={{
                    minHeight: 48,
                    justifyContent: desktopCollapsed && !isMobile ? 'center' : 'initial',
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: desktopCollapsed && !isMobile ? 'auto' : 2,
                      justifyContent: 'center',
                      color: isSelected ? theme.palette.primary.main : theme.palette.text.secondary,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {(!desktopCollapsed || isMobile) && (
                    <ListItemText
                      primary={item.label}
                      slotProps={{
                        primary: {
                          fontSize: '0.875rem',
                          fontWeight: isSelected ? 600 : 500,
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );

            return desktopCollapsed && !isMobile ? (
              <Tooltip key={item.path} title={item.label} placement="right">
                {linkContent}
              </Tooltip>
            ) : (
              linkContent
            );
          })}
        </List>
      </Box>

      <Divider />

      {/* Sidebar Footer info */}
      {(!desktopCollapsed || isMobile) && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Jira-Inspired Workspace v1.0
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      {/* Mobile Temporary Drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onMobileClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        /* Desktop Persistent Responsive Drawer */
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: desktopCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH,
            flexShrink: 0,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: desktopCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};
