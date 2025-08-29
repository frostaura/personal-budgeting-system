import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { OnboardingProvider } from './contexts/OnboardingContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Accounts from './components/Accounts';
import Transactions from './components/Transactions';
import Categories from './components/Categories';
import Budgets from './components/Budgets';
import OnboardingOverlay from './components/OnboardingOverlay';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <OnboardingProvider>
        <Router>
          <div className="App">
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/budgets" element={<Budgets />} />
              </Routes>
            </Layout>
            <OnboardingOverlay />
          </div>
        </Router>
      </OnboardingProvider>
    </Provider>
  );
}

export default App;
