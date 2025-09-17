import React from 'react';
import { Typography, Box, Card, CardContent } from '@mui/material';

const CashflowsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Cash Flows
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Track your recurring income and expenses
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cash Flow Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cash flow tracking interface will be implemented here
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CashflowsPage;