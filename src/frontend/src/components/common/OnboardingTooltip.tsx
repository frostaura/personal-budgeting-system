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

  // Cleanup function to remove all onboarding-related elements and styles
  const cleanupOnboarding = () => {
    try {
      // Remove any remaining onboarding backdrops
      const backdrops = document.querySelectorAll('.onboarding-backdrop');
      backdrops.forEach(backdrop => {
        try {
          backdrop.remove();
        } catch (error) {
          // Silently ignore if element is already removed
          console.debug('Backdrop already removed:', error);
        }
      });

      // Remove highlight styles from all elements
      const highlightedElements = document.querySelectorAll('.onboarding-highlight');
      highlightedElements.forEach(element => {
        try {
          element.classList.remove('onboarding-highlight');
          const htmlElement = element as HTMLElement;
          if (htmlElement && htmlElement.style) {
            htmlElement.style.position = '';
            htmlElement.style.zIndex = '';
            htmlElement.style.pointerEvents = '';
          }
        } catch (error) {
          // Silently ignore if element is already modified or removed
          console.debug('Element already cleaned up:', error);
        }
      });
    } catch (error) {
      // Catch any unexpected errors during cleanup
      console.debug('Error during onboarding cleanup:', error);
    }
  };

  useEffect(() => {
    if (!isOpen || !step) {
      // Cleanup when onboarding is closed or no step
      cleanupOnboarding();
      return;
    }

    try {
      const target = document.querySelector(step.target) as HTMLElement;
      if (target) {
        setAnchorEl(target);

        // Scroll to element if it's not visible
        try {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
          });
        } catch (scrollError) {
          console.debug('Error scrolling to target:', scrollError);
        }

        // Add highlight class
        try {
          target.classList.add('onboarding-highlight');
          target.style.position = 'relative';
          target.style.zIndex = '1301'; // Above backdrop (1300)
          target.style.pointerEvents = 'auto'; // Ensure highlighted element can be clicked
        } catch (styleError) {
          console.debug('Error styling target element:', styleError);
        }
      } else {
        console.debug('Target element not found:', step.target);
        setAnchorEl(null);
      }

      return () => {
        if (target) {
          try {
            target.classList.remove('onboarding-highlight');
            target.style.position = '';
            target.style.zIndex = '';
            target.style.pointerEvents = '';
          } catch (cleanupError) {
            console.debug('Error cleaning up target element:', cleanupError);
          }
        }
      };
    } catch (error) {
      console.debug('Error in onboarding step effect:', error);
      setAnchorEl(null);
      return () => {}; // Return empty cleanup function
    }
  }, [step, isOpen, currentStep]);

  // Cleanup on component unmount to prevent lingering overlays
  useEffect(() => {
    return () => {
      cleanupOnboarding();
    };
  }, []);

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
    try {
      cleanupOnboarding();
      if (storageKey) {
        localStorage.setItem(storageKey, 'true');
      }
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Still try to call onComplete even if cleanup fails
      try {
        onComplete();
      } catch (completeError) {
        console.error('Error in onComplete callback:', completeError);
      }
    }
  };

  const handleSkip = () => {
    try {
      cleanupOnboarding();
      if (storageKey) {
        localStorage.setItem(storageKey, 'true');
      }
      onSkip();
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      // Still try to call onSkip even if cleanup fails
      try {
        onSkip();
      } catch (skipError) {
        console.error('Error in onSkip callback:', skipError);
      }
    }
  };

  if (!isOpen || !step) {
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
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          background-color: rgba(0, 0, 0, 0.7) !important;
          z-index: 1300 !important;
          pointer-events: none !important;
        }
      `}</style>

      {/* Backdrop to dim other elements - allow pointer events to pass through */}
      <Backdrop
        open={isOpen}
        className="onboarding-backdrop"
        sx={{
          zIndex: 1300,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          pointerEvents: 'none', // Allow clicks to pass through
          '& .MuiBackdrop-root': {
            position: 'fixed',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            pointerEvents: 'none', // Allow clicks to pass through
          },
        }}
      />

      {/* Tooltip */}
      <Popper
        open={isOpen && !!anchorEl}
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
        <Fade in={isOpen && !!anchorEl} timeout={300}>
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
                    backgroundColor:
                      index <= currentStep ? 'primary.main' : 'action.disabled',
                    transition: 'background-color 0.2s',
                  }}
                />
              ))}
            </Box>

            {/* Actions */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
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
