import React from 'react';
import { Typography, Box, Card, CardContent } from '@mui/material';

const AccountsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Financial Accounts
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your bank accounts, investments, and other financial accounts
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Accounts Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Account management interface will be implemented here with Material UI Data Grid
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AccountsPage;