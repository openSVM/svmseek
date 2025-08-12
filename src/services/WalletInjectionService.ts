import { logWarn, logError } from '../utils/logger';
import { TIMEOUT_CONSTANTS } from '../utils/constants';
import {
  createInjectionScriptBlobURL,
  cleanupInjectionScriptBlobURL
} from './WalletInjectionScript';
/**
 * Dedicated service for secure wallet injection into iframe-based Web3 browser
 * Handles all wallet provider functionality and security concerns
 */

export interface WalletProvider {
  isConnected: boolean;
  publicKey: string | null;
  signTransaction: (transaction: any) => Promise<any>;
  signAllTransactions: (transactions: any[]) => Promise<any[]>;
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  connect: () => Promise<{ publicKey: string }>;
  disconnect: () => Promise<void>;
}

export interface InjectionResult {
  success: boolean;
  error?: string;
  injectedProviders?: string[];
}

export class WalletInjectionService {
  private iframe: HTMLIFrameElement | null = null;
  private wallet: any = null;
  private injected = new Set<string>();
  private messageHandlers = new Map<string, (data: any) => void>();
  private messageListener: ((event: MessageEvent) => void) | null = null;

  // Rate limiting for request throttling
  private requestCounts = new Map<string, number>();
  private readonly MAX_REQUESTS_PER_MINUTE = 60;
  private readonly REQUEST_WINDOW_MS = 60000; // 1 minute
  private rateLimitCleanupInterval: NodeJS.Timeout | null = null;

  constructor(wallet: any) {
    this.wallet = wallet;
    this.setupMessageListener();
    this.setupRateLimitingCleanup();
  }

