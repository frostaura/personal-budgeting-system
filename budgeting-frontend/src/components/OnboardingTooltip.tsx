import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Play } from 'lucide-react';
import { useOnboarding } from '../contexts/OnboardingContext';
import { OnboardingStep } from '../types/onboarding';
import '../styles/OnboardingTooltip.css';

interface Position {
  top: number;
  left: number;
}

interface OnboardingTooltipProps {
  step: OnboardingStep;
  stepNumber: number;
  totalSteps: number;
}

const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({ 
  step, 
  stepNumber, 
  totalSteps 
}) => {
  const { nextStep, previousStep, skipOnboarding } = useOnboarding();
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculatePositionAndHighlight = () => {
      const targetElement = document.querySelector(step.target);
      if (!targetElement || !tooltipRef.current) return;

      // Add highlight class to target element
      targetElement.classList.add('onboarding-highlight');
      
      // Scroll target into view
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center' 
      });

      // Calculate position
      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = 0;
      let left = 0;

      const offset = step.offset || { x: 0, y: 0 };
      const preferredPosition = step.position || 'bottom';

      // Calculate position based on preferred position
      switch (preferredPosition) {
        case 'top':
          top = targetRect.top - tooltipRect.height - 16 + offset.y;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2 + offset.x;
          break;
        case 'bottom':
          top = targetRect.bottom + 16 + offset.y;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2 + offset.x;
          break;
        case 'left':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2 + offset.y;
          left = targetRect.left - tooltipRect.width - 16 + offset.x;
          break;
        case 'right':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2 + offset.y;
          left = targetRect.right + 16 + offset.x;
          break;
        default:
          top = targetRect.bottom + 16 + offset.y;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2 + offset.x;
      }

      // Adjust for viewport boundaries
      if (left < 16) left = 16;
      if (left + tooltipRect.width > viewportWidth - 16) {
        left = viewportWidth - tooltipRect.width - 16;
      }
      if (top < 16) top = 16;
      if (top + tooltipRect.height > viewportHeight - 16) {
        top = viewportHeight - tooltipRect.height - 16;
      }

      setPosition({ top, left });
    };

    const removeHighlightFromTarget = () => {
      const targetElement = document.querySelector(step.target);
      if (targetElement) {
        targetElement.classList.remove('onboarding-highlight');
      }
    };

    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      calculatePositionAndHighlight();
      setIsVisible(true);
    }, 100);

    window.addEventListener('resize', calculatePositionAndHighlight);
    window.addEventListener('scroll', calculatePositionAndHighlight);

    return () => {
      clearTimeout(timer);
      removeHighlightFromTarget();
      window.removeEventListener('resize', calculatePositionAndHighlight);
      window.removeEventListener('scroll', calculatePositionAndHighlight);
    };
  }, [step]);

  const handleNext = () => {
    setIsVisible(false);
    setTimeout(() => {
      const targetElement = document.querySelector(step.target);
      if (targetElement) {
        targetElement.classList.remove('onboarding-highlight');
      }
      nextStep();
    }, 200);
  };

  const handlePrevious = () => {
    setIsVisible(false);
    setTimeout(() => {
      const targetElement = document.querySelector(step.target);
      if (targetElement) {
        targetElement.classList.remove('onboarding-highlight');
      }
      previousStep();
    }, 200);
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(() => {
      const targetElement = document.querySelector(step.target);
      if (targetElement) {
        targetElement.classList.remove('onboarding-highlight');
      }
      skipOnboarding();
    }, 200);
  };

  return (
    <>
      {/* Overlay */}
      <div className="onboarding-overlay" onClick={handleSkip} />
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`onboarding-tooltip ${isVisible ? 'visible' : ''}`}
        style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          zIndex: 10001,
        }}
      >
        <div className="onboarding-tooltip-header">
          <div className="step-indicator">
            <Play size={16} />
            <span>{stepNumber + 1} of {totalSteps}</span>
          </div>
          <button 
            className="skip-button" 
            onClick={handleSkip}
            aria-label="Skip onboarding"
          >
            <X size={18} />
          </button>
        </div>

        <div className="onboarding-tooltip-content">
          <h3>{step.title}</h3>
          <p>{step.content}</p>
        </div>

        <div className="onboarding-tooltip-controls">
          <button
            className="control-button secondary"
            onClick={handlePrevious}
            disabled={stepNumber === 0}
            aria-label="Previous step"
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          <div className="step-dots">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`step-dot ${index === stepNumber ? 'active' : ''} ${index < stepNumber ? 'completed' : ''}`}
              />
            ))}
          </div>

          <button
            className="control-button primary"
            onClick={handleNext}
            aria-label={stepNumber === totalSteps - 1 ? "Complete onboarding" : "Next step"}
          >
            {stepNumber === totalSteps - 1 ? 'Complete' : 'Next'}
            {stepNumber < totalSteps - 1 && <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </>
  );
};

export default OnboardingTooltip;