import React from 'react';
import { Box, Typography, Container, Divider } from '@mui/material';

export const Footer: React.FC = () => {
  return (
    <Box component="footer" sx={{ mt: 'auto', py: 3, backgroundColor: (theme) => theme.palette.background.paper }}>
      <Divider sx={{ mb: 2 }} />
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} Task Management Application. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};
