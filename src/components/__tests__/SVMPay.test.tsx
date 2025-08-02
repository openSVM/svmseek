import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SVMPayInterface } from '../SVMPay';
import { useWallet } from '../../utils/wallet';

// Mock ResizeObserver before any imports
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock MUI components that use ResizeObserver
jest.mock('@mui/material/TextareaAutosize', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef((props, ref) => React.createElement('textarea', { ref, ...props })),
  };
});

jest.mock('@mui/material/TextField', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef(({ multiline, rows, helperText, error, label, placeholder, ...props }, ref) => {
      const element = multiline 
        ? React.createElement('textarea', { ref, rows, placeholder, 'aria-label': label, ...props })
        : React.createElement('input', { ref, placeholder, 'aria-label': label, ...props });
      
      // Create a container div that includes helper text for testing
      return React.createElement('div', { className: 'mocked-text-field' }, [
        element,
        helperText && React.createElement('div', { 
          key: 'helper', 
          className: error ? 'error-text' : 'helper-text' 
        }, helperText)
      ]);
    }),
  };
});

// Mock GlassContainer to prevent ResizeObserver issues
jest.mock('../GlassContainer', () => ({
  __esModule: true,
  default: ({ children, ...props }) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'glass-container', ...props }, children);
  },
  GlassContainer: ({ children, ...props }) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'glass-container', ...props }, children);
  },
}));

// Mock ErrorBoundary to prevent it from catching errors during testing
jest.mock('../ErrorBoundary', () => ({
  __esModule: true,
  default: ({ children }) => children,
}));

// Mock the wallet hook
jest.mock('../../utils/wallet');

// Mock svm-pay with proper methods
jest.mock('svm-pay', () => ({
  SVMPay: jest.fn().mockImplementation(() => ({
    createTransferUrl: jest.fn((recipient, amount, options) => 
      `https://svmpay.mock/transfer?recipient=${recipient}&amount=${amount}&network=${options.network}`
    ),
    parseUrl: jest.fn((url) => ({
      recipient: 'MockRecipientPublicKey123456789',
      amount: '1.0',
      network: 'solana',
      memo: 'Test memo',
      label: 'Test Payment',
      message: 'Test message'
    })),
  }))
}));

const mockUseWallet = useWallet as jest.MockedFunction<typeof useWallet>;

