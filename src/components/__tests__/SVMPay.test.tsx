import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SVMPayInterface } from '../SVMPay';
import { useWallet } from '../../utils/wallet';

// Mock the wallet hook
jest.mock('../../utils/wallet');
jest.mock('svm-pay');

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
    
    // Default tab should be send
    expect(screen.getByText('Send Payment')).toBeInTheDocument();
    
    // Click on request tab
    await user.click(screen.getByText('Request Payment'));
    expect(screen.getByText('Generate Payment Request')).toBeInTheDocument();
    
    // Click on process tab
    await user.click(screen.getByText('Process URL'));
    expect(screen.getByText('Process Payment URL')).toBeInTheDocument();
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
      const sendButton = screen.getByText('Send Payment');
      
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
      
      const sendButton = screen.getByText('Send Payment');
      
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
      
      const amountInput = screen.getByPlaceholderText('0.00');
      const generateButton = screen.getByText('Generate Payment Request');
      
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
      
      const sonicChip = screen.getByText('Sonic SVM');
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