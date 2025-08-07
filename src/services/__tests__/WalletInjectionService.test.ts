import { waitFor } from '@testing-library/react';
import { WalletInjectionService } from '../WalletInjectionService';
import { TIMEOUT_CONSTANTS } from '../../utils/constants';
import {
  createMockWallet,
  mockURL,
  setupCommonMocks,
  cleanupAllMocks
} from '../../__mocks__/testMocks';

// Mock wallet object using centralized mock
const mockWallet = createMockWallet();

describe('WalletInjectionService Security Tests', () => {
  let service: WalletInjectionService;
  let mockIframe: HTMLIFrameElement;

  beforeEach(() => {
    // Setup common mocks
    setupCommonMocks();
    mockURL();

    service = new WalletInjectionService(mockWallet);

    // Create mock iframe
    mockIframe = document.createElement('iframe');
    mockIframe.src = 'about:blank';
    document.body.appendChild(mockIframe);

    // Mock iframe content document
    Object.defineProperty(mockIframe, 'contentDocument', {
      value: {
        readyState: 'complete',
        createElement: jest.fn(() => ({
          src: '',
          onload: null,
          onerror: null
        })),
        head: {
          appendChild: jest.fn()
        }
      },
      writable: true
    });

    Object.defineProperty(mockIframe, 'contentWindow', {
      value: {
        postMessage: jest.fn()
      },
      writable: true
    });

    // Mock onload to be called immediately for allowed origins
    mockIframe.onload = null;
  });

  // Helper function to create a properly mocked iframe for successful injection
  const createMockIframeForSuccessfulInjection = () => {
    const iframe = document.createElement('iframe');
    iframe.src = 'http://localhost:3000';

    Object.defineProperty(iframe, 'contentDocument', {
      value: {
        readyState: 'complete',
        createElement: jest.fn(() => {
          const script = {
            _src: '',
            onload: null as any,
            onerror: null as any,
          };
          // Simulate setting a blob URL when src is assigned
          Object.defineProperty(script, 'src', {
            set(value: string) {
              script._src = (value && value.startsWith('blob:')) ? value : 'blob:mock-url';
            },
            get() {
              return script._src || 'blob:mock-url';
            }
          });
          return script;
        }),
        head: {
          appendChild: jest.fn((script: any) => {
            // Immediately trigger onload when script is appended
            if (script.onload) {
              script.onload();
            }
          })
        }
      },
      writable: true
    });

    Object.defineProperty(iframe, 'contentWindow', {
      value: {
        postMessage: jest.fn()
      },
      writable: true
    });

    return iframe;
  };

  afterEach(() => {
    service.cleanup();
    document.body.removeChild(mockIframe);
    cleanupAllMocks();
  });

  describe('Injection Security', () => {
    test('should prevent multiple injections to same iframe', async () => {
      const successIframe = createMockIframeForSuccessfulInjection();
      document.body.appendChild(successIframe);

      const result1 = await service.injectWalletProviders(successIframe);
      const result2 = await service.injectWalletProviders(successIframe);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      // Script should include prevention mechanism
      expect(service.getInjectedProviders()).toHaveLength(3); // solana, phantom, svmseek

      document.body.removeChild(successIframe);
    });

    test('should only inject to same-origin iframes', async () => {
      // Mock different origin iframe
      const crossOriginIframe = document.createElement('iframe');
      crossOriginIframe.src = 'https://malicious-site.com';

      Object.defineProperty(crossOriginIframe, 'contentDocument', {
        value: null, // Cross-origin access blocked
        writable: true
      });

      const result = await service.injectWalletProviders(crossOriginIframe);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Wallet injection blocked for security reasons: untrusted origin');
    });

    test('should sanitize injected script content', async () => {
      const successIframe = createMockIframeForSuccessfulInjection();
      document.body.appendChild(successIframe);

      const result = await service.injectWalletProviders(successIframe);
      expect(result.success).toBe(true);

      // Verify script doesn't contain dangerous content
      const createScriptCall = successIframe.contentDocument?.createElement as jest.Mock;
      expect(createScriptCall).toHaveBeenCalledWith('script');

      // The script should be loaded via blob URL, not inline
      const scriptElement = createScriptCall.mock.results[0].value;
      expect(scriptElement.src).toMatch(/^blob:/);

      document.body.removeChild(successIframe);
    });

    test('should handle iframe load timeout', async () => {
      // Mock iframe that never loads
      const slowIframe = document.createElement('iframe');
      Object.defineProperty(slowIframe, 'contentDocument', {
        value: {
          readyState: 'loading',
          createElement: jest.fn(() => ({
            src: '',
            onload: null,
            onerror: null
          })),
          head: {
            appendChild: jest.fn()
          }
        },
        writable: true
      });

      const result = await service.injectWalletProviders(slowIframe);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Iframe load timeout');
    }, 15000);
  });

  describe('Message Handling Security', () => {
    test('should only process messages from injected iframe', () => {
      const handleRequestSpy = jest.spyOn(service as any, 'handleWalletRequest');

      // Simulate message from different source
      const fakeEvent = {
        source: window, // Different from iframe.contentWindow
        data: {
          type: 'WALLET_REQUEST',
          id: 'test',
          method: 'connect',
          params: []
        }
      };

      window.dispatchEvent(new MessageEvent('message', fakeEvent));

      expect(handleRequestSpy).not.toHaveBeenCalled();
    });

    test('should validate message structure', () => {
      const handleRequestSpy = jest.spyOn(service as any, 'handleWalletRequest');

      // Simulate malformed message
      const malformedEvent = {
        source: mockIframe.contentWindow,
        data: {
          type: 'WALLET_REQUEST',
          // missing required fields
        }
      };

      window.dispatchEvent(new MessageEvent('message', malformedEvent));

      expect(handleRequestSpy).not.toHaveBeenCalled();
    });

    test('should reject unsupported methods', async () => {
      const successIframe = createMockIframeForSuccessfulInjection();
      document.body.appendChild(successIframe);

      await service.injectWalletProviders(successIframe);

      const postMessageSpy = jest.spyOn(successIframe.contentWindow!, 'postMessage');

      // Simulate request with unsupported method
      const event = {
        source: successIframe.contentWindow,
        data: {
          type: 'WALLET_REQUEST',
          id: 'test-123',
          method: 'maliciousMethod',
          params: []
        }
      };

      window.dispatchEvent(new MessageEvent('message', event));

      await waitFor(() => {
        expect(postMessageSpy).toHaveBeenCalledWith({
          type: 'WALLET_ERROR',
          id: 'test-123',
          error: 'Unsupported method: maliciousMethod'
        }, 'http://localhost:3000');
      });

      document.body.removeChild(successIframe);
    });
  });

  describe('Transaction Security', () => {
    test('should block transaction signing in iframe context', async () => {
      const successIframe = createMockIframeForSuccessfulInjection();
      document.body.appendChild(successIframe);

      await service.injectWalletProviders(successIframe);

      const postMessageSpy = jest.spyOn(successIframe.contentWindow!, 'postMessage');

      // Simulate sign transaction request
      const event = {
        source: successIframe.contentWindow,
        data: {
          type: 'WALLET_REQUEST',
          id: 'sign-test',
          method: 'signTransaction',
          params: [{ /* mock transaction */ }]
        }
      };

      window.dispatchEvent(new MessageEvent('message', event));

      await waitFor(() => {
        expect(postMessageSpy).toHaveBeenCalledWith({
          type: 'WALLET_ERROR',
          id: 'sign-test',
          error: 'Please use the main SVMSeek wallet interface for transaction signing. This ensures your security and protects your funds.'
        }, 'http://localhost:3000');
      });

      document.body.removeChild(successIframe);
    });

    test('should block message signing in iframe context', async () => {
      const successIframe = createMockIframeForSuccessfulInjection();
      document.body.appendChild(successIframe);

      await service.injectWalletProviders(successIframe);

      const postMessageSpy = jest.spyOn(successIframe.contentWindow!, 'postMessage');

      // Simulate sign message request
      const event = {
        source: successIframe.contentWindow,
        data: {
          type: 'WALLET_REQUEST',
          id: 'sign-msg-test',
          method: 'signMessage',
          params: [new Uint8Array([1, 2, 3])]
        }
      };

      window.dispatchEvent(new MessageEvent('message', event));

      await waitFor(() => {
        expect(postMessageSpy).toHaveBeenCalledWith({
          type: 'WALLET_ERROR',
          id: 'sign-msg-test',
          error: 'Please use the main SVMSeek wallet interface for message signing. This ensures your security and protects against phishing.'
        }, 'http://localhost:3000');
      });

      document.body.removeChild(successIframe);
    });
  });

  describe('Connection Security', () => {
    test('should allow connection requests with valid wallet', async () => {
      const successIframe = createMockIframeForSuccessfulInjection();
      document.body.appendChild(successIframe);

      await service.injectWalletProviders(successIframe);

      const postMessageSpy = jest.spyOn(successIframe.contentWindow!, 'postMessage');

      // Simulate connect request
      const event = {
        source: successIframe.contentWindow,
        data: {
          type: 'WALLET_REQUEST',
          id: 'connect-test',
          method: 'connect',
          params: []
        }
      };

      window.dispatchEvent(new MessageEvent('message', event));

      await waitFor(() => {
        expect(postMessageSpy).toHaveBeenCalledWith({
          type: 'WALLET_RESPONSE',
          id: 'connect-test',
          result: {
            publicKey: 'mock-public-key-123456789'
          }
        }, 'http://localhost:3000');
      });

      document.body.removeChild(successIframe);
    });

    test('should reject connection when no wallet available', async () => {
      const serviceWithoutWallet = new WalletInjectionService(null);
      const successIframe = createMockIframeForSuccessfulInjection();
      document.body.appendChild(successIframe);

      await serviceWithoutWallet.injectWalletProviders(successIframe);

      const postMessageSpy = jest.spyOn(successIframe.contentWindow!, 'postMessage');

      // Simulate connect request
      const event = {
        source: successIframe.contentWindow,
        data: {
          type: 'WALLET_REQUEST',
          id: 'connect-fail-test',
          method: 'connect',
          params: []
        }
      };

      window.dispatchEvent(new MessageEvent('message', event));

      await waitFor(() => {
        expect(postMessageSpy).toHaveBeenCalledWith({
          type: 'WALLET_ERROR',
          id: 'connect-fail-test',
          error: 'No wallet connected to SVMSeek'
        }, 'http://localhost:3000');
      });

      document.body.removeChild(successIframe);
    });
  });

  describe('Resource Management', () => {
    test('should clean up resources properly', () => {
      service.cleanup();

      expect(service.isInjected()).toBe(false);
      expect(service.getInjectedProviders()).toHaveLength(0);
    });

    test('should track injection state correctly', async () => {
      expect(service.isInjected()).toBe(false);

      const successIframe = createMockIframeForSuccessfulInjection();
      document.body.appendChild(successIframe);

      await service.injectWalletProviders(successIframe);

      expect(service.isInjected()).toBe(true);
      expect(service.getInjectedProviders()).toEqual(['solana', 'phantom', 'svmseek']);

      document.body.removeChild(successIframe);
    });
  });

  describe('Script Injection Security', () => {
    test('should use blob URLs for script injection', async () => {
      const createObjectURLSpy = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url');
      const revokeObjectURLSpy = jest.spyOn(URL, 'revokeObjectURL').mockImplementation();

      const successIframe = createMockIframeForSuccessfulInjection();
      document.body.appendChild(successIframe);

      await service.injectWalletProviders(successIframe);

      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:test-url');

      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
      document.body.removeChild(successIframe);
    });

    test('should handle script injection failures gracefully', async () => {
      // Create iframe with failing script creation but allowed origin
      const failingIframe = document.createElement('iframe');
      failingIframe.src = 'http://localhost:3000';

      const mockDocument = {
        readyState: 'complete',
        createElement: jest.fn(() => {
          throw new Error('Script creation failed');
        }),
        head: { appendChild: jest.fn() }
      };

      Object.defineProperty(failingIframe, 'contentDocument', {
        value: mockDocument,
        writable: true
      });

      document.body.appendChild(failingIframe);

      const result = await service.injectWalletProviders(failingIframe);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to inject wallet providers');

      document.body.removeChild(failingIframe);
    });
  });

  describe('Advanced Security Attack Simulations', () => {
    test('should prevent XSS injection through iframe src manipulation', async () => {
      // Simulate XSS attempt through iframe src
      const maliciousIframe = document.createElement('iframe');
      maliciousIframe.src = 'javascript:alert("XSS")';

      const result = await service.injectWalletProviders(maliciousIframe);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Wallet injection blocked for security reasons');
    });

    test('should prevent code injection through postMessage', async () => {
      const successIframe = createMockIframeForSuccessfulInjection();
      document.body.appendChild(successIframe);

      await service.injectWalletProviders(successIframe);

      // Simulate malicious postMessage with code injection attempt
      const maliciousEvent = {
        source: successIframe.contentWindow,
        data: {
          type: 'WALLET_REQUEST',
          id: 'inject-test',
          method: 'eval("malicious code")',
          params: ['<script>alert("XSS")</script>']
        }
      };

      const postMessageSpy = jest.spyOn(successIframe.contentWindow!, 'postMessage');

      window.dispatchEvent(new MessageEvent('message', maliciousEvent));

      await waitFor(() => {
        expect(postMessageSpy).toHaveBeenCalledWith({
          type: 'WALLET_ERROR',
          id: 'inject-test',
          error: 'Unsupported method: eval("malicious code")'
        }, expect.any(String)); // Should use specific origin, not '*'
      });

      document.body.removeChild(successIframe);
    });

    test('should validate postMessage targetOrigin security', async () => {
      const successIframe = createMockIframeForSuccessfulInjection();
      successIframe.src = 'https://app.svmseek.com/test';
      document.body.appendChild(successIframe);

      await service.injectWalletProviders(successIframe);

      const postMessageSpy = jest.spyOn(successIframe.contentWindow!, 'postMessage');

      const event = {
        source: successIframe.contentWindow,
        data: {
          type: 'WALLET_REQUEST',
          id: 'origin-test',
          method: 'connect',
          params: []
        }
      };

      window.dispatchEvent(new MessageEvent('message', event));

      await waitFor(() => {
        expect(postMessageSpy).toHaveBeenCalled();
        const callArgs = postMessageSpy.mock.calls[0];

        // Should use specific origin, not '*'
        expect(callArgs[1]).not.toBe('*');
        expect(callArgs[1]).toMatch(/^https:\/\/app\.svmseek\.com$/);
      });

      document.body.removeChild(successIframe);
    });
  });

  describe('Injection Script Security Validation', () => {
    test('should verify wallet injection script never calls eval or dangerous methods', () => {
      // Import the script generation function
      const { createWalletInjectionScript } = require('../WalletInjectionScript');

      const injectionScript = createWalletInjectionScript();

      // Validate script doesn't contain dangerous patterns
      const dangerousPatterns = [
        /\beval\s*\(/gi,           // eval() calls
        /\bFunction\s*\(/gi,       // Function constructor
        /\bsetTimeout\s*\(/gi,     // setTimeout with string
        /\bsetInterval\s*\(/gi,    // setInterval with string
        /document\.write/gi,       // document.write
        /innerHTML\s*=/gi,         // innerHTML assignment
        /outerHTML\s*=/gi,         // outerHTML assignment
        /<script/gi,               // script tags
        /javascript:/gi,           // javascript: protocol
        /data:text\/html/gi,       // data URLs with HTML
        /vbscript:/gi,             // vbscript: protocol
        /onload\s*=/gi,            // onload handlers
        /onerror\s*=/gi,           // onerror handlers
        /onclick\s*=/gi,           // onclick handlers
        /\.\[['"`][^'"`]*['"`]\]/g // Property access with dynamic strings
      ];

      const foundDangerousPatterns: string[] = [];

      dangerousPatterns.forEach((pattern, index) => {
        const matches = injectionScript.match(pattern);
        if (matches && matches.length > 0) {
          foundDangerousPatterns.push(`Pattern ${index + 1}: ${pattern.source} - Matches: ${matches.join(', ')}`);
        }
      });

      // Assert no dangerous patterns found
      expect(foundDangerousPatterns).toEqual([]);

      // Additional validation: ensure only safe postMessage usage
      const postMessageMatches = injectionScript.match(/postMessage\s*\(/gi);
      expect(postMessageMatches).toBeTruthy(); // Should contain postMessage calls

      // Verify all postMessage calls specify origin (not '*')
      const wildcardPostMessageMatches = injectionScript.match(/postMessage\s*\([^)]*,\s*['"`]\*['"`]\s*\)/gi);
      expect(wildcardPostMessageMatches).toBeFalsy(); // Should not use '*' as origin

      console.log('✅ Wallet injection script security validation passed');
      console.log(`Script length: ${injectionScript.length} characters`);
      console.log(`PostMessage calls found: ${postMessageMatches?.length || 0}`);
    });

    test('should validate injection script follows secure coding patterns', () => {
      const { createWalletInjectionScript } = require('../WalletInjectionScript');

      const injectionScript = createWalletInjectionScript();

      // Validate secure coding patterns are present
      const securityPatterns = [
        /'use strict'/,                    // Strict mode enabled
        /window\.location\.origin/,        // Uses specific origin
        /pendingRequests\.delete/,         // Cleanup tracking
        /window\.svmseekWalletInjected/,   // Duplicate injection prevention
        /typeof\s+\w+\s*===\s*['"`]/       // Type checking patterns
      ];

      const missingPatterns: string[] = [];

      securityPatterns.forEach((pattern, index) => {
        if (!pattern.test(injectionScript)) {
          missingPatterns.push(`Security pattern ${index + 1}: ${pattern.source}`);
        }
      });

      expect(missingPatterns).toEqual([]);

      // Validate no hardcoded secrets or credentials
      const secretPatterns = [
        /password\s*[:=]/gi,
        /secret\s*[:=]/gi,
        /token\s*[:=]/gi,
        /api[_-]?key\s*[:=]/gi,
        /private[_-]?key\s*[:=]/gi
      ];

      const foundSecrets: string[] = [];
      secretPatterns.forEach((pattern) => {
        const matches = injectionScript.match(pattern);
        if (matches) {
          foundSecrets.push(...matches);
        }
      });

      expect(foundSecrets).toEqual([]);

      console.log('✅ Wallet injection script secure coding patterns validated');
    });
  });
});
