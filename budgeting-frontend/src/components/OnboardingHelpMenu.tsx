import React, { useState } from 'react';
import { HelpCircle, Play, RotateCcw } from 'lucide-react';
import { useOnboarding } from '../contexts/OnboardingContext';
import { dashboardOnboardingSteps } from '../config/onboardingSteps';
import '../styles/OnboardingHelpMenu.css';

const OnboardingHelpMenu: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { state, startOnboarding, restartOnboarding } = useOnboarding();

  const handleStartTour = () => {
    startOnboarding(dashboardOnboardingSteps);
    setIsMenuOpen(false);
  };

  const handleRestartTour = () => {
    restartOnboarding();
    setTimeout(() => {
      startOnboarding(dashboardOnboardingSteps);
    }, 100);
    setIsMenuOpen(false);
  };

  return (
    <div className="onboarding-help-menu">
      <button
        className="help-menu-trigger"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Help and onboarding menu"
        title="Help & Tour"
      >
        <HelpCircle size={24} />
      </button>

      {isMenuOpen && (
        <>
          <div 
            className="help-menu-backdrop" 
            onClick={() => setIsMenuOpen(false)} 
          />
          <div className="help-menu-dropdown">
            {!state.isCompleted ? (
              <button
                className="help-menu-item"
                onClick={handleStartTour}
              >
                <Play size={18} />
                Start Dashboard Tour
              </button>
            ) : (
              <button
                className="help-menu-item"
                onClick={handleRestartTour}
              >
                <RotateCcw size={18} />
                Restart Dashboard Tour
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OnboardingHelpMenu;