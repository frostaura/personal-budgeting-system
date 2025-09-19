# Offline Mode Service Worker

The Personal Finance Planner now includes offline support through a service worker implementation.

## Features

- **Offline functionality**: The app works completely offline since all data is stored locally in localStorage
- **Visual indicators**: Online/Offline status indicator in the top right corner
- **Update notifications**: Automatic notifications when app updates are available
- **Cache management**: Static assets are cached for faster loading and offline access

## Implementation

### Service Worker (`public/sw.js`)
- Caches static assets (HTML, CSS, JS, images) for offline access
- Uses cache-first strategy for static assets
- Uses network-first strategy for navigation requests
- Automatically cleans up old caches when updated

### Service Worker Manager (`src/services/serviceWorkerManager.ts`)
- TypeScript service for registering and managing the service worker
- Provides React hooks for components to access SW status
- Handles update notifications and applies updates

### UI Components
- **OfflineIndicator**: Shows online/offline status and update notifications
- Integrated into the main App component

## Usage

### For Users
1. The app automatically registers the service worker on first visit (production only)
2. An "Online" indicator appears in the top right when connected
3. When offline, an "Offline" indicator appears with a helpful message
4. App update notifications appear at the bottom when available

### For Developers
```typescript
import { useServiceWorkerStatus, useServiceWorkerUpdate } from '@/services/serviceWorkerManager';

// Get current status
const status = useServiceWorkerStatus();
console.log(status.isOnline); // true/false
console.log(status.isRegistered); // true/false

// Handle updates
const { update, applyUpdate } = useServiceWorkerUpdate();
if (update.isUpdateAvailable) {
  applyUpdate(); // Apply the update
}
```

## Build Process

The service worker and PWA manifest are automatically copied to the `dist` folder during build:

```bash
npm run build
```

This runs:
1. TypeScript compilation
2. Vite build
3. Copy PWA assets script

## Files Added/Modified

### New Files
- `public/sw.js` - Service worker implementation
- `public/manifest.json` - PWA manifest
- `public/vite.svg` - App icon
- `src/services/serviceWorkerManager.ts` - Service worker management
- `src/components/common/OfflineIndicator.tsx` - UI component
- `scripts/copy-sw.js` - Build script to copy PWA assets

### Modified Files
- `src/main.tsx` - Service worker registration
- `src/App.tsx` - Added OfflineIndicator component
- `index.html` - Added manifest link
- `package.json` - Updated build script
- `vite.config.ts` - Removed PWA plugin (using custom implementation)

## Notes

- Service worker only registers in production (not on localhost)
- All data is stored locally, so offline functionality works seamlessly
- The app is now a Progressive Web App (PWA) and can be installed on devices
- Cache is automatically managed and updated when the app is updated