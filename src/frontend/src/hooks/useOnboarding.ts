import { useState, useEffect } from 'react';

export interface UseOnboardingOptions {
  storageKey: string;
  autoStart?: boolean;
  delay?: number;
}

export const useOnboarding = ({ 
  storageKey, 
  autoStart = true,
  delay = 1000 
}: UseOnboardingOptions) => {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(storageKey) === 'true';
    setHasCompletedOnboarding(completed);

    if (!completed && autoStart) {
      // Delay the start to ensure all elements are rendered
      const timer = setTimeout(() => {
        setIsOnboardingOpen(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [storageKey, autoStart, delay]);

  const startOnboarding = () => {
    setIsOnboardingOpen(true);
  };

  const completeOnboarding = () => {
    setIsOnboardingOpen(false);
    setHasCompletedOnboarding(true);
    localStorage.setItem(storageKey, 'true');
  };

  const skipOnboarding = () => {
    setIsOnboardingOpen(false);
    setHasCompletedOnboarding(true);
    localStorage.setItem(storageKey, 'true');
  };

  const resetOnboarding = () => {
    localStorage.removeItem(storageKey);
    setHasCompletedOnboarding(false);
  };

  return {
    isOnboardingOpen,
    hasCompletedOnboarding,
    startOnboarding,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
  };
};