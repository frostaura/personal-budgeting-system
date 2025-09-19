import React from 'react';

/**
 * Service Worker registration and management utilities
 */

export interface ServiceWorkerUpdate {
  isUpdateAvailable: boolean;
  waitingWorker?: ServiceWorker;
}

export interface ServiceWorkerStatus {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  updateAvailable?: ServiceWorkerUpdate;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateCallbacks: Array<(update: ServiceWorkerUpdate) => void> = [];
  private statusCallbacks: Array<(status: ServiceWorkerStatus) => void> = [];

  constructor() {
    this.setupOnlineStatusListener();
  }

  /**
   * Register the service worker
   */
  async register(): Promise<boolean> {
    if (!this.isSupported()) {
      console.log('[SW Manager] Service workers not supported');
      return false;
    }

    try {
      console.log('[SW Manager] Registering service worker...');
      
      this.registration = await navigator.serviceWorker.register('/personal-budgeting-system/sw.js', {
        scope: '/personal-budgeting-system/',
      });

      console.log('[SW Manager] Service worker registered successfully');

      // Set up update detection
      this.setupUpdateDetection();
      
      // Notify status change
      this.notifyStatusChange();

      return true;
    } catch (error) {
      console.error('[SW Manager] Service worker registration failed:', error);
      return false;
    }
  }

  /**
   * Check if service workers are supported
   */
  isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  /**
   * Check if service worker is registered
   */
  isRegistered(): boolean {
    return this.registration !== null;
  }

  /**
   * Get current service worker status
   */
  getStatus(): ServiceWorkerStatus {
    return {
      isSupported: this.isSupported(),
      isRegistered: this.isRegistered(),
      isOnline: navigator.onLine,
      updateAvailable: this.getUpdateStatus(),
    };
  }

  /**
   * Apply waiting service worker update
   */
  applyUpdate(): void {
    const updateStatus = this.getUpdateStatus();
    if (updateStatus.isUpdateAvailable && updateStatus.waitingWorker) {
      updateStatus.waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  /**
   * Subscribe to update notifications
   */
  onUpdateAvailable(callback: (update: ServiceWorkerUpdate) => void): () => void {
    this.updateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index > -1) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to status changes
   */
  onStatusChange(callback: (status: ServiceWorkerStatus) => void): () => void {
    this.statusCallbacks.push(callback);
    
    // Send initial status
    callback(this.getStatus());
    
    // Return unsubscribe function
    return () => {
      const index = this.statusCallbacks.indexOf(callback);
      if (index > -1) {
        this.statusCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Manually cache specific URLs
   */
  async cacheUrls(urls: string[]): Promise<boolean> {
    if (!this.registration?.active) {
      console.warn('[SW Manager] No active service worker to cache URLs');
      return false;
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.success);
      };

      this.registration!.active!.postMessage(
        {
          type: 'CACHE_URLS',
          payload: urls,
        },
        [messageChannel.port2]
      );
    });
  }

  private getUpdateStatus(): ServiceWorkerUpdate {
    if (!this.registration) {
      return { isUpdateAvailable: false };
    }

    const waitingWorker = this.registration.waiting;
    return {
      isUpdateAvailable: !!waitingWorker,
      ...(waitingWorker && { waitingWorker }),
    };
  }

  private setupUpdateDetection(): void {
    if (!this.registration) return;

    // Check for existing waiting worker
    if (this.registration.waiting) {
      this.notifyUpdateAvailable();
    }

    // Listen for new waiting workers
    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration!.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && this.registration!.waiting) {
          this.notifyUpdateAvailable();
        }
      });
    });

    // Listen for controller changes (when update is applied)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  private notifyUpdateAvailable(): void {
    const updateStatus = this.getUpdateStatus();
    this.updateCallbacks.forEach(callback => callback(updateStatus));
    this.notifyStatusChange();
  }

  private notifyStatusChange(): void {
    const status = this.getStatus();
    this.statusCallbacks.forEach(callback => callback(status));
  }

  private setupOnlineStatusListener(): void {
    window.addEventListener('online', () => this.notifyStatusChange());
    window.addEventListener('offline', () => this.notifyStatusChange());
  }
}

// Singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();

/**
 * Initialize service worker on app startup
 */
export async function initializeServiceWorker(): Promise<boolean> {
  // Skip in development mode
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('[SW Manager] Skipping service worker registration in development mode');
    return false;
  }

  return serviceWorkerManager.register();
}

/**
 * Hook for React components to use service worker status
 */
export function useServiceWorkerStatus() {
  const [status, setStatus] = React.useState<ServiceWorkerStatus>(
    serviceWorkerManager.getStatus()
  );

  React.useEffect(() => {
    return serviceWorkerManager.onStatusChange(setStatus);
  }, []);

  return status;
}

/**
 * Hook for React components to handle service worker updates
 */
export function useServiceWorkerUpdate() {
  const [update, setUpdate] = React.useState<ServiceWorkerUpdate>({ isUpdateAvailable: false });

  React.useEffect(() => {
    return serviceWorkerManager.onUpdateAvailable(setUpdate);
  }, []);

  const applyUpdate = React.useCallback(() => {
    serviceWorkerManager.applyUpdate();
  }, []);

  return { update, applyUpdate };
}

// Re-export manager for direct access
export { serviceWorkerManager as swManager };