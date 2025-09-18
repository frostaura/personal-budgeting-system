import React from 'react';
import { Typography, Box, Card, CardContent } from '@mui/material';

const ScenariosPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Financial Scenarios
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Compare different what-if scenarios for your financial future
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Scenario Planning
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Scenario comparison tools will be implemented here
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ScenariosPage;
