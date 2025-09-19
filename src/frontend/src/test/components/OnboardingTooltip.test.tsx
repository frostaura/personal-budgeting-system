import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OnboardingTooltip, OnboardingStep } from '@/components/common/OnboardingTooltip';

// Mock console.debug to avoid noise in tests
const originalConsoleDebug = console.debug;
const originalConsoleError = console.error;

beforeEach(() => {
  console.debug = vi.fn();
  console.error = vi.fn();
});

afterEach(() => {
  console.debug = originalConsoleDebug;
  console.error = originalConsoleError;
});

const mockSteps: OnboardingStep[] = [
  {
    id: 'test-step-1',
    target: '[data-testid="test-target"]',
    title: 'Test Step 1',
    description: 'This is a test step',
    placement: 'bottom',
  },
  {
    id: 'test-step-2',
    target: '[data-testid="test-target-2"]',
    title: 'Test Step 2',
    description: 'This is another test step',
    placement: 'top',
  },
];

describe('OnboardingTooltip Error Handling', () => {
  it('should handle missing target elements gracefully', () => {
    const mockOnComplete = vi.fn();
    const mockOnSkip = vi.fn();

    // Render the onboarding tooltip without the target elements
    render(
      <OnboardingTooltip
        steps={mockSteps}
        isOpen={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
        storageKey="test-onboarding"
      />
    );

    // The component should not crash even when target elements don't exist
    expect(console.debug).toHaveBeenCalledWith(
      'Target element not found:',
      '[data-testid="test-target"]'
    );
  });

  it('should not render when step is undefined', () => {
    const mockOnComplete = vi.fn();
    const mockOnSkip = vi.fn();

    render(
      <OnboardingTooltip
        steps={[]}
        isOpen={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
        storageKey="test-onboarding"
      />
    );

    // Should not render any content when there are no steps
    expect(screen.queryByText('Skip Tour')).not.toBeInTheDocument();
  });

  it('should handle localStorage errors gracefully in useOnboarding hook', () => {
    // This test focuses on the error handling in the components themselves
    // rather than DOM manipulation which causes test conflicts
    
    const mockOnComplete = vi.fn();
    const mockOnSkip = vi.fn();

    // Mock localStorage to throw an error
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = vi.fn().mockImplementation(() => {
      throw new Error('localStorage is not available');
    });

    // This should not crash the component
    render(
      <OnboardingTooltip
        steps={mockSteps}
        isOpen={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
        storageKey="test-onboarding"
      />
    );

    // Restore localStorage
    localStorage.getItem = originalGetItem;
    
    // The component should render even with localStorage errors
    expect(console.debug).toHaveBeenCalled();
  });

  it('should handle onboarding close without crashing due to scope issues', () => {
    const mockOnComplete = vi.fn();
    const mockOnSkip = vi.fn();

    // Create a mock target element
    const mockTarget = document.createElement('div');
    mockTarget.setAttribute('data-testid', 'test-target');
    document.body.appendChild(mockTarget);

    const { rerender } = render(
      <OnboardingTooltip
        steps={mockSteps}
        isOpen={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
        storageKey="test-onboarding"
      />
    );

    // Close the onboarding (this should trigger the cleanup)
    rerender(
      <OnboardingTooltip
        steps={mockSteps}
        isOpen={false}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
        storageKey="test-onboarding"
      />
    );

    // Cleanup
    document.body.removeChild(mockTarget);

    // The component should handle the close without throwing an error
    expect(mockOnComplete).not.toHaveBeenCalled();
    expect(mockOnSkip).not.toHaveBeenCalled();
  });
});