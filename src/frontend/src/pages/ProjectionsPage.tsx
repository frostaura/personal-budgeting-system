import React from 'react';
import { Typography, Box, Card, CardContent } from '@mui/material';

const ProjectionsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Financial Projections
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Deterministic projections of your financial future
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Projection Engine
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Projection calculations and charts will be implemented here
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProjectionsPage;
