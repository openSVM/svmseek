import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AEANetworkInterface } from '../AEANetwork';
import { ConnectionProvider } from '../../utils/connection';

// Mock fetch for API calls
global.fetch = jest.fn();

// Helper function to render with ConnectionProvider
const renderWithConnection = (ui) => {
  return render(
    <ConnectionProvider>
      {ui}
    </ConnectionProvider>
  );
};

describe('AEANetworkInterface', () => {
  beforeEach(() => {
    (fetch as jest.MockedFunction<typeof fetch>).mockClear();
  });

  test('renders AEA Network interface when active', () => {
    renderWithConnection(<AEANetworkInterface isActive={true} />);
    
    expect(screen.getByText('AEA Network')).toBeInTheDocument();
    expect(screen.getByText('Autonomous Economic Agent Registry and Discovery')).toBeInTheDocument();
  });

  test('does not render when inactive', () => {
    const { container } = renderWithConnection(<AEANetworkInterface isActive={false} />);
    expect(container.firstChild).toBeNull();
  });

  test('displays agent and server tabs', () => {
    renderWithConnection(<AEANetworkInterface isActive={true} />);
    
    expect(screen.getByText('Agents')).toBeInTheDocument();
    expect(screen.getByText('MCP Servers')).toBeInTheDocument();
  });

  test('switches between tabs', async () => {
    const user = userEvent.setup();
    renderWithConnection(<AEANetworkInterface isActive={true} />);
    
    // Default should show agents tab
    expect(screen.getByText('Browse Agents')).toBeInTheDocument();
    
    // Switch to servers tab
    await user.click(screen.getByText('MCP Servers'));
    expect(screen.getByText('Browse MCP Servers')).toBeInTheDocument();
  });

  describe('Agent Registry', () => {
    test('displays agent search and filters', () => {
      renderWithConnection(<AEANetworkInterface isActive={true} />);
      
      expect(screen.getByPlaceholderText('Search agents...')).toBeInTheDocument();
      expect(screen.getByText('All Categories')).toBeInTheDocument();
      expect(screen.getByText('All Capabilities')).toBeInTheDocument();
    });

    test('filters agents by category', async () => {
      const user = userEvent.setup();
      renderWithConnection(<AEANetworkInterface isActive={true} />);
      
      const categoryFilter = screen.getByText('All Categories');
      await user.click(categoryFilter);
      
      // Should show category options
      await waitFor(() => {
        expect(screen.getByText('Trading')).toBeInTheDocument();
      });
    });

    test('searches agents', async () => {
      const user = userEvent.setup();
      renderWithConnection(<AEANetworkInterface isActive={true} />);
      
      const searchInput = screen.getByPlaceholderText('Search agents...');
      await user.type(searchInput, 'trading bot');
      
      // Should trigger search
      await waitFor(() => {
        expect(searchInput).toHaveValue('trading bot');
      });
    });

    test('displays mock agents when no search results', () => {
      renderWithConnection(<AEANetworkInterface isActive={true} />);
      
      // Should show mock agents
      expect(screen.getByText('DeFi Trading Agent')).toBeInTheDocument();
      expect(screen.getByText('Market Maker Agent')).toBeInTheDocument();
      expect(screen.getByText('Arbitrage Agent')).toBeInTheDocument();
    });

    test('shows agent details on click', async () => {
      const user = userEvent.setup();
      renderWithConnection(<AEANetworkInterface isActive={true} />);
      
      const agentCard = screen.getByText('DeFi Trading Agent');
      await user.click(agentCard);
      
      // Should show more details or trigger an action
      // This would depend on the actual implementation
    });
  });

  describe('MCP Server Registry', () => {
    test('displays server search and filters when on servers tab', async () => {
      const user = userEvent.setup();
      renderWithConnection(<AEANetworkInterface isActive={true} />);
      
      await user.click(screen.getByText('MCP Servers'));
      
      expect(screen.getByPlaceholderText('Search MCP servers...')).toBeInTheDocument();
      expect(screen.getByText('All Protocols')).toBeInTheDocument();
    });

    test('displays mock MCP servers', async () => {
      const user = userEvent.setup();
      renderWithConnection(<AEANetworkInterface isActive={true} />);
      
      await user.click(screen.getByText('MCP Servers'));
      
      expect(screen.getByText('Solana RPC Server')).toBeInTheDocument();
      expect(screen.getByText('Price Oracle Server')).toBeInTheDocument();
      expect(screen.getByText('DEX Aggregator Server')).toBeInTheDocument();
    });

    test('connects to MCP server', async () => {
      const user = userEvent.setup();
      renderWithConnection(<AEANetworkInterface isActive={true} />);
      
      await user.click(screen.getByText('MCP Servers'));
      
      const connectButtons = screen.getAllByText('Connect');
      await user.click(connectButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText(/Connected to server/)).toBeInTheDocument();
      });
    });
  });

  describe('Registration Forms', () => {
    test('shows agent registration form', async () => {
      const user = userEvent.setup();
      renderWithConnection(<AEANetworkInterface isActive={true} />);
      
      await user.click(screen.getByText('Register Agent'));
      
      expect(screen.getByText('Register New Agent')).toBeInTheDocument();
      expect(screen.getByLabelText('Agent Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });

    test('validates agent registration form', async () => {
      const user = userEvent.setup();
      renderWithConnection(<AEANetworkInterface isActive={true} />);
      
      await user.click(screen.getByText('Register Agent'));
      
      const submitButton = screen.getByText('Register Agent');
      await user.click(submitButton);
      
      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
    });

    test('submits valid agent registration', async () => {
      const user = userEvent.setup();
      renderWithConnection(<AEANetworkInterface isActive={true} />);
      
      await user.click(screen.getByText('Register Agent'));
      
      // Fill form
      await user.type(screen.getByLabelText('Agent Name'), 'Test Agent');
      await user.type(screen.getByLabelText('Description'), 'Test Description');
      await user.type(screen.getByLabelText('Endpoint URL'), 'https://test.com');
      
      const submitButton = screen.getByText('Register Agent');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Agent registered successfully/)).toBeInTheDocument();
      });
    });

    test('shows server registration form', async () => {
      const user = userEvent.setup();
      renderWithConnection(<AEANetworkInterface isActive={true} />);
      
      await user.click(screen.getByText('MCP Servers'));
      await user.click(screen.getByText('Register Server'));
      
      expect(screen.getByText('Register New MCP Server')).toBeInTheDocument();
      expect(screen.getByLabelText('Server Name')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles network errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock fetch to reject
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(
        new Error('Network error')
      );
      
      renderWithConnection(<AEANetworkInterface isActive={true} />);
      
      await user.click(screen.getByText('Register Agent'));
      
      // Fill and submit form
      await user.type(screen.getByLabelText('Agent Name'), 'Test Agent');
      await user.type(screen.getByLabelText('Description'), 'Test Description');
      await user.type(screen.getByLabelText('Endpoint URL'), 'https://test.com');
      
      const submitButton = screen.getByText('Register Agent');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Registration failed/)).toBeInTheDocument();
      });
    });

    test('handles invalid server URLs', async () => {
      const user = userEvent.setup();
      renderWithConnection(<AEANetworkInterface isActive={true} />);
      
      await user.click(screen.getByText('Register Agent'));
      
      await user.type(screen.getByLabelText('Endpoint URL'), 'invalid-url');
      
      const submitButton = screen.getByText('Register Agent');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filter Integration', () => {
    test('search updates results', async () => {
      const user = userEvent.setup();
      renderWithConnection(<AEANetworkInterface isActive={true} />);
      
      const searchInput = screen.getByPlaceholderText('Search agents...');
      await user.type(searchInput, 'trading');
      
      // Should filter to show only trading-related agents
      await waitFor(() => {
        expect(screen.getByText('DeFi Trading Agent')).toBeInTheDocument();
        expect(screen.queryByText('Weather Oracle Agent')).not.toBeInTheDocument();
      });
    });

    test('category filter works with search', async () => {
      const user = userEvent.setup();
      renderWithConnection(<AEANetworkInterface isActive={true} />);
      
      const categoryFilter = screen.getByText('All Categories');
      await user.click(categoryFilter);
      await user.click(screen.getByText('Oracle'));
      
      // Should show only oracle agents
      await waitFor(() => {
        expect(screen.getByText('Price Oracle Agent')).toBeInTheDocument();
        expect(screen.queryByText('DeFi Trading Agent')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('provides proper ARIA labels and roles', () => {
      renderWithConnection(<AEANetworkInterface isActive={true} />);
      
      expect(screen.getByRole('searchbox')).toBeInTheDocument();
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getAllByRole('tab')).toHaveLength(2);
    });

    test('supports keyboard navigation', async () => {
      renderWithConnection(<AEANetworkInterface isActive={true} />);
      
      const serversTab = screen.getByText('MCP Servers');
      
      // Should be focusable
      serversTab.focus();
      expect(serversTab).toHaveFocus();
      
      // Should activate on Enter
      fireEvent.keyDown(serversTab, { key: 'Enter' });
      await waitFor(() => {
        expect(screen.getByText('Browse MCP Servers')).toBeInTheDocument();
      });
    });
  });

  describe('Real-time Updates', () => {
    test('refreshes agent list on interval', async () => {
      jest.useFakeTimers();
      
      renderWithConnection(<AEANetworkInterface isActive={true} />);
      
      // Fast-forward time to trigger refresh
      jest.advanceTimersByTime(30000);
      
      // Should have made a request to refresh data
      expect(fetch).toHaveBeenCalled();
      
      jest.useRealTimers();
    });
  });
});