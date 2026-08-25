import React, { useState } from 'react';
import { Box, Container, Breadcrumbs, Link as MuiLink, Typography } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import { Outlet, useLocation, Link as RouterLink } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SidebarNav } from '../components/SidebarNav';

export const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const location = useLocation();

  const handleMobileMenuToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleDesktopToggle = () => {
    setDesktopCollapsed((prev) => !prev);
  };

  // Generate breadcrumb items from location path
  const pathnames = location.pathname.split('/').filter((x) => x);
  const breadcrumbNameMap: Record<string, string> = {
    tasks: 'Tasks Board',
    projects: 'Projects Overview',
    settings: 'Workspace Settings',
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%', maxWidth: '100vw', overflowX: 'hidden', backgroundColor: 'background.default' }}>
      {/* Sidebar Navigation */}
      <SidebarNav
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        desktopCollapsed={desktopCollapsed}
        onDesktopToggle={handleDesktopToggle}
      />

      {/* Right Main Body (Header + Content + Footer) */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          width: { xs: '100%', md: `calc(100% - ${desktopCollapsed ? 68 : 260}px)` },
          maxWidth: '100%',
          minWidth: 0,
          minHeight: '100vh',
          transition: 'width 0.2s ease-in-out',
        }}
      >
        <Header onMobileMenuToggle={handleMobileMenuToggle} />

        {/* Main Workspace Container */}
        <Box component="main" sx={{ flexGrow: 1, py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
          <Container maxWidth="xl" disableGutters>
            {/* Dynamic Breadcrumbs */}
            <Breadcrumbs
              separator={<NavigateNext fontSize="small" />}
              aria-label="breadcrumb navigation"
              sx={{ mb: 2.5 }}
            >
              <MuiLink
                component={RouterLink}
                underline="hover"
                color="inherit"
                to="/"
                sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}
              >
                Dashboard
              </MuiLink>
              {pathnames.map((value, index) => {
                const last = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                const name = breadcrumbNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

                return last ? (
                  <Typography key={to} color="text.primary" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    {name}
                  </Typography>
                ) : (
                  <MuiLink
                    key={to}
                    component={RouterLink}
                    underline="hover"
                    color="inherit"
                    to={to}
                    sx={{ fontSize: '0.875rem' }}
                  >
                    {name}
                  </MuiLink>
                );
              })}
            </Breadcrumbs>

            {/* Page Outlet Content */}
            <Outlet />
          </Container>
        </Box>

        <Footer />
      </Box>
    </Box>
  );
};
