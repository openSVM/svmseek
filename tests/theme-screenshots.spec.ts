import { test, expect, Page } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

// Theme configurations
const themes = {
  eink: 'E-Ink Grayscale',
  ascii: 'ASCII Terminal', 
  borland: 'Borland Blue',
  paper: 'Paper White',
  solarized: 'Solarized Dark',
  cyberpunk: 'Cyberpunk Pink',
  newspaper: 'NY Times',
  win95: 'Windows 95',
  winxp: 'Windows XP',
  macos: 'macOS Aqua',
  linux: 'Linux TUI'
};

// Device configurations
const devices = {
  desktop: { width: 1200, height: 800 },
  ipad: { width: 768, height: 1024 },
  mobile_vertical: { width: 375, height: 667 },
  mobile_horizontal: { width: 667, height: 375 }
};

// Pages to capture
const pages = ['welcome', 'create_wallet', 'restore_wallet'];

// Helper function to set theme and wait
async function setTheme(page: Page, themeName: string) {
  await page.evaluate((theme) => {
    localStorage.setItem('theme-name', theme);
    localStorage.setItem('onboarding-setup-complete', 'true');
  }, themeName);
  
  // Reload to apply theme
  await page.reload();
  await page.waitForTimeout(2000);
}

// Helper function to navigate to specific page
async function navigateToPage(page: Page, pageName: string) {
  if (pageName === 'welcome') {
    await page.goto('/welcome');
  } else {
    await page.goto(`/${pageName}`);
  }
  await page.waitForTimeout(1000);
}

test.describe('Theme Screenshots', () => {
  // Create screenshots directory
  test.beforeAll(async () => {
    const screenshotDir = path.join(__dirname, '../docs/screenshots/themes');
    await fs.mkdir(screenshotDir, { recursive: true });
  });

  for (const [themeKey, themeName] of Object.entries(themes)) {
    for (const [deviceKey, deviceConfig] of Object.entries(devices)) {
      for (const pageName of pages) {
        test(`${themeName} - ${deviceKey} - ${pageName}`, async ({ page }) => {
          // Set viewport
          await page.setViewportSize(deviceConfig);
          
          // Navigate to homepage first
          await page.goto('/');
          
          // Set theme
          await setTheme(page, themeKey);
          
          // Navigate to specific page
          await navigateToPage(page, pageName);
          
          // Wait for any animations to complete
          await page.waitForTimeout(2000);
          
          // Take screenshot
          const filename = `${themeKey}_${deviceKey}_${pageName}.png`;
          const screenshotPath = path.join(__dirname, '../docs/screenshots/themes', filename);
          
          await page.screenshot({
            path: screenshotPath,
            fullPage: false
          });
          
          console.log(`✅ Screenshot saved: ${filename}`);
        });
      }
    }
  }
});

test.describe('Theme Showcase', () => {
  test('Generate theme showcase grid', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    
    // Create a showcase page that displays all themes
    await page.goto('/');
    
    const showcaseHtml = `
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          margin: 0; 
          padding: 20px; 
          background: #f5f5f5;
        }
        .showcase-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .theme-card {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          background: white;
        }
        .theme-preview {
          width: 100%;
          height: 200px;
          position: relative;
          overflow: hidden;
        }
        .theme-info {
          padding: 16px;
          text-align: center;
        }
        .theme-name {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #333;
        }
        .theme-key {
          font-size: 14px;
          color: #666;
          font-family: monospace;
          background: #f0f0f0;
          padding: 4px 8px;
          border-radius: 4px;
          display: inline-block;
        }
        h1 {
          text-align: center;
          color: #333;
          margin-bottom: 40px;
          font-size: 32px;
        }
      </style>
      <h1>SVMSeek Wallet - All Available Themes</h1>
      <div class="showcase-grid">
        ${Object.entries(themes).map(([key, name]) => `
          <div class="theme-card">
            <div class="theme-preview" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 24px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                ${name}
              </div>
            </div>
            <div class="theme-info">
              <div class="theme-name">${name}</div>
              <div class="theme-key">${key}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    await page.setContent(showcaseHtml);
    await page.waitForTimeout(1000);
    
    const screenshotPath = path.join(__dirname, '../docs/screenshots/themes', 'theme_showcase.png');
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    
    console.log('✅ Theme showcase saved: theme_showcase.png');
  });
});