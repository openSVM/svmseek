/**
 * SVMSeek Wallet Injection Script
 *
 * This script is injected into iframe environments to provide secure wallet
 * provider interfaces. It creates standardized wallet APIs (Solana, Phantom, SVMSeek)
 * while maintaining security through controlled message passing.
 *
 * @version 1.0.0
 * @author SVMSeek Team
 * @security This script implements iframe sandboxing and secure postMessage communication
 */

import { TIMEOUT_CONSTANTS } from '../utils/constants';

// TypeScript interfaces for better type safety
// Note: These are used within the generated string template for documentation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface WalletRequest {
  type: 'WALLET_REQUEST';
  id: string;
  method: string;
  params: any[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface WalletResponse {
  type: 'WALLET_RESPONSE';
  id: string;
  result: any;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface WalletError {
  type: 'WALLET_ERROR';
  id: string;
  error: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface PendingRequest {
  resolve: (value: any) => void;
  reject: (error: Error) => void;
}

/**
 * Create the wallet injection script with proper TypeScript typing
 * @returns The complete injection script as a string
 */
export function createWalletInjectionScript(): string {
  return `
(function() {
  'use strict';

  /**
   * SVMSeek Wallet Provider Injection Script
   * Version: 1.0.0
   *
   * This script creates secure wallet provider interfaces for iframe-based dApps.
   * It implements the standard Solana wallet adapter interface while maintaining
   * security through message passing to the parent window.
   */

  // Prevent multiple injections
  if (window.svmseekWalletInjected) {
    console.warn('SVMSeek: Wallet providers already injected, skipping duplicate injection');
    return;
  }

  // Request tracking
  let requestId = 0;
  const pendingRequests = new Map();

  /**
   * Create a standardized wallet provider interface
   * @param {string} providerName - Name of the wallet provider
   * @returns {object} Wallet provider interface
   */
  const createWalletProvider = (providerName) => {
    const provider = {
      // Provider identification
      isConnected: false,
      publicKey: null,

      /**
       * Send a request to the parent wallet interface
       * @param {string} method - Wallet method to call
       * @param {Array} params - Method parameters
       * @returns {Promise} Request result
       */
      async request(method, params = []) {
        return new Promise((resolve, reject) => {
          const id = \`\${providerName}_\${++requestId}\`;

          // Store pending request for response handling
          pendingRequests.set(id, { resolve, reject });

          try {
            // Send request to parent window with security validation
            window.parent.postMessage({
              type: 'WALLET_REQUEST',
              id,
              method,
              params
            }, window.location.origin); // Use specific origin instead of '*'

            // Timeout handling with configurable timeout
            setTimeout(() => {
              if (pendingRequests.has(id)) {
                pendingRequests.delete(id);
                reject(new Error(\`Request timeout: \${method} after ${TIMEOUT_CONSTANTS.MESSAGE_RESPONSE}ms\`));
              }
            }, ${TIMEOUT_CONSTANTS.MESSAGE_RESPONSE});

          } catch (error) {
            pendingRequests.delete(id);
            reject(new Error(\`Failed to send request: \${error.message}\`));
          }
        });
      },

      /**
       * Connect to the wallet
       * @returns {Promise<{publicKey: string}>} Connection result
       */
      async connect() {
        try {
          const result = await this.request('connect');
          this.isConnected = true;
          this.publicKey = result.publicKey;

          // Dispatch connection event
          window.dispatchEvent(new CustomEvent('wallet-connected', {
            detail: { provider: providerName, publicKey: result.publicKey }
          }));

          return result;
        } catch (error) {
          this.isConnected = false;
          this.publicKey = null;

          // Dispatch error event
          window.dispatchEvent(new CustomEvent('wallet-error', {
            detail: { provider: providerName, error: error.message }
          }));

          throw error;
        }
      },

      /**
       * Disconnect from the wallet
       * @returns {Promise<void>} Disconnection result
       */
      async disconnect() {
        try {
          const result = await this.request('disconnect');
          this.isConnected = false;
          this.publicKey = null;

          // Dispatch disconnection event
          window.dispatchEvent(new CustomEvent('wallet-disconnected', {
            detail: { provider: providerName }
          }));

          return result;
        } catch (error) {
          // Even if the request fails, reset local state
          this.isConnected = false;
          this.publicKey = null;
          throw error;
        }
      },

      /**
       * Sign a transaction (blocked for security)
       * @param {object} transaction - Transaction to sign
       * @returns {Promise} Will always reject for security
       */
      async signTransaction(transaction) {
        if (!this.isConnected) {
          throw new Error('Wallet not connected');
        }

        // Security: Block transaction signing in iframe context
        return this.request('signTransaction', [transaction]);
      },

      /**
       * Sign multiple transactions (blocked for security)
       * @param {Array} transactions - Transactions to sign
       * @returns {Promise} Will always reject for security
       */
      async signAllTransactions(transactions) {
        if (!this.isConnected) {
          throw new Error('Wallet not connected');
        }

        // Security: Block batch transaction signing in iframe context
        return this.request('signAllTransactions', [transactions]);
      },

      /**
       * Sign a message (blocked for security)
       * @param {Uint8Array} message - Message to sign
       * @returns {Promise} Will always reject for security
       */
      async signMessage(message) {
        if (!this.isConnected) {
          throw new Error('Wallet not connected');
        }

        // Security: Block message signing in iframe context
        return this.request('signMessage', [message]);
      },

      /**
       * Add event listener for wallet events
       * @param {string} event - Event name
       * @param {Function} handler - Event handler
       */
      on(event, handler) {
        window.addEventListener(\`wallet-\${event}\`, handler);
      },

      /**
       * Remove event listener
       * @param {string} event - Event name
       * @param {Function} handler - Event handler
       */
      off(event, handler) {
        window.removeEventListener(\`wallet-\${event}\`, handler);
      }
    };

    return provider;
  };

  /**
   * Handle responses from the parent window
   * Processes wallet responses and errors with proper type checking
   */
  const handleParentMessage = (event) => {
    try {
      // Security: Only accept messages from parent window
      if (event.source !== window.parent) {
        return;
      }

      // Validate message data structure
      if (!event.data || typeof event.data !== 'object') {
        console.warn('SVMSeek: Received invalid message data structure:', event.data);
        return;
      }

      const { type, id, result, error } = event.data;

      // Validate required fields
      if (!type || typeof type !== 'string') {
        console.warn('SVMSeek: Received message without valid type:', event.data);
        return;
      }

      // Handle successful responses
      if (type === 'WALLET_RESPONSE' && id && pendingRequests.has(id)) {
        const { resolve } = pendingRequests.get(id);
        pendingRequests.delete(id);
        resolve(result);
        return;
      }

      // Handle error responses
      if (type === 'WALLET_ERROR' && id && pendingRequests.has(id)) {
        const { reject } = pendingRequests.get(id);
        pendingRequests.delete(id);
        reject(new Error(error || 'Unknown wallet error'));
        return;
      }

      // Handle custom SVMSeek events
      if (type === 'SVMSEEK_EVENT') {
        window.dispatchEvent(new CustomEvent('svmseek-event', {
          detail: event.data.payload
        }));
        return;
      }

    } catch (err) {
      console.error('SVMSeek: Error processing parent message:', err, event.data);
    }
  };

  // Set up message listener for parent communication
  window.addEventListener('message', handleParentMessage);

  try {
    // Create wallet provider instances
    const solanaProvider = createWalletProvider('solana');
    const phantomProvider = createWalletProvider('phantom');
    const svmseekProvider = createWalletProvider('svmseek');

    // Check for existing providers to avoid conflicts
    const existingProviders = {
      solana: window.solana,
      phantom: window.phantom,
      svmseek: window.svmseek
    };

    // Inject providers with proper property descriptors for security
    // Only inject if not already present to avoid conflicts
    if (!existingProviders.solana) {
      Object.defineProperty(window, 'solana', {
        value: solanaProvider,
        writable: false,
        configurable: false,
        enumerable: true
      });
    } else {
      console.warn('SVMSeek: Solana provider already exists, skipping injection');
    }

    if (!existingProviders.phantom) {
      Object.defineProperty(window, 'phantom', {
        value: {
          solana: phantomProvider,
          isPhantom: true
        },
        writable: false,
        configurable: false,
        enumerable: true
      });
    } else {
      console.warn('SVMSeek: Phantom provider already exists, skipping injection');
    }

    if (!existingProviders.svmseek) {
      Object.defineProperty(window, 'svmseek', {
        value: svmseekProvider,
        writable: false,
        configurable: false,
        enumerable: true
      });
    } else {
      console.warn('SVMSeek: SVMSeek provider already exists, skipping injection');
    }

    // Mark injection as complete
    Object.defineProperty(window, 'svmseekWalletInjected', {
      value: true,
      writable: false,
      configurable: false,
      enumerable: false
    });

    // Store provider references for external access
    Object.defineProperty(window, 'svmseekProviders', {
      value: {
        solana: window.solana || solanaProvider,
        phantom: window.phantom?.solana || phantomProvider,
        svmseek: window.svmseek || svmseekProvider
      },
      writable: false,
      configurable: false,
      enumerable: false
    });

    // Dispatch ready event
    window.dispatchEvent(new CustomEvent('svmseek-wallet-ready', {
      detail: {
        version: '1.0.0',
        providers: ['solana', 'phantom', 'svmseek'],
        timestamp: Date.now(),
        conflictsDetected: Object.values(existingProviders).some(p => p !== undefined)
      }
    }));

    console.log('SVMSeek: Wallet providers injected successfully', {
      conflictsDetected: Object.values(existingProviders).some(p => p !== undefined),
      existingProviders: Object.keys(existingProviders).filter(key => existingProviders[key])
    });

  } catch (error) {
    console.error('SVMSeek: Failed to inject wallet providers:', error);

    // Dispatch error event
    window.dispatchEvent(new CustomEvent('svmseek-wallet-error', {
      detail: {
        error: error.message,
        timestamp: Date.now()
      }
    }));
  }

  /**
   * Cleanup function for proper resource management
   */
  window.svmseekCleanup = function() {
    window.removeEventListener('message', handleParentMessage);
    pendingRequests.clear();
    console.log('SVMSeek: Wallet injection cleaned up');
  };

})();

//# sourceMappingURL=data:application/json;base64,${btoa(JSON.stringify({
  version: 3,
  sources: ['wallet-injection.ts'],
  names: [],
  mappings: 'AAAA,uBAAuB',
  file: 'wallet-injection.js'
}))}
`;
}

/**
 * Create a secure blob URL for the injection script
 * @returns {string} Blob URL for the script
 */
export function createInjectionScriptBlobURL(): string {
  const script = createWalletInjectionScript();
  const blob = new Blob([script], {
    type: 'application/javascript'
  });
  return URL.createObjectURL(blob);
}

/**
 * Cleanup function to revoke blob URLs
 * @param {string} blobURL - The blob URL to revoke
 */
export function cleanupInjectionScriptBlobURL(blobURL: string): void {
  URL.revokeObjectURL(blobURL);
}
