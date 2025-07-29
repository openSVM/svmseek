import { test } from '@playwright/test';

test.describe('Test updated error handling', () => {
  test('Check if enhanced error handling works', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    
    const logs = [];
    const errors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'log') logs.push(msg.text());
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    await page.goto('http://localhost:3000/');
    
    // Wait for the page to fully load and error handling to kick in
    await page.waitForTimeout(10000);
    
    console.log('=== CONSOLE LOGS ===');
    logs.forEach(log => console.log('LOG:', log));
    
    console.log('=== CONSOLE ERRORS ===');
    errors.forEach(error => console.log('ERROR:', error));
    
    // Take screenshot of current state
    await page.screenshot({ path: '/tmp/screenshots/error_handling_test.png', fullPage: true });
    
    // Check what's actually displayed
    const pageContent = await page.textContent('body');
    console.log('=== PAGE CONTENT ===');
    console.log(pageContent?.substring(0, 500));
  });
});