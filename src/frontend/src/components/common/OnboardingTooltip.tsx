import React, { useState, useEffect } from 'react';
import {
  Popper,
  Paper,
  Typography,
  Button,
  Box,
  IconButton,
  Backdrop,
  Fade,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowForward as NextIcon,
  ArrowBack as PrevIcon,
  School as TipIcon,
} from '@mui/icons-material';

export interface OnboardingStep {
  id: string;
  target: string; // CSS selector or element ID
  title: string;
  description: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  offset?: [number, number];
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface OnboardingTooltipProps {
  steps: OnboardingStep[];
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
  storageKey?: string;
}

export const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({
  steps,
  isOpen,
  onComplete,
  onSkip,
  storageKey = 'onboarding-completed',
}) => {
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    if (!isOpen || !step) return;

    const target = document.querySelector(step.target) as HTMLElement;
    if (target) {
      setAnchorEl(target);
      
      // Scroll to element if it's not visible
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
      
      // Add highlight class
      target.classList.add('onboarding-highlight');
      target.style.position = 'relative';
      target.style.zIndex = '1301'; // Above backdrop
    }

    return () => {
      if (target) {
        target.classList.remove('onboarding-highlight');
        target.style.position = '';
        target.style.zIndex = '';
      }
    };
  }, [step, isOpen, currentStep]);

  const handleNext = () => {
    if (step?.action) {
      step.action.onClick();
    }
    
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleComplete = () => {
    if (storageKey) {
      localStorage.setItem(storageKey, 'true');
    }
    onComplete();
  };

  const handleSkip = () => {
    if (storageKey) {
      localStorage.setItem(storageKey, 'true');
    }
    onSkip();
  };

  if (!isOpen || !step || !anchorEl) {
    return null;
  }

  return (
    <>
      {/* Global styles for highlight effect */}
      <style>{`
        .onboarding-highlight {
          box-shadow: 0 0 0 4px ${theme.palette.primary.main}40, 
                      0 0 0 8px ${theme.palette.primary.main}20 !important;
          border-radius: 8px !important;
          transition: all 0.3s ease-in-out !important;
        }
        
        .onboarding-backdrop {
          background-color: rgba(0, 0, 0, 0.7) !important;
        }
      `}</style>

      {/* Backdrop to dim other elements */}
      <Backdrop
        open={isOpen}
        className="onboarding-backdrop"
        sx={{
          zIndex: 1300,
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          }
        }}
      />

      {/* Tooltip */}
      <Popper
        open={isOpen}
        anchorEl={anchorEl}
        placement={step.placement || 'bottom'}
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: step.offset || [0, 8],
            },
          },
          {
            name: 'preventOverflow',
            options: {
              boundary: 'viewport',
              padding: 8,
            },
          },
        ]}
        style={{ zIndex: 1400 }}
      >
        <Fade in={isOpen} timeout={300}>
          <Paper
            elevation={8}
            sx={{
              p: 3,
              maxWidth: 360,
              backgroundColor: 'background.paper',
              border: `2px solid ${theme.palette.primary.main}`,
              borderRadius: 2,
              position: 'relative',
            }}
          >
            {/* Close button */}
            <IconButton
              size="small"
              onClick={handleSkip}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: 'text.secondary',
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, pr: 3 }}>
              <TipIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                {step.title}
              </Typography>
            </Box>

            {/* Description */}
            <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6 }}>
              {step.description}
            </Typography>

            {/* Progress indicator */}
            <Box sx={{ display: 'flex', gap: 0.5, mb: 3 }}>
              {steps.map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: index <= currentStep ? 'primary.main' : 'action.disabled',
                    transition: 'background-color 0.2s',
                  }}
                />
              ))}
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Button
                  size="small"
                  onClick={handleSkip}
                  sx={{ color: 'text.secondary' }}
                >
                  Skip Tour
                </Button>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                {!isFirstStep && (
                  <Button
                    size="small"
                    startIcon={<PrevIcon />}
                    onClick={handlePrev}
                    variant="outlined"
                  >
                    Back
                  </Button>
                )}
                <Button
                  size="small"
                  endIcon={isLastStep ? undefined : <NextIcon />}
                  onClick={handleNext}
                  variant="contained"
                >
                  {step.action?.label || (isLastStep ? 'Finish' : 'Next')}
                </Button>
              </Box>
            </Box>

            {/* Step counter */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                position: 'absolute',
                bottom: 8,
                left: 16,
                fontSize: '0.7rem',
              }}
            >
              {currentStep + 1} of {steps.length}
            </Typography>
          </Paper>
        </Fade>
      </Popper>
    </>
  );
};