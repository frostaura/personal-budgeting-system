import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { OnboardingState, OnboardingContextType, OnboardingStep } from '../types/onboarding';

const ONBOARDING_STORAGE_KEY = 'personal-budget-onboarding-completed';

const initialState: OnboardingState = {
  isActive: false,
  currentStep: 0,
  steps: [],
  isCompleted: localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true',
};

type OnboardingAction =
  | { type: 'START_ONBOARDING'; steps: OnboardingStep[] }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'SKIP_ONBOARDING' }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'RESTART_ONBOARDING' };

const onboardingReducer = (state: OnboardingState, action: OnboardingAction): OnboardingState => {
  switch (action.type) {
    case 'START_ONBOARDING':
      return {
        ...state,
        isActive: true,
        currentStep: 0,
        steps: action.steps,
      };
    case 'NEXT_STEP':
      if (state.currentStep < state.steps.length - 1) {
        return {
          ...state,
          currentStep: state.currentStep + 1,
        };
      } else {
        // Complete onboarding when reaching the last step
        localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
        return {
          ...state,
          isActive: false,
          isCompleted: true,
        };
      }
    case 'PREVIOUS_STEP':
      return {
        ...state,
        currentStep: Math.max(0, state.currentStep - 1),
      };
    case 'SKIP_ONBOARDING':
    case 'COMPLETE_ONBOARDING':
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
      return {
        ...state,
        isActive: false,
        isCompleted: true,
      };
    case 'RESTART_ONBOARDING':
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      return {
        ...state,
        isActive: false,
        currentStep: 0,
        isCompleted: false,
      };
    default:
      return state;
  }
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  const startOnboarding = (steps: OnboardingStep[]) => {
    dispatch({ type: 'START_ONBOARDING', steps });
  };

  const nextStep = () => {
    dispatch({ type: 'NEXT_STEP' });
  };

  const previousStep = () => {
    dispatch({ type: 'PREVIOUS_STEP' });
  };

  const skipOnboarding = () => {
    dispatch({ type: 'SKIP_ONBOARDING' });
  };

  const completeOnboarding = () => {
    dispatch({ type: 'COMPLETE_ONBOARDING' });
  };

  const restartOnboarding = () => {
    dispatch({ type: 'RESTART_ONBOARDING' });
  };

  const contextValue: OnboardingContextType = {
    state,
    startOnboarding,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding,
    restartOnboarding,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};