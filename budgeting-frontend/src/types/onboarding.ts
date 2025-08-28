export interface OnboardingStep {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector or element ID
  position?: 'top' | 'bottom' | 'left' | 'right';
  offset?: { x: number; y: number };
}

export interface OnboardingState {
  isActive: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  isCompleted: boolean;
}

export interface OnboardingContextType {
  state: OnboardingState;
  startOnboarding: (steps: OnboardingStep[]) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
  restartOnboarding: () => void;
}