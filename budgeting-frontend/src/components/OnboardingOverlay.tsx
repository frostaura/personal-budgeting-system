import React from 'react';
import { useOnboarding } from '../contexts/OnboardingContext';
import OnboardingTooltip from './OnboardingTooltip';

const OnboardingOverlay: React.FC = () => {
  const { state } = useOnboarding();

  if (!state.isActive || state.steps.length === 0) {
    return null;
  }

  const currentStep = state.steps[state.currentStep];

  if (!currentStep) {
    return null;
  }

  return (
    <OnboardingTooltip
      step={currentStep}
      stepNumber={state.currentStep}
      totalSteps={state.steps.length}
    />
  );
};

export default OnboardingOverlay;