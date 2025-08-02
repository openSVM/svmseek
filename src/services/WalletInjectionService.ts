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

  constructor(wallet: any) {
    this.wallet = wallet;
    this.setupMessageListener();
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
   * Check if the origin is allowed for wallet injection
   * Implements same-origin policy with allowlist for trusted domains
   */
  private isAllowedOrigin(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const origin = urlObj.origin;
      const hostname = urlObj.hostname;
      
      // Allow same origin (localhost, 127.0.0.1 for development)
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
        return true;
      }
      
      // Allow SVMSeek domains
      const allowedDomains = [
        'svmseek.com',
        'www.svmseek.com',
        'app.svmseek.com',
        'wallet.svmseek.com'
      ];
      
      // Check exact domain match
      if (allowedDomains.includes(hostname)) {
        return true;
      }
      
      // Check subdomain pattern for svmseek.com
      if (hostname.endsWith('.svmseek.com')) {
        return true;
      }
      
      // Block all other origins for security
      logWarn('Blocked wallet injection for untrusted origin:', origin);
      return false;
    } catch (error) {
      logError('Failed to parse URL for origin check:', url, error);
      return false;
    }
  }

  /**
   * Handle messages from the iframe
   */
  private setupMessageListener(): void {
    window.addEventListener('message', (event) => {
      try {
        if (!this.iframe || event.source !== this.iframe.contentWindow) {
          return;
        }

        // Safely check if event.data exists and has the expected structure
        if (!event.data || typeof event.data !== 'object') {
          logWarn('WalletInjectionService: Received invalid message data', event.data);
          return;
        }

        const { type, id, method, params } = event.data;
        
        // Additional null/undefined checks
        if (!type || typeof type !== 'string') {
          logWarn('WalletInjectionService: Received message without valid type', event.data);
          return;
        }
        
        if (type === 'WALLET_REQUEST') {
          this.handleWalletRequest(id, method, params);
        }
      } catch (error) {
        logError('WalletInjectionService: Error processing message:', error, event.data);
      }
    });
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
    this.iframe = null;
    this.injected.clear();
    this.messageHandlers.clear();
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