describe('SVMPayInterface', () => {
  const mockWallet = {
    publicKey: { toString: () => 'FakePublicKey123' },
    connected: true,
  };

  beforeEach(() => {
    mockUseWallet.mockReturnValue(mockWallet);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders SVM-Pay interface when active', () => {
    render(<SVMPayInterface isActive={true} />);
    
    expect(screen.getByText('SVM-Pay')).toBeInTheDocument();
    expect(screen.getByText('Cross-network payment solution for SVM networks')).toBeInTheDocument();
  });

  test('does not render when inactive', () => {
    const { container } = render(<SVMPayInterface isActive={false} />);
    expect(container.firstChild).toBeNull();
  });

  test('displays network selection chips', () => {
    render(<SVMPayInterface isActive={true} />);
    
    expect(screen.getByText('Solana')).toBeInTheDocument();
    expect(screen.getByText('Sonic SVM')).toBeInTheDocument();
    expect(screen.getByText('Eclipse')).toBeInTheDocument();
    expect(screen.getByText('S00N')).toBeInTheDocument();
  });

  test('switches between action tabs', async () => {
    const user = userEvent.setup();
    render(<SVMPayInterface isActive={true} />);
    
    // Default tab should be send - check for the card content instead
    expect(screen.getByText('Send payments across SVM networks')).toBeInTheDocument();
    
    // Click on request tab - ActionCard contains the text
    const requestCard = screen.getByText('Request Payment').closest('[role="none"]') || screen.getByText('Request Payment').parentElement;
    await user.click(screen.getByText('Request Payment'));
    
    // Look for the heading in the form area, not the button
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Generate Payment Request' })).toBeInTheDocument();
    });
    
    // Click on process tab
    await user.click(screen.getByText('Process URL'));
    
    // Look for the heading in the form area
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Process Payment URL' })).toBeInTheDocument();
    });
  });

  describe('Send Payment Form', () => {
    test('validates recipient address in real-time', async () => {
      const user = userEvent.setup();
      render(<SVMPayInterface isActive={true} />);
      
      const recipientInput = screen.getByPlaceholderText('Enter Solana address');
      
      // Test invalid address
      await user.type(recipientInput, 'invalid-address');
      await waitFor(() => {
        expect(screen.getByText('Invalid Solana address format')).toBeInTheDocument();
      });
      
      // Clear and test valid format (though we can't validate real keys in test)
      await user.clear(recipientInput);
      await user.type(recipientInput, 'FakeValidPublicKey123456789012345678901234567890ABC');
    });

    test('validates amount in real-time', async () => {
      const user = userEvent.setup();
      render(<SVMPayInterface isActive={true} />);
      
      const amountInput = screen.getByPlaceholderText('0.00');
      
      // Test negative amount
      await user.type(amountInput, '-5');
      await waitFor(() => {
        expect(screen.getByText('Amount must be greater than 0')).toBeInTheDocument();
      });
      
      // Test too many decimals
      await user.clear(amountInput);
      await user.type(amountInput, '1.1234567890123');
      await waitFor(() => {
        expect(screen.getByText('Amount can have at most 9 decimal places')).toBeInTheDocument();
      });
      
      // Test amount too large
      await user.clear(amountInput);
      await user.type(amountInput, '2000000');
      await waitFor(() => {
        expect(screen.getByText('Amount exceeds maximum limit (1,000,000 SOL)')).toBeInTheDocument();
      });
    });

    test('prevents sending to self', async () => {
      const user = userEvent.setup();
      render(<SVMPayInterface isActive={true} />);
      
      const recipientInput = screen.getByPlaceholderText('Enter Solana address');
      const amountInput = screen.getByPlaceholderText('0.00');
      const sendButton = screen.getByRole('button', { name: /send payment/i });
      
      // Fill form with wallet's own address
      await user.type(recipientInput, 'FakePublicKey123');
      await user.type(amountInput, '1');
      
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Cannot send payment to yourself/)).toBeInTheDocument();
      });
    });

    test('disables send button when form is invalid', async () => {
      const user = userEvent.setup();
      render(<SVMPayInterface isActive={true} />);
      
      const sendButton = screen.getByRole('button', { name: /send payment/i });
      
      // Button should be disabled initially
      expect(sendButton).toBeDisabled();
      
      const recipientInput = screen.getByPlaceholderText('Enter Solana address');
      const amountInput = screen.getByPlaceholderText('0.00');
      
      // Fill with invalid data
      await user.type(recipientInput, 'invalid');
      await user.type(amountInput, '1');
      
      // Button should still be disabled
      expect(sendButton).toBeDisabled();
    });
  });

  describe('Payment Request Form', () => {
    test('validates request amount', async () => {
      const user = userEvent.setup();
      render(<SVMPayInterface isActive={true} />);
      
      // Switch to request tab
      await user.click(screen.getByText('Request Payment'));
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Generate Payment Request' })).toBeInTheDocument();
      });
      
      const amountInput = screen.getByPlaceholderText('0.00');
      
      // Test invalid amount
      await user.type(amountInput, '0');
      await waitFor(() => {
        expect(screen.getByText('Amount must be greater than 0')).toBeInTheDocument();
      });
    });

    test('generates payment request URL', async () => {
      const user = userEvent.setup();
      render(<SVMPayInterface isActive={true} />);
      
      // Switch to request tab
      await user.click(screen.getByText('Request Payment'));
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Generate Payment Request' })).toBeInTheDocument();
      });
      
      const amountInput = screen.getByPlaceholderText('0.00');
      const generateButton = screen.getByRole('button', { name: /generate payment request/i });
      
      await user.type(amountInput, '5.5');
      await user.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Payment request generated successfully/)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('shows error when wallet not connected', () => {
      mockUseWallet.mockReturnValue({ publicKey: null, connected: false });
      
      render(<SVMPayInterface isActive={true} />);
      
      expect(screen.getByText('Please connect your wallet to use SVM-Pay')).toBeInTheDocument();
    });

    test('handles network initialization errors gracefully', async () => {
      // Mock SVM-Pay to throw error
      const { SVMPay } = require('svm-pay');
      SVMPay.mockImplementation(() => {
        throw new Error('Network error');
      });
      
      render(<SVMPayInterface isActive={true} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to initialize SVM-Pay/)).toBeInTheDocument();
      });
    });
  });

  describe('Network Selection', () => {
    test('allows network switching', async () => {
      const user = userEvent.setup();
      render(<SVMPayInterface isActive={true} />);
      
      const sonicChip = screen.getByRole('button', { name: 'Sonic SVM' });
      await user.click(sonicChip);
      
      await waitFor(() => {
        expect(screen.getByText(/Connected to Sonic SVM/)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('provides proper form labels and ARIA attributes', () => {
      render(<SVMPayInterface isActive={true} />);
      
      expect(screen.getByLabelText('Recipient Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Amount')).toBeInTheDocument();
      expect(screen.getByLabelText('Memo (Optional)')).toBeInTheDocument();
    });

    test('provides helpful error messages', async () => {
      const user = userEvent.setup();
      render(<SVMPayInterface isActive={true} />);
      
      const recipientInput = screen.getByPlaceholderText('Enter Solana address');
      await user.type(recipientInput, 'invalid');
      
      await waitFor(() => {
        expect(screen.getByText('Invalid Solana address format')).toBeInTheDocument();
      });
    });
  });
});