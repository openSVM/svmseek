import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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
  beforeEach(() => {
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

  test('join lottery button is clickable', async () => {
    await act(async () => {
      renderWithProviders(<VaultDashboard />);
    });
    
    const joinButton = screen.getByRole('button', { name: /join the lottery/i });
    
    // Should be clickable without error
    await act(async () => {
      fireEvent.click(joinButton);
    });
    
    expect(joinButton).toBeInTheDocument();
  });

  test('has vault stats display', async () => {
    await act(async () => {
      renderWithProviders(<VaultDashboard />);
    });
    
    // Wait for loading to complete
    await act(async () => {
      await screen.findAllByText(/Jackpot/i);
    });
    
    // Stats should be present - use more specific selectors
    expect(screen.getAllByText(/Jackpot/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Participants/i)).toBeInTheDocument();
    expect(screen.getByText(/My Tickets/i)).toBeInTheDocument();
    expect(screen.getByText(/Next Draw/i)).toBeInTheDocument();
  });
});