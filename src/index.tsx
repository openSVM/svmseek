// CRITICAL: Import complete polyfills FIRST before any other modules
import './polyfills/index.js';

// Import global error handler early to catch initialization errors
import './utils/globalErrorHandler';

// Import feature flags and safe event listeners
import { isFeatureEnabled, logFeatureFlags } from './utils/featureFlags';
import { safeEventListenerUtility } from './utils/SafeEventListenerUtility';

// Import React and other modules AFTER polyfills
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import * as serviceWorker from './serviceWorker';
import './styles/cssVariables.css';
import './styles/animations.css';
import './styles/theme.css';

// Import logging utility
import { devLog, logInfo, logError } from './utils/logger';

// Secure Buffer initialization without global modification
import { Buffer } from 'buffer';

// Initialize feature-flag controlled global patches
function initializeGlobalPatches() {
  // Log current feature flag status in development
  logFeatureFlags();
  
  // Enable safe event listeners if feature flag is set
  if (isFeatureEnabled('enableSafeEventListeners')) {
    safeEventListenerUtility.enableSafeListeners();
    devLog('🛡️ Safe event listeners enabled via feature flag');
    
    // Expose to window for debugging/testing purposes
    if (typeof window !== 'undefined') {
      (window as any).safeEventListenerUtility = safeEventListenerUtility;
    }
  } else {
    devLog('🎛️ Safe event listeners disabled via feature flag');
  }
}

// Safe initialization function to avoid direct global modification
function initializeRequiredPolyfills() {
  const globalScope = (function() {
    if (typeof window !== 'undefined') return window;
    if (typeof global !== 'undefined') return global;
    return {};
  })();

  // Only initialize if not already present
  if (globalScope && typeof globalScope === 'object') {
    if (!(globalScope as any).Buffer) {
      (globalScope as any).Buffer = Buffer;
    }
    if (!(globalScope as any).global && typeof window !== 'undefined') {
      (globalScope as any).global = globalScope;
    }
  }
}

// Initialize polyfills safely
initializeRequiredPolyfills();

// Initialize feature-flag controlled global patches
initializeGlobalPatches();

devLog('Buffer polyfills and React initialized successfully');

// Wrap the entire app initialization in error handling
function initializeApp() {
  try {
    const container = document.getElementById('root');
    if (!container) {
      throw new Error('Root container not found');
    }

    const root = createRoot(container);

    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    logInfo('React app initialized successfully');

  } catch (error) {
    logError('Failed to initialize React app:', error);

    // Show a fallback error message with safe content
    const container = document.getElementById('root');
    if (container) {
      // SECURITY: Avoid XSS by using textContent instead of innerHTML for dynamic content
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background: #17181a;
        color: #ffffff;
        font-family: 'Avenir Next Medium', sans-serif;
        text-align: center;
        padding: 20px;
      `;
      
      const contentDiv = document.createElement('div');
      
      const iconDiv = document.createElement('div');
      iconDiv.style.cssText = 'font-size: 24px; margin-bottom: 20px;';
      iconDiv.textContent = '⚠️';
      
      const titleDiv = document.createElement('div');
      titleDiv.style.cssText = 'font-size: 18px; margin-bottom: 10px;';
      titleDiv.textContent = 'Application Initialization Failed';
      
      const messageDiv = document.createElement('div');
      messageDiv.style.cssText = 'font-size: 14px; color: #888; margin-bottom: 20px;';
      // SECURITY: Safely display error message using textContent
      messageDiv.textContent = error instanceof Error ? error.message : 'Unknown error occurred';
      
      const reloadButton = document.createElement('button');
      reloadButton.style.cssText = `
        background: #651CE4;
        border: none;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
      `;
      reloadButton.textContent = 'Reload Page';
      reloadButton.onclick = () => window.location.reload();
      
      contentDiv.appendChild(iconDiv);
      contentDiv.appendChild(titleDiv);
      contentDiv.appendChild(messageDiv);
      contentDiv.appendChild(reloadButton);
      errorDiv.appendChild(contentDiv);
      
      // Clear and append safely without innerHTML
      container.textContent = '';
      container.appendChild(errorDiv);
    }
  }
}

// Initialize with error handling
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Register service worker with error handling
try {
  serviceWorker.register();
  devLog('Service worker registered successfully');
} catch (error) {
  logError('Service worker registration failed:', error);
}
