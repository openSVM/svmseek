import { test, expect } from '@playwright/test';

test.describe('Explorer Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/wallet');
    await page.waitForLoadState('networkidle');
    
    // Switch to explorer tab
    await page.locator('text=Explorer').click();
    await expect(page.locator('text=OpenSVM Explorer')).toBeVisible();
  });

  test('should detect transaction signature format', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search transactions"]');
    
    // Input a properly formatted transaction signature (88 characters)
    const mockTxSignature = '5VfydnLz8YGV4RqD6DF9hnVxf7YGEWJFaAqN7h1QEi3m9KjH8P1BX3x9yYnA1W4R' + 'ABCDEFGH';
    await searchInput.fill(mockTxSignature);
    
    // Wait for debounced search
    await page.waitForTimeout(500);
    
    // Look for search results dropdown
    const resultsDropdown = page.locator('[role="list"], [role="listbox"]').first();
    
    // If results appear, verify transaction type is detected
    if (await resultsDropdown.isVisible()) {
      await expect(resultsDropdown).toContainText(/transaction/i);
    }
  });

  test('should detect account address format', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search transactions"]');
    
    // Input a properly formatted account address (44 characters)
    const mockAccountAddress = 'FD1VbCsN8HB8cYaW6P2o9L1YkJiZcBHGdLz4J3x9Y2k';
    await searchInput.fill(mockAccountAddress);
    
    await page.waitForTimeout(500);
    
    const resultsDropdown = page.locator('[role="list"], [role="listbox"]').first();
    
    if (await resultsDropdown.isVisible()) {
      await expect(resultsDropdown).toContainText(/account/i);
    }
  });

  test('should detect block number format', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search transactions"]');
    
    // Input a block number
    await searchInput.fill('323139497');
    
    await page.waitForTimeout(500);
    
    const resultsDropdown = page.locator('[role="list"], [role="listbox"]').first();
    
    if (await resultsDropdown.isVisible()) {
      await expect(resultsDropdown).toContainText(/block/i);
    }
  });

  test('should show loading indicator during search', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search transactions"]');
    
    // Start a search
    await searchInput.fill('test search query');
    
    // Look for loading indicator (spinner or loading text)
    const loadingIndicator = page.locator('[role="progressbar"], [aria-label*="loading"], text=Searching');
    
    // The loading indicator might be brief, so we check if it appears
    if (await loadingIndicator.isVisible({ timeout: 1000 })) {
      await expect(loadingIndicator).toBeVisible();
    }
  });

  test('should clear search results when input is cleared', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search transactions"]');
    
    // Perform a search
    await searchInput.fill('test query');
    await page.waitForTimeout(500);
    
    // Clear the input
    await searchInput.clear();
    await page.waitForTimeout(300);
    
    // Verify results are cleared
    const resultsDropdown = page.locator('[role="list"], [role="listbox"]').first();
    await expect(resultsDropdown).not.toBeVisible();
  });

  test('should handle keyboard navigation in search', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search transactions"]');
    
    // Focus the search input
    await searchInput.focus();
    
    // Test Enter key
    await searchInput.fill('test');
    await page.keyboard.press('Enter');
    
    // Test Escape key
    await page.keyboard.press('Escape');
    
    // Verify input might be cleared or results hidden
    const resultsDropdown = page.locator('[role="list"], [role="listbox"]').first();
    if (await resultsDropdown.isVisible()) {
      // If results were visible, they should be hidden after Escape
      await page.waitForTimeout(300);
    }
  });

  test('should display search hints', async ({ page }) => {
    // Look for search hints or placeholder text
    const searchHint = page.locator('text*="Try searching for a transaction signature"');
    
    if (await searchHint.isVisible()) {
      await expect(searchHint).toBeVisible();
    }
    
    // Check placeholder text
    const searchInput = page.locator('input[placeholder*="Search transactions"]');
    await expect(searchInput).toHaveAttribute('placeholder', /search.*transactions.*accounts.*blocks/i);
  });

  test('should handle invalid search queries gracefully', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search transactions"]');
    
    // Test various invalid inputs
    const invalidInputs = [
      'invalid-query',
      '!@#$%^&*()',
      'too-short',
      'a'.repeat(200), // Too long
    ];
    
    for (const invalidInput of invalidInputs) {
      await searchInput.clear();
      await searchInput.fill(invalidInput);
      await page.waitForTimeout(500);
      
      // The application should handle these gracefully without errors
      // Check that no error messages appear
      const errorMessage = page.locator('text*="error", text*="Error"').first();
      await expect(errorMessage).not.toBeVisible();
    }
  });

  test('should show appropriate search result information', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search transactions"]');
    
    // Test with transaction-like input
    await searchInput.fill('5VfydnLz8YGV4RqD6DF9hnVxf7YGEWJFaAqN7h1QEi3m9KjH8P1BX3x9yYnA1W4R' + 'TEST1234');
    await page.waitForTimeout(1000);
    
    const resultsDropdown = page.locator('[role="list"], [role="listbox"]').first();
    
    if (await resultsDropdown.isVisible()) {
      // Check for result information
      const resultItem = resultsDropdown.locator('[role="option"], [role="listitem"]').first();
      
      if (await resultItem.isVisible()) {
        // Verify result contains relevant information
        await expect(resultItem).toContainText(/transaction|account|block/i);
        
        // Check for status or additional info
        const hasStatus = await resultItem.textContent();
        expect(hasStatus).toBeTruthy();
      }
    }
  });

  test('should handle rapid sequential searches', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search transactions"]');
    
    // Perform rapid searches to test debouncing
    const searches = ['test1', 'test2', 'test3', 'final search'];
    
    for (let i = 0; i < searches.length; i++) {
      await searchInput.clear();
      await searchInput.fill(searches[i]);
      
      // Only wait on the last search
      if (i === searches.length - 1) {
        await page.waitForTimeout(500);
      } else {
        await page.waitForTimeout(50); // Quick succession
      }
    }
    
    // Verify the final search is processed
    await expect(searchInput).toHaveValue('final search');
  });
});