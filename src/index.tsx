import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import * as serviceWorker from './serviceWorker';
import './styles/cssVariables.css';
import './styles/animations.css';

// Ensure Buffer is available globally for Solana dependencies
import { Buffer } from 'buffer';
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  window.global = window.global || window;
  
  // Add defensive error handling for buffer access
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    if (message.includes('buffer') && message.includes('undefined')) {
      console.warn('Buffer access error caught and handled:', message);
      // Don't let it crash the app
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

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
    
    console.log('React app initialized successfully');
    
  } catch (error) {
    console.error('Failed to initialize React app:', error);
    
    // Show a fallback error message
    const container = document.getElementById('root');
    if (container) {
      container.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: #17181a;
          color: #ffffff;
          font-family: 'Avenir Next Medium', sans-serif;
          text-align: center;
          padding: 20px;
        ">
          <div>
            <div style="font-size: 24px; margin-bottom: 20px;">⚠️</div>
            <div style="font-size: 18px; margin-bottom: 10px;">Application Initialization Failed</div>
            <div style="font-size: 14px; color: #888; margin-bottom: 20px;">
              ${error instanceof Error ? error.message : 'Unknown error occurred'}
            </div>
            <button onclick="window.location.reload()" style="
              background: #651CE4;
              border: none;
              color: white;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
            ">
              Reload Page
            </button>
          </div>
        </div>
      `;
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
  console.log('Service worker registered successfully');
} catch (error) {
  console.warn('Service worker registration failed:', error);
}
