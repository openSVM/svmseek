import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import VaultDashboard from '../components/VaultDashboard';

// Mock the VaultService
jest.mock('../services/VaultService', () => ({
  getInstance: () => ({
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
    subscribeToEvents: jest.fn().mockReturnValue(() => {}), // Mock unsubscribe function
  }),
}));

const theme = createTheme();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('SurpriseVault', () => {
  test('renders vault dashboard with main elements', async () => {
    renderWithProviders(<VaultDashboard />);
    
    // Check for main heading
    expect(screen.getByText(/Surprise Vault Dashboard/i)).toBeInTheDocument();
    
    // Check for lottery description
    expect(screen.getByText(/Lottery-Style Rewards for Every Trade/i)).toBeInTheDocument();
    
    // Check for join button
    expect(screen.getByRole('button', { name: /join the lottery/i })).toBeInTheDocument();
  });

  test('join lottery button is clickable', async () => {
    renderWithProviders(<VaultDashboard />);
    
    const joinButton = screen.getByRole('button', { name: /join the lottery/i });
    
    // Should be clickable without error
    fireEvent.click(joinButton);
    
    expect(joinButton).toBeInTheDocument();
  });

  test('has vault stats display', async () => {
    renderWithProviders(<VaultDashboard />);
    
    // Wait for loading to complete
    await screen.findByText(/Jackpot/i);
    
    // Stats should be present
    expect(screen.getByText(/Jackpot/i)).toBeInTheDocument();
    expect(screen.getByText(/Participants/i)).toBeInTheDocument();
    expect(screen.getByText(/My Tickets/i)).toBeInTheDocument();
    expect(screen.getByText(/Next Draw/i)).toBeInTheDocument();
  });

  test('shows loading state initially', () => {
    renderWithProviders(<VaultDashboard />);
    
    // Should show loading indicator
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('shows error state when service fails', async () => {
    const mockService = require('../services/VaultService').getInstance();
    mockService.getVaultStats.mockRejectedValueOnce(new Error('Network error'));
    
    renderWithProviders(<VaultDashboard />);
    
    // Wait for error state
    await screen.findByText(/Failed to load vault statistics/i);
    expect(screen.getByText(/Failed to load vault statistics/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});