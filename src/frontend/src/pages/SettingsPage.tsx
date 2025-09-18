import React, { useState } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Palette as PaletteIcon,
  Accessibility as AccessibilityIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  GetApp as ExportIcon,
  Publish as ImportIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  updateTheme,
  updateAccessibility,
  updateNotifications,
  updatePrivacy,
  updateAutoSave,
} from '@/store/slices/settingsSlice';
import { dataService } from '@/services/dataService';
import { formatCurrency } from '@/utils/currency';

const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(state => state.settings);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const handleThemeChange = (key: string, value: string) => {
    dispatch(updateTheme({ [key]: value }));
  };

  const handleAccessibilityChange = (key: string, value: boolean) => {
    dispatch(updateAccessibility({ [key]: value }));
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    if (key === 'enabled') {
      dispatch(updateNotifications({ enabled: value }));
    } else {
      dispatch(
        updateNotifications({
          types: { ...settings.notifications.types, [key]: value },
        })
      );
    }
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    dispatch(updatePrivacy({ [key]: value }));
  };

  const handleAutoSaveChange = (enabled: boolean) => {
    dispatch(updateAutoSave({ enabled }));
  };

  const handleExportData = async () => {
    try {
      const data = await dataService.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `personal-finance-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportMessage('Data exported successfully!');
      setTimeout(() => setExportMessage(null), 3000);
    } catch (error) {
      setExportMessage('Failed to export data');
      setTimeout(() => setExportMessage(null), 3000);
    }
  };

  const handleImportData = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await dataService.importData(data);
      setImportMessage('Data imported successfully! Please refresh the page.');
      setTimeout(() => setImportMessage(null), 5000);
    } catch (error) {
      setImportMessage('Failed to import data. Please check the file format.');
      setTimeout(() => setImportMessage(null), 3000);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Configure your preferences and application settings
      </Typography>

      {exportMessage && (
        <Alert
          severity={exportMessage.includes('Failed') ? 'error' : 'success'}
          sx={{ mb: 3 }}
        >
          {exportMessage}
        </Alert>
      )}

      {importMessage && (
        <Alert
          severity={importMessage.includes('Failed') ? 'error' : 'success'}
          sx={{ mb: 3 }}
        >
          {importMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Theme Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PaletteIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Appearance</Typography>
              </Box>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Theme Mode</InputLabel>
                <Select
                  value={settings.theme.mode}
                  onChange={e => handleThemeChange('mode', e.target.value)}
                  label="Theme Mode"
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Primary Color"
                type="color"
                value={settings.theme.primaryColor}
                onChange={e =>
                  handleThemeChange('primaryColor', e.target.value)
                }
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth>
                <InputLabel>Contrast Mode</InputLabel>
                <Select
                  value={settings.theme.contrastMode}
                  onChange={e =>
                    handleThemeChange('contrastMode', e.target.value)
                  }
                  label="Contrast Mode"
                >
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="high">High Contrast</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Accessibility Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AccessibilityIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Accessibility</Typography>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.accessibility.reduceMotion}
                    onChange={e =>
                      handleAccessibilityChange(
                        'reduceMotion',
                        e.target.checked
                      )
                    }
                  />
                }
                label="Reduce Motion"
                sx={{ mb: 1, display: 'block' }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.accessibility.highContrast}
                    onChange={e =>
                      handleAccessibilityChange(
                        'highContrast',
                        e.target.checked
                      )
                    }
                  />
                }
                label="High Contrast"
                sx={{ mb: 1, display: 'block' }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.accessibility.screenReaderOptimized}
                    onChange={e =>
                      handleAccessibilityChange(
                        'screenReaderOptimized',
                        e.target.checked
                      )
                    }
                  />
                }
                label="Screen Reader Optimized"
                sx={{ mb: 1, display: 'block' }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.accessibility.keyboardNavigation}
                    onChange={e =>
                      handleAccessibilityChange(
                        'keyboardNavigation',
                        e.target.checked
                      )
                    }
                  />
                }
                label="Enhanced Keyboard Navigation"
                sx={{ display: 'block' }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <NotificationsIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Notifications</Typography>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.enabled}
                    onChange={e =>
                      handleNotificationChange('enabled', e.target.checked)
                    }
                  />
                }
                label="Enable Notifications"
                sx={{ mb: 2, display: 'block' }}
              />

              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Notification Types
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.types.projectionUpdates}
                    onChange={e =>
                      handleNotificationChange(
                        'projectionUpdates',
                        e.target.checked
                      )
                    }
                    disabled={!settings.notifications.enabled}
                  />
                }
                label="Projection Updates"
                sx={{ mb: 1, display: 'block' }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.types.errors}
                    onChange={e =>
                      handleNotificationChange('errors', e.target.checked)
                    }
                    disabled={!settings.notifications.enabled}
                  />
                }
                label="Error Messages"
                sx={{ mb: 1, display: 'block' }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.types.warnings}
                    onChange={e =>
                      handleNotificationChange('warnings', e.target.checked)
                    }
                    disabled={!settings.notifications.enabled}
                  />
                }
                label="Warnings"
                sx={{ mb: 1, display: 'block' }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.types.milestones}
                    onChange={e =>
                      handleNotificationChange('milestones', e.target.checked)
                    }
                    disabled={!settings.notifications.enabled}
                  />
                }
                label="Financial Milestones"
                sx={{ display: 'block' }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Privacy & Data Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SecurityIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Privacy & Data</Typography>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoSave}
                    onChange={e => handleAutoSaveChange(e.target.checked)}
                  />
                }
                label="Auto-save Data"
                sx={{ mb: 2, display: 'block' }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.privacy.analyticsEnabled}
                    onChange={e =>
                      handlePrivacyChange('analyticsEnabled', e.target.checked)
                    }
                  />
                }
                label="Enable Analytics"
                sx={{ mb: 1, display: 'block' }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.privacy.errorReportingEnabled}
                    onChange={e =>
                      handlePrivacyChange(
                        'errorReportingEnabled',
                        e.target.checked
                      )
                    }
                  />
                }
                label="Error Reporting"
                sx={{ mb: 2, display: 'block' }}
              />

              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Data Management
              </Typography>

              <Box display="flex" gap={1} flexDirection="column">
                <Button
                  variant="outlined"
                  startIcon={<ExportIcon />}
                  onClick={handleExportData}
                  fullWidth
                >
                  Export Data
                </Button>

                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<ImportIcon />}
                  fullWidth
                >
                  Import Data
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    style={{ display: 'none' }}
                  />
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Currency Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SettingsIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Currency Settings</Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Currency Code"
                    value={settings.currency.code}
                    disabled
                    helperText="Currently fixed to ZAR"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Currency Symbol"
                    value={settings.currency.symbol}
                    disabled
                    helperText="Currently fixed to R"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Locale"
                    value={settings.currency.locale}
                    disabled
                    helperText="Currently fixed to en-ZA"
                  />
                </Grid>
              </Grid>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Rounding Step:{' '}
                {formatCurrency(settings.currency.roundingStepCents)}
                <Chip label="R500 increments" size="small" sx={{ ml: 1 }} />
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage;
