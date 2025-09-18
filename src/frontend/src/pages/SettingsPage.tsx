import React from 'react';
import { Typography, Box, Card, CardContent } from '@mui/material';

const SettingsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Settings
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Configure your preferences and application settings
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Application Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Settings interface will be implemented here
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPage;
