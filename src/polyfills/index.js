/* eslint-disable no-undef */
// Import the browser-compatible crypto utilities FIRST
import '../utils/crypto-browser-compatible.js';

// Import the ultimate fix
import './ultimate-fix.js';

// Import and initialize the os polyfill for browser compatibility
import osPolyfill from './os-browser.js';
import { devLog } from '../utils/logger';

// Ensure os module is available globally for dependencies like anchor
if (typeof window !== 'undefined') {
  // Make os module available through require function if it exists
  if (typeof window.require === 'undefined') {
    window.require = function(moduleName) {
      if (moduleName === 'os') {
        return osPolyfill;
      }
      throw new Error(`Module ${moduleName} not found`);
    };
  } else {
    const originalRequire = window.require;
    window.require = function(moduleName) {
      if (moduleName === 'os') {
        return osPolyfill;
      }
      return originalRequire(moduleName);
    };
  }
}

devLog('Buffer polyfills loaded with browser-compatible crypto, os polyfill, and ultimate protection');
