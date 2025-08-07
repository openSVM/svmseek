import React from 'react';
import { render } from '@testing-library/react';

// Mock react-router-dom using manual mock
jest.mock('react-router-dom');

// Mock all the complex dependencies that cause hanging
jest.mock('./utils/connection', () => ({
  ConnectionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="connection-provider">{children}</div>
  ),
  useConnection: () => ({
    connection: null,
    endpoint: 'https://api.devnet.solana.com',
  }),
}));

jest.mock('./utils/wallet', () => ({
  WalletProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="wallet-provider">{children}</div>
  ),
  useWallet: () => null,
}));

jest.mock('./context/ThemeContext', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}));

// Mock all services and complex imports
jest.mock('./services/MultiAccountManager');
jest.mock('./services/WalletGroupService');
jest.mock('./services/TransactionHistoryService');
jest.mock('./services/ExportService');
jest.mock('./utils/wallet-seed');
jest.mock('./utils/useOnboarding');
jest.mock('./utils/connected-wallets');
jest.mock('./utils/tokens/names');
jest.mock('./utils/utils', () => ({
  isExtension: false,
}));

// Mock all lazy-loaded components
jest.mock('./routes/ConnectPopup', () => () => <div data-testid="connect-popup">ConnectPopup</div>);
jest.mock('./routes/WelcomeBack', () => () => <div data-testid="welcome-back">WelcomeBack</div>);
jest.mock('./routes/WalletRouter', () => () => <div data-testid="wallet-router">WalletRouter</div>);
jest.mock('./routes/RestoreWallet', () => () => <div data-testid="restore-wallet">RestoreWallet</div>);
jest.mock('./routes/Welcome', () => () => <div data-testid="welcome">Welcome</div>);
jest.mock('./routes/CreateWallet', () => () => <div data-testid="create-wallet">CreateWallet</div>);
jest.mock('./routes/Help', () => () => <div data-testid="help">Help</div>);
jest.mock('./pages/SurpriseVault', () => () => <div data-testid="surprise-vault">SurpriseVault</div>);
jest.mock('./components/OnboardingTutorial', () => () => <div data-testid="onboarding-tutorial">OnboardingTutorial</div>);
jest.mock('./components/PWAInstallPrompt', () => () => <div data-testid="pwa-install">PWAInstallPrompt</div>);
jest.mock('./components/OnboardingSetup', () => () => <div data-testid="onboarding-setup">OnboardingSetup</div>);
jest.mock('./components/LoadingIndicator', () => () => <div data-testid="loading">Loading</div>);
jest.mock('./components/Navbar/NavigationFrame', () => () => <div data-testid="navigation-frame">NavigationFrame</div>);
jest.mock('./components/SnackbarProvider', () => ({ children }: { children: React.ReactNode }) => <div data-testid="snackbar-provider">{children}</div>);
jest.mock('./components/ErrorBoundary', () => ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>);

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

describe('App Basic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('renders without crashing', () => {
    // Import App after mocks are set up
    const App = require('./App').default;

    localStorageMock.getItem.mockReturnValue('true'); // onboarding-setup-complete

    const { container } = render(<App />);

    expect(container).toBeInTheDocument();
  });

  test('prevents iframe embedding', () => {
    // Mock window.self !== window.top (iframe scenario)
    const originalSelf = window.self;
    const originalTop = window.top;

    Object.defineProperty(window, 'self', { value: {}, configurable: true });
    Object.defineProperty(window, 'top', { value: {}, configurable: true });

    const App = require('./App').default;
    const { container } = render(<App />);

    // Should render null when in iframe
    expect(container.firstChild).toBeNull();

    // Restore original values
    Object.defineProperty(window, 'self', { value: originalSelf, configurable: true });
    Object.defineProperty(window, 'top', { value: originalTop, configurable: true });
  });
});
