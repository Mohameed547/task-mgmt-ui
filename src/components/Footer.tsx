import React from 'react';
import { Box, Typography, Container, Divider } from '@mui/material';

export const Footer: React.FC = () => {
  return (
    <Box component="footer" sx={{ py: 3, mt: 'auto', backgroundColor: 'background.paper' }}>
      <Divider />
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} TaskManager Application. Clean Jira-inspired UI Foundation.
        </Typography>
      </Container>
    </Box>
  );
};
