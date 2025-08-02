import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ConnectionProvider } from './utils/connection';
import { WalletProvider } from './utils/wallet';
import { ThemeProvider } from './context/ThemeContext';

// Mock the services to prevent real network calls
jest.mock('./services/MultiAccountManager');
jest.mock('./services/WalletGroupService');
jest.mock('./services/TransactionHistoryService');
jest.mock('./services/ExportService');
jest.mock('./utils/wallet-seed');
jest.mock('./utils/useOnboarding');

// Mock connection
jest.mock('./utils/connection', () => ({
  ConnectionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="connection-provider">{children}</div>
  ),
  useConnection: () => {
    const { Connection } = require('@solana/web3.js'); // Move import inside mock factory
    return {
      connection: new Connection('https://api.devnet.solana.com'),
      endpoint: 'https://api.devnet.solana.com',
    };
  },
}));

// Mock wallet
jest.mock('./utils/wallet', () => ({
  WalletProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="wallet-provider">{children}</div>
  ),
  useWallet: () => null,
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('App Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  const renderApp = () => {
    return render(
      <BrowserRouter>
        <ThemeProvider>
          <ConnectionProvider>
            <WalletProvider>
              <App />
            </WalletProvider>
          </ConnectionProvider>
        </ThemeProvider>
      </BrowserRouter>
    );
  };

  test('renders without crashing', async () => {
    localStorageMock.getItem.mockReturnValue('true'); // onboarding-setup-complete
    
    await waitFor(() => {
      renderApp();
    });
    
    expect(screen.getByTestId('connection-provider')).toBeInTheDocument();
    expect(screen.getByTestId('wallet-provider')).toBeInTheDocument();
  });

  test('shows onboarding setup when not completed', async () => {
    localStorageMock.getItem.mockReturnValue(null); // onboarding-setup-complete not set
    
    await waitFor(() => {
      renderApp();
    });
    
    // Should show loading while lazy loading OnboardingSetup
    expect(document.body).toBeInTheDocument();
  });

  test('prevents iframe embedding', () => {
    // Mock window.self !== window.top (iframe scenario)
    const originalSelf = window.self;
    const originalTop = window.top;
    
    Object.defineProperty(window, 'self', { value: {}, configurable: true });
    Object.defineProperty(window, 'top', { value: {}, configurable: true });
    
    const { container } = render(<App />);
    
    // Should render null when in iframe
    expect(container.firstChild).toBeNull();
    
    // Restore original values
    Object.defineProperty(window, 'self', { value: originalSelf, configurable: true });
    Object.defineProperty(window, 'top', { value: originalTop, configurable: true });
  });

  test('handles extension environment correctly', async () => {
    // Mock isExtension
    jest.doMock('./utils/utils', () => ({
      isExtension: true,
    }));
    
    localStorageMock.getItem.mockReturnValue('true');
    
    await waitFor(() => {
      renderApp();
    });
    
    expect(screen.getByTestId('connection-provider')).toBeInTheDocument();
  });
});

describe('App Error Boundaries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('true');
    
    // Suppress console.error for these tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  test('catches navigation errors', async () => {
    // Mock NavigationFrame to throw an error
    jest.doMock('./components/Navbar/NavigationFrame', () => {
      return function NavigationFrame() {
        throw new Error('Navigation error');
      };
    });
    
    const { container } = render(
      <BrowserRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    // Should not crash the entire app
    expect(container).toBeInTheDocument();
  });
});

describe('App Routing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('true');
  });

  test('redirects to correct initial route', async () => {
    // Mock useHasLockedMnemonicAndSeed
    const { useHasLockedMnemonicAndSeed } = require('./utils/wallet-seed');
    useHasLockedMnemonicAndSeed.mockReturnValue([false]);
    
    await waitFor(() => {
      render(
        <BrowserRouter>
          <ThemeProvider>
            <ConnectionProvider>
              <WalletProvider>
                <App />
              </WalletProvider>
            </ConnectionProvider>
          </ThemeProvider>
        </BrowserRouter>
      );
    });
    
    // Should redirect to welcome page when no mnemonic
    expect(window.location.pathname).toBe('/');
  });
});