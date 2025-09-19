import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import type { ReactNode } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import settingsReducer from '@/store/slices/settingsSlice';
import { DEFAULT_CURRENCY_SETTINGS } from '@/utils/currency';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Create a test store
const createTestStore = (disclaimerAccepted = false) => {
  return configureStore({
    reducer: {
      settings: settingsReducer,
    },
    preloadedState: {
      settings: {
        disclaimerAccepted,
        currency: DEFAULT_CURRENCY_SETTINGS,
        taxSettings: null,
        autoSave: true,
        saveInterval: 5,
        theme: {
          mode: 'system' as const,
          primaryColor: '#1976d2',
          successColor: '#2e7d32',
          warningColor: '#ed6c02',
          errorColor: '#d32f2f',
          contrastMode: 'normal' as const,
        },
        accessibility: {
          reduceMotion: false,
          highContrast: false,
          screenReaderOptimized: false,
          keyboardNavigation: true,
        },
        notifications: {
          enabled: true,
          types: {
            projectionUpdates: true,
            errors: true,
            warnings: true,
            milestones: false,
          },
        },
        privacy: {
          analyticsEnabled: false,
          errorReportingEnabled: true,
        },
      },
    },
  });
};

// Test wrapper component
const createWrapper = (store: ReturnType<typeof createTestStore>) => {
  return ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe('useOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should not start onboarding automatically when disclaimer is not accepted', () => {
    const store = createTestStore(false); // disclaimer not accepted
    localStorageMock.getItem.mockReturnValue(null); // onboarding not completed

    const { result } = renderHook(
      () =>
        useOnboarding({
          storageKey: 'test-onboarding',
          autoStart: true,
          delay: 0,
        }),
      { wrapper: createWrapper(store) }
    );

    expect(result.current.isOnboardingOpen).toBe(false);
    expect(result.current.hasCompletedOnboarding).toBe(false);
  });

  it('should start onboarding automatically when disclaimer is accepted and onboarding not completed', async () => {
    const store = createTestStore(true); // disclaimer accepted
    localStorageMock.getItem.mockReturnValue(null); // onboarding not completed

    const { result } = renderHook(
      () =>
        useOnboarding({
          storageKey: 'test-onboarding',
          autoStart: true,
          delay: 0,
        }),
      { wrapper: createWrapper(store) }
    );

    // Wait for the effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(result.current.isOnboardingOpen).toBe(true);
    expect(result.current.hasCompletedOnboarding).toBe(false);
  });

  it('should not start onboarding when already completed, even if disclaimer is accepted', () => {
    const store = createTestStore(true); // disclaimer accepted
    localStorageMock.getItem.mockReturnValue('true'); // onboarding completed

    const { result } = renderHook(
      () =>
        useOnboarding({
          storageKey: 'test-onboarding',
          autoStart: true,
          delay: 0,
        }),
      { wrapper: createWrapper(store) }
    );

    expect(result.current.isOnboardingOpen).toBe(false);
    expect(result.current.hasCompletedOnboarding).toBe(true);
  });

  it('should not start onboarding when autoStart is false, regardless of disclaimer status', () => {
    const store = createTestStore(true); // disclaimer accepted
    localStorageMock.getItem.mockReturnValue(null); // onboarding not completed

    const { result } = renderHook(
      () =>
        useOnboarding({
          storageKey: 'test-onboarding',
          autoStart: false, // autoStart disabled
          delay: 0,
        }),
      { wrapper: createWrapper(store) }
    );

    expect(result.current.isOnboardingOpen).toBe(false);
    expect(result.current.hasCompletedOnboarding).toBe(false);
  });

  it('should allow manual start of onboarding even when disclaimer is not accepted', () => {
    const store = createTestStore(false); // disclaimer not accepted
    localStorageMock.getItem.mockReturnValue(null); // onboarding not completed

    const { result } = renderHook(
      () =>
        useOnboarding({
          storageKey: 'test-onboarding',
          autoStart: true,
          delay: 0,
        }),
      { wrapper: createWrapper(store) }
    );

    act(() => {
      result.current.startOnboarding();
    });

    expect(result.current.isOnboardingOpen).toBe(true);
  });

  it('should complete onboarding and save to localStorage', () => {
    const store = createTestStore(true);
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(
      () =>
        useOnboarding({
          storageKey: 'test-onboarding',
          autoStart: false,
        }),
      { wrapper: createWrapper(store) }
    );

    act(() => {
      result.current.startOnboarding();
    });

    expect(result.current.isOnboardingOpen).toBe(true);

    act(() => {
      result.current.completeOnboarding();
    });

    expect(result.current.isOnboardingOpen).toBe(false);
    expect(result.current.hasCompletedOnboarding).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-onboarding', 'true');
  });
});