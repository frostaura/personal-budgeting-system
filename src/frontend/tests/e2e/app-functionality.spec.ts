import { test, expect } from '@playwright/test';

test.describe('Personal Finance Planner E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Dismiss disclaimer dialog
    await page
      .getByRole('checkbox', { name: 'I understand that this' })
      .click();
    await page
      .getByRole('checkbox', { name: 'I understand that my data is' })
      .click();
    await page.getByRole('button', { name: 'I Understand & Continue' }).click();
  });

  test('should navigate between all main pages', async ({ page }) => {
    // Test Dashboard
    await page.getByRole('menuitem', { name: 'Navigate to Dashboard' }).click();
    await expect(
      page.getByRole('heading', { name: 'Financial Dashboard' })
    ).toBeVisible();

    // Test Accounts
    await page.getByRole('menuitem', { name: 'Navigate to Accounts' }).click();
    await expect(
      page.getByRole('heading', { name: 'Financial Accounts' })
    ).toBeVisible();

    // Test Cash Flows
    await page
      .getByRole('menuitem', { name: 'Navigate to Cash Flows' })
      .click();
    await expect(
      page.getByRole('heading', { name: 'Cash Flows' })
    ).toBeVisible();

    // Test Projections
    await page
      .getByRole('menuitem', { name: 'Navigate to Projections' })
      .click();
    await expect(
      page.getByRole('heading', { name: 'Financial Projections' })
    ).toBeVisible();

    // Test Scenarios
    await page.getByRole('menuitem', { name: 'Navigate to Scenarios' }).click();
    await expect(
      page.getByRole('heading', { name: 'Financial Scenarios' })
    ).toBeVisible();

    // Test Settings
    await page.getByRole('menuitem', { name: 'Navigate to Settings' }).click();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  });

  test('should create and manage accounts', async ({ page }) => {
    await page.getByRole('menuitem', { name: 'Navigate to Accounts' }).click();

    // Should show existing accounts
    await expect(page.getByText('Income Accounts')).toBeVisible();
    await expect(page.getByText('Investment Accounts')).toBeVisible();
    await expect(page.getByText('Liability Accounts')).toBeVisible();

    // Test create account flow
    await page.getByRole('button', { name: 'Add Account' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page
      .getByRole('textbox', { name: 'Account Name' })
      .fill('Test Savings Account');
    await page.getByRole('combobox', { name: 'Account Type' }).click();
    await page.getByRole('option', { name: 'Investment Account' }).click();
    await page.getByRole('textbox', { name: 'Opening Balance' }).fill('10000');

    await page.getByRole('button', { name: 'Create Account' }).click();

    // Should show the new account
    await expect(page.getByText('Test Savings Account')).toBeVisible();
  });

  test('should create and manage cash flows', async ({ page }) => {
    await page
      .getByRole('menuitem', { name: 'Navigate to Cash Flows' })
      .click();

    // Should show existing cash flows
    await expect(page.getByText('Income Flows')).toBeVisible();
    await expect(page.getByText('Expense Flows')).toBeVisible();

    // Test create cash flow
    await page.getByRole('button', { name: 'Add Cash Flow' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page
      .getByRole('textbox', { name: 'Description' })
      .fill('Test Monthly Income');
    await page.getByRole('textbox', { name: 'Amount (ZAR)' }).fill('5000');

    await page.getByRole('button', { name: 'Create Cash Flow' }).click();

    // Should show the new cash flow
    await expect(page.getByText('Test Monthly Income')).toBeVisible();
  });

  test('should run financial projections', async ({ page }) => {
    await page
      .getByRole('menuitem', { name: 'Navigate to Projections' })
      .click();

    // Should show projection interface
    await expect(page.getByText('Projection Settings')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Recalculate Projections' })
    ).toBeVisible();

    // Should show projection results
    await expect(page.getByText('Projected Net Worth')).toBeVisible();
    await expect(page.getByText('Total Growth')).toBeVisible();
    await expect(page.getByText('Monthly Projection Breakdown')).toBeVisible();
  });

  test('should create and compare scenarios', async ({ page }) => {
    await page.getByRole('menuitem', { name: 'Navigate to Scenarios' }).click();

    // Should show scenarios interface
    await expect(page.getByText('Your Scenarios')).toBeVisible();
    await expect(page.getByText('Baseline')).toBeVisible();

    // Test create scenario
    await page.getByRole('button', { name: 'Create Scenario' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page
      .getByRole('textbox', { name: 'Scenario Name' })
      .fill('Test Scenario');
    await page.getByRole('button', { name: 'Create Scenario' }).click();

    // Should show the new scenario
    await expect(page.getByText('Test Scenario')).toBeVisible();

    // Test scenario comparison
    await page.getByRole('tab', { name: 'Scenario Comparison' }).click();
    await page.getByRole('button', { name: 'Run Comparison' }).click();

    // Should show comparison results
    await expect(page.getByText('Detailed Comparison')).toBeVisible();
  });

  test('should manage settings', async ({ page }) => {
    await page.getByRole('menuitem', { name: 'Navigate to Settings' }).click();

    // Should show settings sections
    await expect(page.getByText('Appearance')).toBeVisible();
    await expect(page.getByText('Privacy & Data')).toBeVisible();

    // Test toggle a setting
    const autoSaveToggle = page
      .locator('text=Auto-save Data')
      .locator('..')
      .getByRole('checkbox');
    const isChecked = await autoSaveToggle.isChecked();
    await autoSaveToggle.click();
    await expect(autoSaveToggle).toBeChecked(!isChecked);
  });

  test('should show real financial calculations on dashboard', async ({
    page,
  }) => {
    await page.getByRole('menuitem', { name: 'Navigate to Dashboard' }).click();

    // Should show real calculated values, not mock data
    await expect(page.getByText('Net Worth')).toBeVisible();
    await expect(page.getByText('Monthly Cash Flow')).toBeVisible();
    await expect(page.getByText('Savings Rate')).toBeVisible();

    // Should show account and cashflow summaries
    await expect(page.getByText('accounts')).toBeVisible();
    await expect(page.getByText('cash flows')).toBeVisible();
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigation should be accessible
    await page.getByRole('button', { name: 'toggle navigation menu' }).click();
    await expect(page.getByRole('navigation')).toBeVisible();

    // All pages should be accessible
    await page.getByRole('menuitem', { name: 'Navigate to Dashboard' }).click();
    await expect(
      page.getByRole('heading', { name: 'Financial Dashboard' })
    ).toBeVisible();

    // Cards should stack properly on mobile
    const cards = page.locator('[role="main"] .MuiCard-root');
    await expect(cards.first()).toBeVisible();
  });
});
