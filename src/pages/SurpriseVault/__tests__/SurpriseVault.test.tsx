import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

  test('has vault stats display', () => {
    renderWithProviders(<VaultDashboard />);
    
    // Stats should be present
    expect(screen.getByText(/Jackpot/i)).toBeInTheDocument();
    expect(screen.getByText(/Trades Today/i)).toBeInTheDocument();
    expect(screen.getByText(/My Tickets/i)).toBeInTheDocument();
  });
});