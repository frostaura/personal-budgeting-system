import { test, expect } from '@playwright/test';

test.describe('Personal Finance Planner', () => {
  test('homepage loads and displays main content', async ({ page }) => {
    await page.goto('/');

    // Check if the page title is correct
    await expect(page).toHaveTitle('Personal Finance Planner');

    // Check for the main navigation
    await expect(
      page.getByRole('button', { name: 'toggle navigation menu' })
    ).toBeVisible();

    // Check if we're on the dashboard (should be the default page)
    await expect(page.getByText('Financial Dashboard')).toBeVisible();

    // Check for key dashboard elements
    await expect(page.getByText('Net Worth')).toBeVisible();
    await expect(page.getByText('Total Assets')).toBeVisible();
    await expect(page.getByText('Monthly Savings')).toBeVisible();
    await expect(page.getByText('Savings Rate')).toBeVisible();
  });

  test('navigation works correctly', async ({ page }) => {
    await page.goto('/');

    // Test navigation to different pages
    await page.getByRole('menuitem', { name: 'Navigate to Accounts' }).click();
    await expect(page.getByText('Financial Accounts')).toBeVisible();

    await page
      .getByRole('menuitem', { name: 'Navigate to Cash Flows' })
      .click();
    await expect(page.getByText('Cash Flows')).toBeVisible();

    await page
      .getByRole('menuitem', { name: 'Navigate to Projections' })
      .click();
    await expect(page.getByText('Financial Projections')).toBeVisible();

    await page.getByRole('menuitem', { name: 'Navigate to Scenarios' }).click();
    await expect(page.getByText('Financial Scenarios')).toBeVisible();

    await page.getByRole('menuitem', { name: 'Navigate to Settings' }).click();
    await expect(page.getByText('Settings')).toBeVisible();
  });

  test('responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check that sidebar is closed on mobile
    await expect(page.getByRole('navigation')).not.toBeVisible();

    // Open sidebar
    await page.getByRole('button', { name: 'toggle navigation menu' }).click();
    await expect(page.getByRole('navigation')).toBeVisible();

    // Navigate to another page (should close sidebar on mobile)
    await page.getByRole('menuitem', { name: 'Navigate to Accounts' }).click();
    await expect(page.getByText('Financial Accounts')).toBeVisible();
  });
});
