import React, { ReactNode } from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Button,
  useTheme,
  Slide,
  Backdrop,
  useMediaQuery,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface BottomSheetModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  actionColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  maxWidth?: number;
  showCloseButton?: boolean;
}

export const BottomSheetModal: React.FC<BottomSheetModalProps> = ({
  open,
  onClose,
  title,
  children,
  actionLabel,
  onAction,
  actionDisabled = false,
  actionColor = 'primary',
  maxWidth = 600,
  showCloseButton = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleBackdropClick = () => {
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 300,
        onClick: handleBackdropClick,
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
        },
      }}
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 1300,
      }}
    >
      <Slide direction="up" in={open} timeout={300}>
        <Box
          sx={{
            width: '100%',
            maxWidth: isMobile ? '100%' : maxWidth,
            maxHeight: '90vh',
            backgroundColor: 'background.paper',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderBottomLeftRadius: isMobile ? 0 : 12,
            borderBottomRightRadius: isMobile ? 0 : 12,
            outline: 'none',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.1)',
            margin: isMobile ? 0 : 2,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 3,
              py: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
              flexShrink: 0,
            }}
          >
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {actionLabel && onAction && (
                <Button
                  variant="contained"
                  color={actionColor}
                  onClick={onAction}
                  disabled={actionDisabled}
                  size="small"
                >
                  {actionLabel}
                </Button>
              )}
              {showCloseButton && (
                <IconButton
                  onClick={onClose}
                  size="small"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              )}
            </Box>
          </Box>

          {/* Content */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              px: 3,
              py: 2,
            }}
          >
            {children}
          </Box>

          {/* Bottom actions if not in header */}
          {!actionLabel && onAction && (
            <Box
              sx={{
                px: 3,
                py: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2,
                flexShrink: 0,
              }}
            >
              <Button onClick={onClose} color="inherit">
                Cancel
              </Button>
              <Button
                variant="contained"
                color={actionColor}
                onClick={onAction}
                disabled={actionDisabled}
              >
                Save
              </Button>
            </Box>
          )}
        </Box>
      </Slide>
    </Modal>
  );
};

export default BottomSheetModal;