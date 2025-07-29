import { test, expect, Page } from '@playwright/test';

test.describe('Debug application loading', () => {
  test('Check console errors and network requests', async ({ page }) => {
    const errors = [];
    const warnings = [];
    const networkRequests = [];
    
    // Capture console messages
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });
    
    // Capture network requests
    page.on('request', request => {
      networkRequests.push(`${request.method()} ${request.url()}`);
    });
    
    // Capture failed requests
    page.on('requestfailed', request => {
      console.log(`FAILED REQUEST: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });
    
    await page.goto('http://localhost:3000/');
    
    // Wait a bit for the app to try to load
    await page.waitForTimeout(10000);
    
    console.log('=== CONSOLE ERRORS ===');
    errors.forEach(error => console.log('ERROR:', error));
    
    console.log('=== CONSOLE WARNINGS ===');
    warnings.forEach(warning => console.log('WARNING:', warning));
    
    console.log('=== NETWORK REQUESTS ===');
    networkRequests.forEach(req => console.log('REQUEST:', req));
    
    // Check what's in the DOM
    const bodyHTML = await page.innerHTML('body');
    console.log('=== BODY HTML (first 1000 chars) ===');
    console.log(bodyHTML.substring(0, 1000));
    
    // Check if React root is there
    const reactRoot = await page.locator('#root').innerHTML();
    console.log('=== REACT ROOT CONTENT ===');
    console.log(reactRoot.substring(0, 500));
  });
});