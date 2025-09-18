import { test, expect } from '@playwright/test';

test.describe('Mobile Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/personal-budgeting-system/#/dashboard');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="dashboard-title"], h4:has-text("Financial Dashboard")', { 
      timeout: 10000 
    });
  });

  test('should open and close sidebar without leaving backdrop', async ({ page }) => {
    // Open sidebar
    await page.click('button[aria-label="toggle navigation menu"]');
    
    // Wait for sidebar to be visible
    await page.waitForSelector('nav[aria-label="Main navigation menu"]', { state: 'visible' });
    
    // Take screenshot of open sidebar
    await page.screenshot({ path: 'test-mobile-sidebar-open.png' });
    
    // Navigate to a different page
    await page.click('text=Accounts');
    
    // Wait for navigation to complete
    await page.waitForURL('**/accounts');
    await page.waitForSelector('h4:has-text("Financial Accounts")', { timeout: 5000 });
    
    // Check that there's no visible backdrop remaining
    const backdrop = page.locator('.MuiBackdrop-root');
    await expect(backdrop).toHaveCount(0);
    
    // Take screenshot after navigation
    await page.screenshot({ path: 'test-mobile-after-navigation.png' });
  });

  test('should handle drawer state properly on navigation', async ({ page }) => {
    // Open sidebar
    await page.click('button[aria-label="toggle navigation menu"]');
    
    // Click on Settings
    await page.click('text=Settings');
    
    // Wait for settings page
    await page.waitForURL('**/settings');
    await page.waitForSelector('h4:has-text("Settings")');
    
    // Sidebar should be closed on mobile
    const drawer = page.locator('nav[aria-label="Main navigation menu"]');
    await expect(drawer).not.toBeVisible();
  });

  test('should properly handle theme changes', async ({ page }) => {
    // Navigate to settings
    await page.goto('http://localhost:3000/personal-budgeting-system/#/settings');
    await page.waitForSelector('h4:has-text("Settings")');
    
    // Change theme to dark
    await page.click('text=Theme Mode');
    await page.click('text=Dark');
    
    // Take screenshot of dark theme
    await page.screenshot({ path: 'test-dark-theme.png' });
    
    // Verify dark theme is applied (check for dark background)
    const body = page.locator('body');
    const bgColor = await body.evaluate(el => getComputedStyle(el).backgroundColor);
    
    // Dark theme should have a dark background
    expect(bgColor).toContain('rgb(18, 18, 18)'); // Material-UI dark theme background
  });

  test('should display financial allocation pie chart', async ({ page }) => {
    // Go to dashboard
    await page.goto('http://localhost:3000/personal-budgeting-system/#/dashboard');
    await page.waitForSelector('h4:has-text("Financial Dashboard")');
    
    // Check if Financial Allocation section exists
    const allocationSection = page.locator('text=Financial Allocation');
    await expect(allocationSection).toBeVisible();
    
    // Take screenshot of dashboard with pie chart
    await page.screenshot({ path: 'test-dashboard-pie-chart.png' });
  });

  test('should extend projections to 50 years', async ({ page }) => {
    // Navigate to projections
    await page.goto('http://localhost:3000/personal-budgeting-system/#/projections');
    await page.waitForSelector('h4:has-text("Financial Projections")');
    
    // Check if 50yr marker exists
    const fiftyYearMarker = page.locator('text=50yr');
    await expect(fiftyYearMarker).toBeVisible();
    
    // Move slider to maximum (50 years)
    const slider = page.locator('input[type="range"]');
    await slider.fill('600'); // 50 years * 12 months
    
    // Verify the projection period text
    await expect(page.locator('text=600 months (50.0 years)')).toBeVisible();
  });

  test('should have mobile-responsive projections table', async ({ page }) => {
    // Navigate to projections
    await page.goto('http://localhost:3000/personal-budgeting-system/#/projections');
    await page.waitForSelector('h4:has-text("Financial Projections")');
    
    // Check if table exists and is responsive
    const table = page.locator('table');
    await expect(table).toBeVisible();
    
    // Verify no horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    
    // Allow for small differences due to scrollbars
    expect(scrollWidth - clientWidth).toBeLessThan(20);
    
    // Take screenshot of mobile projections
    await page.screenshot({ path: 'test-mobile-projections.png' });
  });
});