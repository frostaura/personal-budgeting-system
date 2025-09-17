import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Alert,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  WarningAmberOutlined,
  InfoOutlined,
  SecurityOutlined,
  VisibilityOffOutlined,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { acceptDisclaimer } from '@/store/slices/settingsSlice';

export const DisclaimerDialog: React.FC = () => {
  const dispatch = useAppDispatch();
  const disclaimerAccepted = useAppSelector(state => state.settings.disclaimerAccepted);
  const [acknowledgedRisks, setAcknowledgedRisks] = useState(false);
  const [acknowledgedPrivacy, setAcknowledgedPrivacy] = useState(false);

  const handleAccept = () => {
    if (acknowledgedRisks && acknowledgedPrivacy) {
      dispatch(acceptDisclaimer());
    }
  };

  if (disclaimerAccepted) {
    return null;
  }

  const canAccept = acknowledgedRisks && acknowledgedPrivacy;

  return (
    <Dialog
      open={!disclaimerAccepted}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
        },
      }}
      aria-labelledby="disclaimer-dialog-title"
      aria-describedby="disclaimer-dialog-description"
    >
      <DialogTitle
        id="disclaimer-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          pb: 1,
        }}
      >
        <WarningAmberOutlined color="warning" />
        Important Legal Disclaimer
      </DialogTitle>
      
      <DialogContent dividers>
        <Box id="disclaimer-dialog-description">
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              This is NOT Financial Advice
            </Typography>
            <Typography variant="body2">
              This application is for educational and planning purposes only. 
              All projections, calculations, and recommendations should not be 
              considered as professional financial advice.
            </Typography>
          </Alert>

          <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
            Important Considerations:
          </Typography>

          <List dense>
            <ListItem>
              <ListItemIcon>
                <InfoOutlined color="info" />
              </ListItemIcon>
              <ListItemText
                primary="Projections are estimates only"
                secondary="All financial projections are based on assumptions and may not reflect actual future performance."
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <WarningAmberOutlined color="warning" />
              </ListItemIcon>
              <ListItemText
                primary="Investment risks"
                secondary="All investments carry risk of loss. Past performance does not guarantee future results."
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <SecurityOutlined color="info" />
              </ListItemIcon>
              <ListItemText
                primary="Tax and legal considerations"
                secondary="Tax rates and regulations may change. Consult a qualified professional for advice specific to your situation."
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <VisibilityOffOutlined color="info" />
              </ListItemIcon>
              <ListItemText
                primary="Data privacy"
                secondary="Your financial data is stored locally in your browser and is not transmitted to external servers."
              />
            </ListItem>
          </List>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Always consult with qualified financial professionals</strong> before making 
              important financial decisions. This tool should supplement, not replace, professional advice.
            </Typography>
          </Alert>

          <Box sx={{ mt: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={acknowledgedRisks}
                  onChange={(e) => setAcknowledgedRisks(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  I understand that this application provides estimates only and is not financial advice. 
                  I acknowledge the risks associated with financial planning and investments.
                </Typography>
              }
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={acknowledgedPrivacy}
                  onChange={(e) => setAcknowledgedPrivacy(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  I understand that my data is stored locally and I am responsible for my own data backups.
                </Typography>
              }
            />
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button
          variant="contained"
          onClick={handleAccept}
          disabled={!canAccept}
          size="large"
          sx={{ minWidth: 120 }}
        >
          I Understand & Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};