import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  LinearProgress,
} from '@mui/material';
import { AccountBalanceWalletOutlined } from '@mui/icons-material';

interface LoadingScreenProps {
  message?: string;
  progress?: number;
  variant?: 'circular' | 'linear';
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading your financial data...',
  progress,
  variant = 'circular',
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 3,
      }}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <AccountBalanceWalletOutlined
        sx={{
          fontSize: 64,
          color: 'primary.main',
          mb: 3,
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': {
              opacity: 1,
            },
            '50%': {
              opacity: 0.5,
            },
            '100%': {
              opacity: 1,
            },
          },
        }}
      />

      <Typography
        variant="h6"
        gutterBottom
        sx={{
          color: 'text.primary',
          textAlign: 'center',
          mb: 3,
        }}
      >
        {message}
      </Typography>

      {variant === 'circular' && (
        <CircularProgress
          size={40}
          thickness={4}
          sx={{ color: 'primary.main' }}
          {...(progress !== undefined && {
            variant: 'determinate',
            value: progress,
          })}
        />
      )}

      {variant === 'linear' && (
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <LinearProgress
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'action.hover',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
              },
            }}
            {...(progress !== undefined && {
              variant: 'determinate',
              value: progress,
            })}
          />
          {progress !== undefined && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, textAlign: 'center' }}
            >
              {Math.round(progress)}%
            </Typography>
          )}
        </Box>
      )}

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 3, textAlign: 'center' }}
      >
        This should only take a moment...
      </Typography>
    </Box>
  );
};
