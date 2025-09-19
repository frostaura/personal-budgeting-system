import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  serviceWorkerManager, 
  initializeServiceWorker,
  useServiceWorkerStatus,
  useServiceWorkerUpdate 
} from '../../services/serviceWorkerManager';
import { renderHook } from '@testing-library/react';

// Mock navigator.serviceWorker
const mockServiceWorker = {
  register: vi.fn(),
  addEventListener: vi.fn(),
};

// Mock registration
const mockRegistration = {
  waiting: null,
  installing: null,
  active: null,
  addEventListener: vi.fn(),
};

// Setup mocks
beforeEach(() => {
  vi.clearAllMocks();
  
  Object.defineProperty(global.navigator, 'serviceWorker', {
    value: mockServiceWorker,
    writable: true,
  });
  
  Object.defineProperty(global.navigator, 'onLine', {
    value: true,
    writable: true,
  });
  
  Object.defineProperty(global.window, 'location', {
    value: {
      hostname: 'example.com', // Not localhost to enable SW registration
    },
    writable: true,
  });
});

describe('ServiceWorkerManager', () => {
  it('should check if service workers are supported', () => {
    expect(serviceWorkerManager.isSupported()).toBe(true);
  });

  it('should register service worker successfully', async () => {
    mockServiceWorker.register.mockResolvedValue(mockRegistration);
    
    const result = await serviceWorkerManager.register();
    
    expect(result).toBe(true);
    expect(mockServiceWorker.register).toHaveBeenCalledWith(
      '/personal-budgeting-system/sw.js',
      { scope: '/personal-budgeting-system/' }
    );
  });

  it('should return false if service worker registration fails', async () => {
    mockServiceWorker.register.mockRejectedValue(new Error('Registration failed'));
    
    const result = await serviceWorkerManager.register();
    
    expect(result).toBe(false);
  });

  it('should skip registration in development mode (localhost)', async () => {
    Object.defineProperty(global.window, 'location', {
      value: {
        hostname: 'localhost',
      },
      writable: true,
    });
    
    const result = await initializeServiceWorker();
    
    expect(result).toBe(false);
  });

  it('should return correct supported status', () => {
    expect(serviceWorkerManager.isSupported()).toBe(true);
  });
});

describe('Service Worker Hooks', () => {
  it('should provide service worker status', () => {
    const { result } = renderHook(() => useServiceWorkerStatus());
    
    expect(result.current.isSupported).toBe(true);
    expect(result.current.isOnline).toBe(true);
  });

  it('should provide service worker update functionality', () => {
    const { result } = renderHook(() => useServiceWorkerUpdate());
    
    expect(result.current.update.isUpdateAvailable).toBe(false);
    expect(typeof result.current.applyUpdate).toBe('function');
  });
});