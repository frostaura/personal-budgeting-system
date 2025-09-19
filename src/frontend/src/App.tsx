import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { HashRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { store, persistor } from '@/store';
import { AppRouter } from '@/components/routing/AppRouter';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { DisclaimerDialog } from '@/components/common/DisclaimerDialog';
import { AppInitializer } from '@/components/common/AppInitializer';
import { DynamicThemeProvider } from '@/components/theme/DynamicThemeProvider';

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
          <DynamicThemeProvider>
            <CssBaseline />
            <HashRouter>
              <AppInitializer>
                <AppRouter />
                <DisclaimerDialog />
                <ToastContainer
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="colored"
                />
              </AppInitializer>
            </HashRouter>
          </DynamicThemeProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
