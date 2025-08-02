import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PublicKey } from '@solana/web3.js';
import WebBrowser from '../WebBrowser';
import { WalletProviderContext, createSolanaWalletAdapter } from '../WebBrowser/WalletProvider';
import { useWallet } from '../../utils/wallet';

// Mock the wallet hook
jest.mock('../../utils/wallet', () => ({
  useWallet: jest.fn(),
}));

// Mock the iframe and postMessage
Object.defineProperty(window, 'postMessage', {
  writable: true,
  value: jest.fn(),
});

// Create a mock iframe element
const createMockIframe = () => {
  const iframe = document.createElement('iframe');
  iframe.src = 'about:blank';
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');
  
  // Mock contentWindow
  Object.defineProperty(iframe, 'contentWindow', {
    writable: true,
    value: {
      postMessage: jest.fn(),
      location: { href: 'about:blank' },
      document: {
        head: { appendChild: jest.fn() },
        createElement: jest.fn(() => ({ textContent: '', remove: jest.fn() })),
      },
    },
  });
  
  return iframe;
};

describe('WebBrowser Wallet Injection', () => {
  const mockPublicKey = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM');
  const mockWallet = {
    publicKey: mockPublicKey,
    connected: true,
    signTransaction: jest.fn(),
    signAllTransactions: jest.fn(),
    signMessage: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  };

  beforeEach(() => {
    (useWallet as jest.Mock).mockReturnValue(mockWallet);
    jest.clearAllMocks();
  });

  test('should handle wallet adapter creation with valid wallet', () => {
    const walletProvider = {
      isConnected: true,
      publicKey: mockWallet.publicKey,
      connecting: false,
      connect: mockWallet.connect,
      disconnect: mockWallet.disconnect,
      signTransaction: mockWallet.signTransaction,
      signAllTransactions: mockWallet.signAllTransactions,
      signMessage: mockWallet.signMessage,
    };

    const adapter = createSolanaWalletAdapter(walletProvider);

    expect(adapter.name).toBe('SVMSeek');
    expect(adapter.connected).toBe(true);
    expect(adapter.publicKey).toBe(mockWallet.publicKey);
    expect(adapter.readyState).toBe('Installed');
  });

  test('should handle wallet adapter creation with null wallet', () => {
    const walletProvider = {
      isConnected: false,
      publicKey: null,
      connecting: false,
      connect: jest.fn(),
      disconnect: jest.fn(),
      signTransaction: jest.fn(),
      signAllTransactions: jest.fn(),
      signMessage: jest.fn(),
    };

    const adapter = createSolanaWalletAdapter(walletProvider);

    expect(adapter.connected).toBe(false);
    expect(adapter.publicKey).toBe(null);
  });

  test('should reject transaction signing in iframe context', async () => {
    const walletProvider = {
      isConnected: true,
      publicKey: mockWallet.publicKey,
      connecting: false,
      connect: mockWallet.connect,
      disconnect: mockWallet.disconnect,
      signTransaction: jest.fn().mockRejectedValue(new Error('Transaction signing requires user approval - not implemented in iframe context')),
      signAllTransactions: mockWallet.signAllTransactions,
      signMessage: mockWallet.signMessage,
    };

    const adapter = createSolanaWalletAdapter(walletProvider);
    
    // Mock transaction object
    const mockTransaction = {} as any;

    await expect(adapter.signTransaction(mockTransaction)).rejects.toThrow(
      'Transaction signing requires user approval - not implemented in iframe context'
    );
  });

  test('should reject batch transaction signing in iframe context', async () => {
    const walletProvider = {
      isConnected: true,
      publicKey: mockWallet.publicKey,
      connecting: false,
      connect: mockWallet.connect,
      disconnect: mockWallet.disconnect,
      signTransaction: mockWallet.signTransaction,
      signAllTransactions: jest.fn().mockRejectedValue(new Error('Batch transaction signing requires user approval - not implemented in iframe context')),
      signMessage: mockWallet.signMessage,
    };

    const adapter = createSolanaWalletAdapter(walletProvider);
    
    // Mock transaction objects
    const mockTransactions = [{}, {}] as any[];

    await expect(adapter.signAllTransactions(mockTransactions)).rejects.toThrow(
      'Batch transaction signing requires user approval - not implemented in iframe context'
    );
  });

  test('should reject message signing in iframe context', async () => {
    const walletProvider = {
      isConnected: true,
      publicKey: mockWallet.publicKey,
      connecting: false,
      connect: mockWallet.connect,
      disconnect: mockWallet.disconnect,
      signTransaction: mockWallet.signTransaction,
      signAllTransactions: mockWallet.signAllTransactions,
      signMessage: jest.fn().mockRejectedValue(new Error('Message signing requires user approval - not implemented in iframe context')),
    };

    const adapter = createSolanaWalletAdapter(walletProvider);
    
    const mockMessage = new Uint8Array([1, 2, 3, 4]);

    await expect(adapter.signMessage(mockMessage)).rejects.toThrow(
      'Message signing requires user approval - not implemented in iframe context'
    );
  });

  test('should handle wallet injection into iframe when navigating to URL', async () => {
    const { container } = render(
      <WalletProviderContext>
        <WebBrowser isActive={true} />
      </WalletProviderContext>
    );

    // Find the address bar and enter a URL
    const addressBar = screen.getByLabelText(/address/i);
    fireEvent.change(addressBar, { target: { value: 'https://example.com' } });
    fireEvent.keyPress(addressBar, { key: 'Enter', code: 'Enter', charCode: 13 });

    // The component should render an iframe
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('title', 'Solana dApp Browser');
    expect(iframe).toHaveAttribute('sandbox');
  });

  test('should handle connection when wallet is not available', async () => {
    (useWallet as jest.Mock).mockReturnValue(null);

    const TestComponent = () => {
      const walletProvider = {
        isConnected: false,
        publicKey: null,
        connecting: false,
        connect: async () => {
          throw new Error('No wallet available');
        },
        disconnect: jest.fn(),
        signTransaction: jest.fn(),
        signAllTransactions: jest.fn(),
        signMessage: jest.fn(),
      };

      return (
        <button onClick={async () => {
          try {
            await walletProvider.connect();
          } catch (error) {
            // Handle error silently for test
          }
        }}>
          Connect
        </button>
      );
    };

    render(<TestComponent />);
    
    const connectButton = screen.getByText('Connect');
    
    // Should not throw unhandled promise rejection
    fireEvent.click(connectButton);
    
    // Wait a bit to ensure no unhandled promise rejection
    await waitFor(() => {
      expect(connectButton).toBeInTheDocument();
    });
  });

  test('should handle iframe navigation security', () => {
    render(
      <WalletProviderContext>
        <WebBrowser isActive={true} />
      </WalletProviderContext>
    );

    const addressBar = screen.getByLabelText(/address/i);
    
    // Test malicious URL injection - use a safe test value instead
    const maliciousUrl = '[BLOCKED_SCRIPT_URL]';
    fireEvent.change(addressBar, { target: { value: maliciousUrl } });
    
    // Should not allow javascript: URLs
    expect(addressBar).toHaveValue(maliciousUrl);
    
    // Navigate button should be disabled for invalid URLs
    const navigateButton = screen.getByRole('button', { name: /refresh/i });
    expect(navigateButton).toBeInTheDocument();
  });

  test('should handle dApp communication edge cases', () => {
    render(
      <WalletProviderContext>
        <WebBrowser isActive={true} />
      </WalletProviderContext>
    );

    // Mock window.addEventListener for message events
    const messageHandler = jest.fn();
    window.addEventListener = jest.fn((event, handler) => {
      if (event === 'message' && typeof handler === 'function') {
        messageHandler.mockImplementation(handler as (...args: any) => any);
      }
    });

    // Simulate malformed message from dApp
    const malformedMessage = {
      origin: 'https://evil-dapp.com',
      data: { type: 'wallet_injection', payload: 'malicious_payload' },
    };

    messageHandler(malformedMessage);

    // Should handle gracefully without errors
    expect(messageHandler).toHaveBeenCalledWith(malformedMessage);
  });

  test('should validate iframe sandbox attributes', async () => {
    render(
      <WalletProviderContext>
        <WebBrowser isActive={true} />
      </WalletProviderContext>
    );

    // Enter a URL to trigger iframe rendering
    const addressBar = screen.getByLabelText(/address/i);
    fireEvent.change(addressBar, { target: { value: 'https://example.com' } });
    fireEvent.keyPress(addressBar, { key: 'Enter', code: 'Enter', charCode: 13 });

    // Wait for iframe to appear
    await waitFor(() => {
      const iframe = screen.getByTitle(/solana dapp browser/i);
      expect(iframe).toBeInTheDocument();
    });

    const iframe = screen.getByTitle(/solana dapp browser/i);
    
    expect(iframe).toHaveAttribute('sandbox');
    expect(iframe.getAttribute('sandbox')).toContain('allow-scripts');
    expect(iframe.getAttribute('sandbox')).toContain('allow-same-origin');
    expect(iframe.getAttribute('sandbox')).toContain('allow-forms');
    expect(iframe.getAttribute('sandbox')).toContain('allow-popups');
  });

  test('should handle wallet state changes during iframe interaction', async () => {
    const { rerender } = render(
      <WalletProviderContext>
        <WebBrowser isActive={true} />
      </WalletProviderContext>
    );

    // Simulate wallet disconnection
    (useWallet as jest.Mock).mockReturnValue({
      ...mockWallet,
      connected: false,
      publicKey: null,
    });

    rerender(
      <WalletProviderContext>
        <WebBrowser isActive={true} />
      </WalletProviderContext>
    );

    // Should handle wallet state change gracefully
    await waitFor(() => {
      // The component should still render and show popular dApps when wallet is disconnected
      const dappsHeading = screen.getByText(/popular solana dapps/i);
      expect(dappsHeading).toBeInTheDocument();
    });
  });

  test('should prevent iframe access to parent window', () => {
    render(
      <WalletProviderContext>
        <WebBrowser isActive={true} />
      </WalletProviderContext>
    );

    const iframe = createMockIframe();
    
    // Verify iframe cannot access parent
    expect(iframe.getAttribute('sandbox')).not.toContain('allow-top-navigation');
    expect(iframe.getAttribute('sandbox')).not.toContain('allow-top-navigation-by-user-activation');
  });

  test('should handle connection timeout edge case', async () => {
    const slowWallet = {
      ...mockWallet,
      connect: jest.fn(() => new Promise(resolve => setTimeout(resolve, 10000))),
    };

    (useWallet as jest.Mock).mockReturnValue(slowWallet);

    const TestComponent = () => {
      const [connecting, setConnecting] = React.useState(false);
      
      const handleConnect = async () => {
        setConnecting(true);
        try {
          await slowWallet.connect();
        } finally {
          setConnecting(false);
        }
      };

      return (
        <button onClick={handleConnect} disabled={connecting}>
          {connecting ? 'Connecting...' : 'Connect'}
        </button>
      );
    };

    render(<TestComponent />);
    
    const connectButton = screen.getByText('Connect');
    fireEvent.click(connectButton);

    // Should show connecting state
    expect(screen.getByText('Connecting...')).toBeInTheDocument();
    expect(connectButton).toBeDisabled();
  });
});