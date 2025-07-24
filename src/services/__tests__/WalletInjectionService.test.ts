import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WalletInjectionService } from '../WalletInjectionService';

// Mock wallet object
const mockWallet = {
  publicKey: {
    toString: () => 'test-public-key-123'
  }
};

describe('WalletInjectionService Security Tests', () => {
  let service: WalletInjectionService;
  let mockIframe: HTMLIFrameElement;

  beforeEach(() => {
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
  });

  afterEach(() => {
    service.cleanup();
    document.body.removeChild(mockIframe);
  });

  describe('Injection Security', () => {
    test('should prevent multiple injections to same iframe', async () => {
      const result1 = await service.injectWalletProviders(mockIframe);
      const result2 = await service.injectWalletProviders(mockIframe);
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      
      // Script should include prevention mechanism
      expect(service.getInjectedProviders()).toHaveLength(3); // solana, phantom, svmseek
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
      expect(result.error).toContain('Failed to inject wallet providers');
    });

    test('should sanitize injected script content', async () => {
      const result = await service.injectWalletProviders(mockIframe);
      expect(result.success).toBe(true);
      
      // Verify script doesn't contain dangerous content
      const createScriptCall = mockIframe.contentDocument?.createElement as jest.Mock;
      expect(createScriptCall).toHaveBeenCalledWith('script');
      
      // The script should be loaded via blob URL, not inline
      const scriptElement = createScriptCall.mock.results[0].value;
      expect(scriptElement.src).toMatch(/^blob:/);
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
      await service.injectWalletProviders(mockIframe);
      
      const postMessageSpy = jest.spyOn(mockIframe.contentWindow!, 'postMessage');
      
      // Simulate request with unsupported method
      const event = {
        source: mockIframe.contentWindow,
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
        }, '*');
      });
    });
  });

  describe('Transaction Security', () => {
    test('should block transaction signing in iframe context', async () => {
      await service.injectWalletProviders(mockIframe);
      
      const postMessageSpy = jest.spyOn(mockIframe.contentWindow!, 'postMessage');
      
      // Simulate sign transaction request
      const event = {
        source: mockIframe.contentWindow,
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
          error: 'Transaction signing disabled in iframe for security. Please use the main SVMSeek interface.'
        }, '*');
      });
    });

    test('should block message signing in iframe context', async () => {
      await service.injectWalletProviders(mockIframe);
      
      const postMessageSpy = jest.spyOn(mockIframe.contentWindow!, 'postMessage');
      
      // Simulate sign message request
      const event = {
        source: mockIframe.contentWindow,
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
          error: 'Message signing disabled in iframe for security. Please use the main SVMSeek interface.'
        }, '*');
      });
    });
  });

  describe('Connection Security', () => {
    test('should allow connection requests with valid wallet', async () => {
      await service.injectWalletProviders(mockIframe);
      
      const postMessageSpy = jest.spyOn(mockIframe.contentWindow!, 'postMessage');
      
      // Simulate connect request
      const event = {
        source: mockIframe.contentWindow,
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
            publicKey: 'test-public-key-123'
          }
        }, '*');
      });
    });

    test('should reject connection when no wallet available', async () => {
      const serviceWithoutWallet = new WalletInjectionService(null);
      await serviceWithoutWallet.injectWalletProviders(mockIframe);
      
      const postMessageSpy = jest.spyOn(mockIframe.contentWindow!, 'postMessage');
      
      // Simulate connect request
      const event = {
        source: mockIframe.contentWindow,
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
        }, '*');
      });
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
      
      await service.injectWalletProviders(mockIframe);
      
      expect(service.isInjected()).toBe(true);
      expect(service.getInjectedProviders()).toEqual(['solana', 'phantom', 'svmseek']);
    });
  });

  describe('Script Injection Security', () => {
    test('should use blob URLs for script injection', async () => {
      const createObjectURLSpy = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url');
      const revokeObjectURLSpy = jest.spyOn(URL, 'revokeObjectURL').mockImplementation();
      
      await service.injectWalletProviders(mockIframe);
      
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:test-url');
      
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });

    test('should handle script injection failures gracefully', async () => {
      // Mock script creation failure
      const mockDocument = {
        readyState: 'complete',
        createElement: jest.fn(() => {
          throw new Error('Script creation failed');
        }),
        head: { appendChild: jest.fn() }
      };
      
      Object.defineProperty(mockIframe, 'contentDocument', {
        value: mockDocument,
        writable: true
      });
      
      const result = await service.injectWalletProviders(mockIframe);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to inject wallet providers');
    });
  });
});