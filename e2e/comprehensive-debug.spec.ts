import { test, expect } from '@playwright/test';

test.describe('Comprehensive error debugging', () => {
  test('Capture all error types and states', async ({ page }) => {
    const errors = [];
    const warnings = [];
    const logs = [];
    const exceptions = [];
    
    // Capture all console messages
    page.on('console', msg => {
      const text = msg.text();
      switch (msg.type()) {
        case 'error':
          errors.push(text);
          break;
        case 'warning':
          warnings.push(text);
          break;
        case 'log':
          logs.push(text);
          break;
      }
    });
    
    // Capture page errors
    page.on('pageerror', exception => {
      exceptions.push(`PAGE ERROR: ${exception.message}\nStack: ${exception.stack}`);
    });
    
    // Capture request failures  
    page.on('requestfailed', request => {
      exceptions.push(`REQUEST FAILED: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });
    
    console.log('Starting comprehensive debugging...');
    
    await page.goto('http://localhost:3000/');
    
    // Wait longer to see what happens
    await page.waitForTimeout(15000);
    
    // Check if React is loaded by looking for any React-related globals
    const reactStatus = await page.evaluate(() => {
      return {
        hasReact: typeof window.React !== 'undefined',
        hasReactDOM: typeof window.ReactDOM !== 'undefined',
        hasBufferPolyfill: typeof window.Buffer !== 'undefined',
        hasProcess: typeof window.process !== 'undefined',
        hasGlobal: typeof window.global !== 'undefined',
        documentReadyState: document.readyState,
        rootElement: document.getElementById('root') ? 'exists' : 'missing',
        rootChildren: document.getElementById('root')?.children?.length || 0,
        rootInnerHTML: document.getElementById('root')?.innerHTML?.substring(0, 200) || 'empty'
      };
    });
    
    console.log('=== REACT/RUNTIME STATUS ===');
    console.log(JSON.stringify(reactStatus, null, 2));
    
    console.log('=== CONSOLE LOGS ===');
    logs.forEach(log => console.log('LOG:', log));
    
    console.log('=== CONSOLE ERRORS ===');
    errors.forEach(error => console.log('ERROR:', error));
    
    console.log('=== CONSOLE WARNINGS ===');
    warnings.forEach(warning => console.log('WARNING:', warning));
    
    console.log('=== PAGE EXCEPTIONS ===');
    exceptions.forEach(exception => console.log('EXCEPTION:', exception));
    
    // Try to evaluate if any of the main Solana/crypto modules are causing issues
    const moduleStatus = await page.evaluate(() => {
      try {
        // Check if any modules that might be problematic are loaded
        const checks = {};
        
        // Try to access some common problematic areas
        try {
          checks.webCrypto = typeof window.crypto !== 'undefined' && typeof window.crypto.subtle !== 'undefined';
        } catch (e) {
          checks.webCrypto = `ERROR: ${e.message}`;
        }
        
        try {
          checks.buffer = typeof Buffer !== 'undefined' && typeof Buffer.from === 'function';
        } catch (e) {
          checks.buffer = `ERROR: ${e.message}`;
        }
        
        try {
          checks.textEncoder = typeof TextEncoder !== 'undefined';
        } catch (e) {
          checks.textEncoder = `ERROR: ${e.message}`;
        }
        
        return checks;
      } catch (globalError) {
        return { globalError: globalError.message };
      }
    });
    
    console.log('=== MODULE STATUS ===');
    console.log(JSON.stringify(moduleStatus, null, 2));
    
    // Take a final screenshot
    await page.screenshot({ path: '/tmp/screenshots/debug_final_state.png', fullPage: true });
  });
});