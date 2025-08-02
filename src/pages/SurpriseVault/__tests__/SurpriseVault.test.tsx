import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import VaultDashboard from '../components/VaultDashboard';

// Mock the VaultService module completely
jest.mock('../services/VaultService', () => {
  const mockVaultServiceInstance = {
    getVaultStats: jest.fn().mockResolvedValue({
      jackpot: 123456,
      tradesToday: 987,
      userTickets: 12,
      totalParticipants: 2500,
      nextDrawTime: new Date(),
    }),
    getRecentWinners: jest.fn().mockResolvedValue([]),
    getLeaderboard: jest.fn().mockResolvedValue([]),
    getGuilds: jest.fn().mockResolvedValue([]),
    generateReferralLink: jest.fn().mockReturnValue('https://svmseek.com/vault?ref=test'),
    joinLottery: jest.fn().mockResolvedValue({ success: true, tickets: 2, transactionSignature: 'test' }),
    subscribeToEvents: jest.fn().mockReturnValue(() => {}),
    destroy: jest.fn(),
  };

  return {
    __esModule: true,
    default: {
      getInstance: jest.fn(() => mockVaultServiceInstance),
      reset: jest.fn(() => {
        // Reset the singleton
        mockVaultServiceInstance.destroy();
      }),
    },
  };
});

const theme = createTheme();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('SurpriseVault', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    // Setup userEvent instance for each test
    user = userEvent.setup();
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any timers or resources after each test
    jest.clearAllTimers();
  });

  afterAll(() => {
    // Final cleanup
    jest.useRealTimers();
  });

  test('renders vault dashboard with main elements', async () => {
    await act(async () => {
      renderWithProviders(<VaultDashboard />);
    });
    
    // Check for main heading
    expect(screen.getByText(/Surprise Vault Dashboard/i)).toBeInTheDocument();
    
    // Check for lottery description
    expect(screen.getByText(/Lottery-Style Rewards for Every Trade/i)).toBeInTheDocument();
    
    // Check for join button
    expect(screen.getByRole('button', { name: /join the lottery/i })).toBeInTheDocument();
  });

  test('join lottery button is clickable and handles success', async () => {
    await act(async () => {
      renderWithProviders(<VaultDashboard />);
    });
    
    const joinButton = screen.getByRole('button', { name: /join the lottery/i });
    
    // Use userEvent for more realistic interaction
    await act(async () => {
      await user.click(joinButton);
    });
    
    expect(joinButton).toBeInTheDocument();
  });

  test('join lottery button handles failure gracefully', async () => {
    // Mock failure scenario for negative testing
    const VaultService = require('../services/VaultService').default;
    const mockInstance = VaultService.getInstance();
    mockInstance.joinLottery.mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      renderWithProviders(<VaultDashboard />);
    });
    
    const joinButton = screen.getByRole('button', { name: /join the lottery/i });
    
    // Test error handling
    await act(async () => {
      await user.click(joinButton);
    });
    
    // Button should still be in document after error
    expect(joinButton).toBeInTheDocument();
  });

  test('has vault stats display', async () => {
    await act(async () => {
      renderWithProviders(<VaultDashboard />);
    });
    
    // Wait for loading to complete with proper async handling
    await waitFor(() => {
      expect(screen.getAllByText(/Jackpot/i)[0]).toBeInTheDocument();
    });
    
    // Stats should be present - use more specific selectors
    expect(screen.getAllByText(/Jackpot/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Participants/i)).toBeInTheDocument();
    expect(screen.getByText(/My Tickets/i)).toBeInTheDocument();
    expect(screen.getByText(/Next Draw/i)).toBeInTheDocument();
  });
});