  /**
   * Inject wallet providers into the iframe securely
   */
  public async injectWalletProviders(iframe: HTMLIFrameElement): Promise<InjectionResult> {
    try {
      this.iframe = iframe;

      // Enhanced security: Check iframe source origin
      const iframeSrc = iframe.src;
      if (iframeSrc && !this.isAllowedOrigin(iframeSrc)) {
        logWarn('Wallet injection blocked for untrusted origin:', iframeSrc);
        return {
          success: false,
          error: 'Wallet injection blocked for security reasons: untrusted origin'
        };
      }

      // Wait for iframe to load
      await this.waitForIframeLoad(iframe);

      // Create secure injection script using pre-built module
      const scriptUrl = createInjectionScriptBlobURL();

      // Execute injection
      const success = await this.executeInjection(iframe, scriptUrl);

      // Clean up blob URL
      cleanupInjectionScriptBlobURL(scriptUrl);

      if (success) {
        const providers = ['solana', 'phantom', 'svmseek'];
        providers.forEach(provider => this.injected.add(provider));

        return {
          success: true,
          injectedProviders: providers
        };
      } else {
        return {
          success: false,
          error: 'Failed to inject wallet providers'
        };
      }
    } catch (error) {
      logError('Wallet injection failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Setup rate limiting cleanup to prevent memory leaks
   */
  private setupRateLimitingCleanup(): void {
    if (this.rateLimitCleanupInterval) {
      clearInterval(this.rateLimitCleanupInterval);
    }
    
    this.rateLimitCleanupInterval = setInterval(() => {
      this.requestCounts.clear();
    }, this.REQUEST_WINDOW_MS);
    
    // PERFORMANCE: Prevent interval from keeping Node.js process alive in tests
    if (this.rateLimitCleanupInterval && typeof this.rateLimitCleanupInterval.unref === 'function') {
      this.rateLimitCleanupInterval.unref();
    }
  }

  /**
   * Check and enforce rate limiting for requests
   */
  private checkRateLimit(origin: string): boolean {
    const currentTime = Date.now();
    const requestKey = `${origin}_${Math.floor(currentTime / this.REQUEST_WINDOW_MS)}`;

    const currentCount = this.requestCounts.get(requestKey) || 0;
    if (currentCount >= this.MAX_REQUESTS_PER_MINUTE) {
      logWarn(`Rate limit exceeded for origin: ${origin}`);
      return false;
    }

    this.requestCounts.set(requestKey, currentCount + 1);
    return true;
  }

  /**
   * Check if the origin is allowed for wallet injection
   * Implements same-origin policy with allowlist for trusted domains
   */
  private isAllowedOrigin(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const origin = urlObj.origin;
      const hostname = urlObj.hostname;

      // Allow same origin (localhost, 127.0.0.1 for development) with regex validation
      if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(hostname)) {
        return true;
      }

      // Allow SVMSeek domains with regex validation for enhanced security
      const allowedDomainPatterns = [
        /^svmseek\.com$/,
        /^www\.svmseek\.com$/,
        /^app\.svmseek\.com$/,
        /^wallet\.svmseek\.com$/,
        /^[a-zA-Z0-9-]+\.svmseek\.com$/ // Secure subdomain pattern
      ];

      // Check against regex patterns for enhanced security (not just .endsWith())
      const isAllowed = allowedDomainPatterns.some(pattern => pattern.test(hostname));

      if (!isAllowed) {
        logWarn('Blocked wallet injection for untrusted origin:', origin);
        return false;
      }

      return true;
    } catch (error) {
      logError('Failed to parse URL for origin check:', url, error);
      return false;
    }
  }

  /**
   * Handle messages from the iframe with rate limiting and enhanced security
   */
  private setupMessageListener(): void {
    this.messageListener = (event) => {
      try {
        if (!this.iframe || event.source !== this.iframe.contentWindow) {
          return;
        }

        // Apply rate limiting based on origin
        const origin = event.origin || 'unknown';
        if (!this.checkRateLimit(origin)) {
          logWarn('Rate limited message from origin:', origin);
          return;
        }

        // Invariant type guards for enhanced security
        if (!this.validateIncomingMessage(event.data)) {
          logWarn('WalletInjectionService: Message failed validation', event.data);
          return;
        }

        const { type, id, method, params } = event.data;

        if (type === 'WALLET_REQUEST') {
          this.handleWalletRequest(id, method, params);
        }
      } catch (error) {
        logError('WalletInjectionService: Error processing message:', error, event.data);
      }
    };

    window.addEventListener('message', this.messageListener);
  }

  /**
   * Validate incoming postMessage data with invariant type guards
   */
  private validateIncomingMessage(data: any): boolean {
    // Basic structure validation
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Required field validation with type guards
    if (!data.type || typeof data.type !== 'string') {
      return false;
    }

    // Validate request-specific fields
    if (data.type === 'WALLET_REQUEST') {
      if (!data.id || typeof data.id !== 'string') {
        return false;
      }
      if (!data.method || typeof data.method !== 'string') {
        return false;
      }
      if (data.params !== undefined && !Array.isArray(data.params)) {
        return false;
      }
    }

    // Validate against dangerous content patterns
    const jsonString = JSON.stringify(data);
    const dangerousPatterns = [
      /eval\s*\(/,
      /Function\s*\(/,
      /setTimeout\s*\(/,
      /setInterval\s*\(/,
      /<script/i,
      /javascript:/i,
      /data:text\/html/i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(jsonString)) {
        logWarn('Dangerous content detected in message:', data);
        return false;
      }
    }

    return true;
  }

  /**
   * Handle wallet requests from dApps
   */
  private async handleWalletRequest(id: string, method: string, params: any[]): Promise<void> {
    try {
      let result: any;

      switch (method) {
        case 'connect':
          result = await this.handleConnect();
          break;
        case 'disconnect':
          result = await this.handleDisconnect();
          break;
        case 'signTransaction':
          result = await this.handleSignTransaction(params[0]);
          break;
        case 'signAllTransactions':
          result = await this.handleSignAllTransactions(params[0]);
          break;
        case 'signMessage':
          result = await this.handleSignMessage(params[0]);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      this.postMessageToIframe({
        type: 'WALLET_RESPONSE',
        id,
        result
      });
    } catch (error) {
      this.postMessageToIframe({
        type: 'WALLET_ERROR',
        id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }



  /**
   * Execute the injection script in the iframe
   */
  private async executeInjection(iframe: HTMLIFrameElement, scriptUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const script = iframe.contentDocument?.createElement('script');
        if (!script) {
          resolve(false);
          return;
        }

        script.src = scriptUrl;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);

        iframe.contentDocument?.head.appendChild(script);
      } catch (error) {
        logError('Script injection failed:', error);
        resolve(false);
      }
    });
  }

  /**
   * Wait for iframe to fully load
   */
  private async waitForIframeLoad(iframe: HTMLIFrameElement): Promise<void> {
    return new Promise((resolve, reject) => {
      if (iframe.contentDocument?.readyState === 'complete') {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Iframe load timeout'));
      }, TIMEOUT_CONSTANTS.IFRAME_LOAD);

      iframe.onload = () => {
        clearTimeout(timeout);
        // Wait a bit more for DOM to be ready
        setTimeout(resolve, TIMEOUT_CONSTANTS.ANIMATION_DELAY);
      };
    });
  }

  /**
   * Post message to iframe safely with specific origin
   * Security: Uses iframe's origin instead of '*' for enhanced security
   */
  private postMessageToIframe(message: any): void {
    if (this.iframe?.contentWindow) {
      try {
        // Get the iframe's origin for secure messaging
        const iframeOrigin = this.iframe.src ? new URL(this.iframe.src).origin : window.location.origin;
        this.iframe.contentWindow.postMessage(message, iframeOrigin);
      } catch (error) {
        logError('Failed to get iframe origin for secure messaging:', error);
        // Fallback to window origin if iframe origin cannot be determined
        this.iframe.contentWindow.postMessage(message, window.location.origin);
      }
    }
  }

  /**
   * Handle wallet connection requests
   */
  private async handleConnect(): Promise<{ publicKey: string }> {
    if (!this.wallet?.publicKey) {
      throw new Error('No wallet connected to SVMSeek');
    }

    return {
      publicKey: this.wallet.publicKey.toString()
    };
  }

  /**
   * Handle wallet disconnection requests
   */
  private async handleDisconnect(): Promise<void> {
    // For security, we don't actually disconnect the main wallet
    // This would only affect the dApp's perception
    return Promise.resolve();
  }

  /**
   * Handle transaction signing requests
   */
  private async handleSignTransaction(transaction: any): Promise<any> {
    // For security, we show a user-friendly message about transaction signing
    const message = 'Transaction signing is available in the main SVMSeek wallet interface for security. Would you like to:\n\n' +
      '1. Copy the transaction details to use in the main wallet\n' +
      '2. Open SVMSeek wallet in a new tab\n' +
      '3. Learn more about secure transaction signing\n\n' +
      'This security measure protects your funds from malicious dApps.';

    // Show a user-friendly notification
    this.showTransactionPrompt('Transaction Signing Required', message);

    throw new Error('Please use the main SVMSeek wallet interface for transaction signing. This ensures your security and protects your funds.');
  }

  /**
   * Handle multiple transaction signing requests
   */
  private async handleSignAllTransactions(transactions: any[]): Promise<any[]> {
    const message = `Multiple transaction signing (${transactions.length} transactions) is available in the main SVMSeek wallet interface for security. ` +
      'Batch transaction signing requires additional security verification that can only be performed in the main application.';

    this.showTransactionPrompt('Batch Transaction Signing Required', message);

    throw new Error('Please use the main SVMSeek wallet interface for batch transaction signing. This ensures your security and protects your funds.');
  }

  /**
   * Handle message signing requests
   */
  private async handleSignMessage(message: Uint8Array): Promise<{ signature: Uint8Array }> {
    const promptMessage = 'Message signing is available in the main SVMSeek wallet interface for security. ' +
      'This ensures that you can review the exact message content before signing and protects against phishing attempts.';

    this.showTransactionPrompt('Message Signing Required', promptMessage);

    throw new Error('Please use the main SVMSeek wallet interface for message signing. This ensures your security and protects against phishing.');
  }

  /**
   * Show user-friendly transaction signing prompt
   */
  private showTransactionPrompt(title: string, message: string): void {
    // Create a custom event to show a user-friendly prompt in the main application
    const promptEvent = new CustomEvent('wallet-transaction-prompt', {
      detail: {
        title,
        message,
        actions: [
          {
            label: 'Open SVMSeek Wallet',
            action: 'open-wallet',
            primary: true,
          },
          {
            label: 'Learn More',
            action: 'learn-more',
            secondary: true,
          },
          {
            label: 'Dismiss',
            action: 'dismiss',
          },
        ],
      },
    });

    window.dispatchEvent(promptEvent);
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    if (this.rateLimitCleanupInterval) {
      clearInterval(this.rateLimitCleanupInterval);
      this.rateLimitCleanupInterval = null;
    }
    this.iframe = null;
    this.injected.clear();
    this.messageHandlers.clear();
    this.requestCounts.clear();
  }

  /**
   * Clean up event listeners and resources to prevent memory leaks
   */
  public destroy(): void {
    // Clean up message listener
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
      this.messageListener = null;
    }

    // Clean up rate limiting interval
    if (this.rateLimitCleanupInterval) {
      clearInterval(this.rateLimitCleanupInterval);
      this.rateLimitCleanupInterval = null;
    }

    // Clean up other resources
    this.iframe = null;
    this.injected.clear();
    this.messageHandlers.clear();
    this.requestCounts.clear();
  }

  /**
   * Check if providers are injected for a specific iframe
   */
  public isInjected(): boolean {
    return this.injected.size > 0;
  }

  /**
   * Get list of injected providers
   */
  public getInjectedProviders(): string[] {
    return Array.from(this.injected);
  }
}
