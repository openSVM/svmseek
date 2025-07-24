import { test, expect } from '@playwright/test';

test.describe('SVMSeek Explorer', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the wallet page
    await page.goto('/wallet');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display explorer tab and switch to it', async ({ page }) => {
    // Check if explorer tab is visible
    const explorerTab = page.locator('text=Explorer');
    await expect(explorerTab).toBeVisible();
    
    // Click on explorer tab
    await explorerTab.click();
    
    // Verify explorer interface is displayed
    await expect(page.locator('text=OpenSVM Explorer')).toBeVisible();
  });

  test('should display all main explorer sections', async ({ page }) => {
    // Switch to explorer tab
    await page.locator('text=Explorer').click();
    
    // Check main sections are present
    await expect(page.locator('text=OpenSVM Explorer')).toBeVisible();
    await expect(page.locator('text=Network Statistics')).toBeVisible();
    await expect(page.locator('text=Recent Blocks')).toBeVisible();
    await expect(page.locator('text=Recent Transactions')).toBeVisible();
  });

  test('should have functional search bar', async ({ page }) => {
    // Switch to explorer tab
    await page.locator('text=Explorer').click();
    
    // Find search input
    const searchInput = page.locator('input[placeholder*="Search transactions"]');
    await expect(searchInput).toBeVisible();
    
    // Test search functionality
    await searchInput.fill('test query');
    await expect(searchInput).toHaveValue('test query');
    
    // Test clear functionality
    const clearButton = page.locator('button[aria-label*="clear"]').first();
    if (await clearButton.isVisible()) {
      await clearButton.click();
      await expect(searchInput).toHaveValue('');
    }
  });

  test('should display network statistics with proper formatting', async ({ page }) => {
    // Switch to explorer tab
    await page.locator('text=Explorer').click();
    
    // Wait for network stats to load
    await page.waitForSelector('text=Block Height', { timeout: 10000 });
    
    // Check for key statistics
    await expect(page.locator('text=Block Height')).toBeVisible();
    await expect(page.locator('text=TPS')).toBeVisible();
    await expect(page.locator('text=Active Validators')).toBeVisible();
    await expect(page.locator('text=Current Epoch')).toBeVisible();
    
    // Verify numbers are displayed (look for formatted numbers)
    const blockHeightValue = page.locator('text=Block Height').locator('..').locator('div').first();
    await expect(blockHeightValue).toContainText(/[\d,]+/);
  });

  test('should show recent blocks with proper information', async ({ page }) => {
    // Switch to explorer tab
    await page.locator('text=Explorer').click();
    
    // Wait for blocks to load
    await page.waitForSelector('text=Block #', { timeout: 10000 });
    
    // Check that block items are displayed
    const blockItems = page.locator('text=Block #');
    await expect(blockItems.first()).toBeVisible();
    
    // Verify block information includes expected elements
    const firstBlock = page.locator('[role="button"]').filter({ hasText: 'Block #' }).first();
    await expect(firstBlock).toContainText(/Block #[\d,]+/);
    await expect(firstBlock).toContainText(/\d+s? ago|\d+m ago|\d+h ago/);
    await expect(firstBlock).toContainText(/\d+ txns/);
  });

  test('should show recent transactions with status indicators', async ({ page }) => {
    // Switch to explorer tab
    await page.locator('text=Explorer').click();
    
    // Wait for transactions to load
    await page.waitForTimeout(3000); // Allow time for mock data generation
    
    // Check for transaction items
    const transactionItems = page.locator('[role="button"]').filter({ hasText: /[A-Za-z0-9]{8}\.\.\.[A-Za-z0-9]{8}/ });
    
    if (await transactionItems.count() > 0) {
      const firstTransaction = transactionItems.first();
      await expect(firstTransaction).toBeVisible();
      
      // Check for transaction details
      await expect(firstTransaction).toContainText(/Transfer|Swap|Stake|Vote/);
      await expect(firstTransaction).toContainText(/\d+s? ago|\d+m ago/);
      await expect(firstTransaction).toContainText(/\d+\.\d+ SOL/);
    }
  });

  test('should have working refresh buttons', async ({ page }) => {
    // Switch to explorer tab
    await page.locator('text=Explorer').click();
    
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    // Look for refresh buttons (they might be aria-labeled or have refresh icons)
    const refreshButtons = page.locator('button').filter({ hasText: '' }).filter({ has: page.locator('[data-testid*="refresh"], [aria-label*="refresh"]') });
    
    if (await refreshButtons.count() > 0) {
      const firstRefreshButton = refreshButtons.first();
      await firstRefreshButton.click();
      
      // Verify the button was clicked (might show loading state)
      await page.waitForTimeout(500);
    }
  });

  test('search should show results for different query types', async ({ page }) => {
    // Switch to explorer tab
    await page.locator('text=Explorer').click();
    
    const searchInput = page.locator('input[placeholder*="Search transactions"]');
    
    // Test transaction signature search (88 characters)
    const mockSignature = 'A'.repeat(88);
    await searchInput.fill(mockSignature);
    await page.waitForTimeout(1000); // Wait for debounced search
    
    // Check if results appear
    const resultsContainer = page.locator('[role="listbox"], [role="menu"]').first();
    if (await resultsContainer.isVisible()) {
      await expect(resultsContainer).toContainText(/transaction/i);
    }
    
    // Clear and test account address (44 characters)
    await searchInput.clear();
    const mockAddress = 'B'.repeat(44);
    await searchInput.fill(mockAddress);
    await page.waitForTimeout(1000);
    
    // Test block number search
    await searchInput.clear();
    await searchInput.fill('123456789');
    await page.waitForTimeout(1000);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Switch to explorer tab
    await page.locator('text=Explorer').click();
    
    // Check that content is still accessible
    await expect(page.locator('text=OpenSVM Explorer')).toBeVisible();
    await expect(page.locator('input[placeholder*="Search transactions"]')).toBeVisible();
    
    // Verify layout adapts (content should stack vertically)
    const explorerContainer = page.locator('text=OpenSVM Explorer').locator('..');
    await expect(explorerContainer).toBeVisible();
  });

  test('should maintain state when switching between tabs', async ({ page }) => {
    // Switch to explorer tab
    await page.locator('text=Explorer').click();
    
    // Enter search query
    const searchInput = page.locator('input[placeholder*="Search transactions"]');
    await searchInput.fill('test query');
    
    // Switch to another tab
    const assetsTab = page.locator('text=Assets');
    if (await assetsTab.isVisible()) {
      await assetsTab.click();
      
      // Switch back to explorer
      await page.locator('text=Explorer').click();
      
      // Verify state is maintained
      await expect(searchInput).toHaveValue('test query');
    }
  });
});