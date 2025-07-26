import { test, expect, Page } from '@playwright/test';
import { join } from 'path';

// Screenshots directory
const screenshotsDir = '/tmp/screenshots';

// Helper function to take screenshot with proper naming
async function takeScreenshot(page: Page, name: string, suffix: string = '') {
  const fileName = suffix ? `${name}_${suffix}.png` : `${name}.png`;
  await page.screenshot({ path: join(screenshotsDir, fileName), fullPage: true });
  console.log(`Screenshot saved: ${fileName}`);
}

// Helper function to wait for page to be fully loaded
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000); // Additional wait for animations and JavaScript
}

test.describe('SVMSeek Wallet - Detailed UI Screenshots', () => {
  test.beforeAll(async () => {
    // Create screenshots directory
    const fs = require('fs');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  test('Capture loading states and interactions', async ({ page }) => {
    // Set viewport size
    await page.setViewportSize({ width: 1200, height: 800 });
    
    console.log('Starting detailed screenshot capture...');
    
    // Test if we're seeing the loading fallback
    await page.goto('http://localhost:3000/');
    await page.waitForTimeout(1000); // Capture initial load
    await takeScreenshot(page, 'initial_load');
    
    // Wait for full load
    await waitForPageLoad(page);
    await takeScreenshot(page, 'after_full_load');
    
    // Check the page content
    const bodyText = await page.textContent('body');
    console.log('Page content preview:', bodyText?.substring(0, 200));
    
    // Take screenshot of browser console errors
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });
    
    // Navigate to different pages with more detailed waiting
    const pages = [
      { url: '/welcome', name: 'welcome_detailed' },
      { url: '/welcome_back', name: 'welcome_back_detailed' },
      { url: '/create_wallet', name: 'create_wallet_detailed' },
      { url: '/restore_wallet', name: 'restore_wallet_detailed' },
      { url: '/wallet', name: 'wallet_detailed' }
    ];
    
    for (const pageInfo of pages) {
      try {
        console.log(`Navigating to ${pageInfo.url}...`);
        await page.goto(`http://localhost:3000${pageInfo.url}`);
        
        // Wait for any dynamic content
        await page.waitForTimeout(2000);
        
        // Try to wait for specific elements that might indicate the page is loaded
        try {
          await page.waitForSelector('div, button, input', { timeout: 5000 });
        } catch (e) {
          console.log('No basic elements found on', pageInfo.url);
        }
        
        await takeScreenshot(page, pageInfo.name);
        
        // Check for any specific content
        const title = await page.title();
        console.log(`Page title for ${pageInfo.url}: ${title}`);
        
        // Look for loading text
        const hasLoadingText = await page.locator('text=Loading').count();
        if (hasLoadingText > 0) {
          console.log(`Loading text found on ${pageInfo.url}`);
        }
        
        // Look for SVMSeek branding
        const hasSVMSeekText = await page.locator('text=SVMSeek').count();
        if (hasSVMSeekText > 0) {
          console.log(`SVMSeek branding found on ${pageInfo.url}`);
        }
        
      } catch (error) {
        console.log(`Failed to capture ${pageInfo.url}:`, error.message);
      }
    }
    
    // Print any console errors found
    if (logs.length > 0) {
      console.log('Console errors found:', logs);
    }
    
    console.log('Detailed screenshot capture complete!');
  });

  test('Try to interact with specific elements', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Go to welcome page and try to find interactive elements
    await page.goto('http://localhost:3000/welcome');
    await waitForPageLoad(page);
    
    // Look for buttons
    const buttons = await page.locator('button').count();
    console.log(`Found ${buttons} buttons on welcome page`);
    
    if (buttons > 0) {
      await takeScreenshot(page, 'welcome_with_buttons');
      
      // Try to click the first button
      try {
        await page.locator('button').first().click();
        await page.waitForTimeout(2000);
        await takeScreenshot(page, 'after_button_click');
      } catch (error) {
        console.log('Button click failed:', error.message);
      }
    }
    
    // Look for links
    const links = await page.locator('a').count();
    console.log(`Found ${links} links on page`);
    
    // Look for form elements
    const inputs = await page.locator('input').count();
    console.log(`Found ${inputs} input fields on page`);
    
    await takeScreenshot(page, 'welcome_final_state');
  });
});