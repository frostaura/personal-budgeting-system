import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { OnboardingProvider } from './contexts/OnboardingContext';
import Dashboard from './components/Dashboard';
import OnboardingOverlay from './components/OnboardingOverlay';
import OnboardingHelpMenu from './components/OnboardingHelpMenu';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <OnboardingProvider>
        <div className="App">
          <Dashboard />
          <OnboardingHelpMenu />
          <OnboardingOverlay />
        </div>
      </OnboardingProvider>
    </Provider>
  );
}

export default App;
