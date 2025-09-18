import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { MainLayout } from '@/components/layout/MainLayout';

// Lazy load pages for code splitting
const DashboardPage = React.lazy(() => import('@/pages/DashboardPage'));
const AccountsPage = React.lazy(() => import('@/pages/AccountsPage'));
const CashflowsPage = React.lazy(() => import('@/pages/CashflowsPage'));
const ProjectionsPage = React.lazy(() => import('@/pages/ProjectionsPage'));
const ScenariosPage = React.lazy(() => import('@/pages/ScenariosPage'));
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage'));

export const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<LoadingScreen message="Loading page..." />}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="cashflows" element={<CashflowsPage />} />
          <Route path="projections" element={<ProjectionsPage />} />
          <Route path="scenarios" element={<ScenariosPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
};
