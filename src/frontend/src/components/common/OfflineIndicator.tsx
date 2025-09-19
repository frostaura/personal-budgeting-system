import React from 'react';
import {
  Alert,
  AlertTitle,
  Button,
  Chip,
  Collapse,
  IconButton,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudOff as OfflineIcon,
  Wifi as OnlineIcon,
  Refresh as UpdateIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useServiceWorkerStatus, useServiceWorkerUpdate } from '@/services/serviceWorkerManager';

/**
 * Component that shows online/offline status and service worker updates
 */
export const OfflineIndicator: React.FC = () => {
  const status = useServiceWorkerStatus();
  const { update, applyUpdate } = useServiceWorkerUpdate();
  const [showOfflineAlert, setShowOfflineAlert] = React.useState(false);
  const [showUpdateSnackbar, setShowUpdateSnackbar] = React.useState(false);

  // Show offline alert when going offline
  React.useEffect(() => {
    if (!status.isOnline) {
      setShowOfflineAlert(true);
    } else {
      setShowOfflineAlert(false);
    }
  }, [status.isOnline]);

  // Show update notification when available
  React.useEffect(() => {
    if (update.isUpdateAvailable) {
      setShowUpdateSnackbar(true);
    }
  }, [update.isUpdateAvailable]);

  const handleApplyUpdate = () => {
    applyUpdate();
    setShowUpdateSnackbar(false);
  };

  const handleCloseUpdateSnackbar = () => {
    setShowUpdateSnackbar(false);
  };

  return (
    <>
      {/* Online/Offline Status Indicator */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 1300,
        }}
      >
        <Chip
          icon={status.isOnline ? <OnlineIcon /> : <OfflineIcon />}
          label={status.isOnline ? 'Online' : 'Offline'}
          color={status.isOnline ? 'success' : 'warning'}
          size="small"
          variant={status.isOnline ? 'outlined' : 'filled'}
        />
        
        {status.isRegistered && (
          <Chip
            icon={<DownloadIcon />}
            label="Offline Ready"
            color="info"
            size="small"
            variant="outlined"
          />
        )}
      </Stack>

      {/* Offline Alert */}
      <Collapse in={showOfflineAlert}>
        <Alert
          severity="warning"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setShowOfflineAlert(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{
            position: 'fixed',
            top: 64,
            left: 16,
            right: 16,
            zIndex: 1200,
            mx: 2,
          }}
        >
          <AlertTitle>You're offline</AlertTitle>
          <Typography variant="body2">
            Don't worry! Your data is saved locally and the app will continue to work.
            Changes will sync when you're back online.
          </Typography>
        </Alert>
      </Collapse>

      {/* Service Worker Update Notification */}
      <Snackbar
        open={showUpdateSnackbar}
        autoHideDuration={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={handleCloseUpdateSnackbar}
      >
        <Alert
          severity="info"
          action={
            <Stack direction="row" spacing={1}>
              <Button
                color="inherit"
                size="small"
                onClick={handleApplyUpdate}
                startIcon={<UpdateIcon />}
              >
                Update
              </Button>
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleCloseUpdateSnackbar}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          }
        >
          <AlertTitle>App Update Available</AlertTitle>
          <Typography variant="body2">
            A new version of the app is ready. Click update to get the latest features.
          </Typography>
        </Alert>
      </Snackbar>
    </>
  );
};