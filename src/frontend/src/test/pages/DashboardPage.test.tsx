import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { store } from '@/store';
import { theme } from '@/theme';
import DashboardPage from '@/pages/DashboardPage';
import type { ReactNode } from 'react';

// Test wrapper component
const TestWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>{children}</BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
};

describe('DashboardPage', () => {
  it('renders dashboard title', () => {
    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    expect(screen.getByText('Financial Dashboard')).toBeInTheDocument();
  });

  it('shows disclaimer message', () => {
    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    expect(screen.getByText(/Remember:/)).toBeInTheDocument();
    expect(
      screen.getByText(/This is not financial advice/)
    ).toBeInTheDocument();
  });

  it('displays net worth stat card', () => {
    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    expect(screen.getByText('Net Worth')).toBeInTheDocument();
  });
});
