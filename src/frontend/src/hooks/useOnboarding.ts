import { useState, useEffect } from 'react';

export interface UseOnboardingOptions {
  storageKey: string;
  autoStart?: boolean;
  delay?: number;
  prerequisitesMet?: boolean;
}

export const useOnboarding = ({
  storageKey,
  autoStart = true,
  delay = 1000,
  prerequisitesMet = true,
}: UseOnboardingOptions) => {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    try {
      const completed = localStorage.getItem(storageKey) === 'true';
      setHasCompletedOnboarding(completed);

      if (!completed && autoStart && prerequisitesMet) {
        // Delay the start to ensure all elements are rendered
        const timer = setTimeout(() => {
          setIsOnboardingOpen(true);
        }, delay);

        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error('Error initializing onboarding:', error);
      setHasCompletedOnboarding(false);
    }

    // Return empty cleanup function when no timer is set
    return () => {};
  }, [storageKey, autoStart, delay, prerequisitesMet]);

  const startOnboarding = () => {
    setIsOnboardingOpen(true);
  };

  const completeOnboarding = () => {
    setIsOnboardingOpen(false);
    setHasCompletedOnboarding(true);
    try {
      localStorage.setItem(storageKey, 'true');
    } catch (error) {
      console.error('Error saving onboarding completion to localStorage:', error);
    }
  };

  const skipOnboarding = () => {
    setIsOnboardingOpen(false);
    setHasCompletedOnboarding(true);
    try {
      localStorage.setItem(storageKey, 'true');
    } catch (error) {
      console.error('Error saving onboarding skip to localStorage:', error);
    }
  };

  const resetOnboarding = () => {
    try {
      localStorage.removeItem(storageKey);
      setHasCompletedOnboarding(false);
    } catch (error) {
      console.error('Error removing onboarding from localStorage:', error);
      setHasCompletedOnboarding(false);
    }
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
