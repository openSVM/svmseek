import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBoundary, { NetworkErrorBoundary, RPCErrorBoundary } from '../ErrorBoundary';

// Component that throws an error for testing
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error occurred</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  
  afterAll(() => {
    console.error = originalError;
  });

  test('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('No error occurred')).toBeInTheDocument();
  });

  test('renders error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  test('displays context-specific error message', () => {
    render(
      <ErrorBoundary context="payment form">
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/We encountered an error while loading this payment form/)).toBeInTheDocument();
  });

  test('shows custom fallback component when provided', () => {
    const CustomFallback = <div>Custom error fallback</div>;
    
    render(
      <ErrorBoundary fallbackComponent={CustomFallback}>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Custom error fallback')).toBeInTheDocument();
    expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument();
  });

  test('calls onRetry when retry button is clicked', () => {
    const mockRetry = jest.fn();
    
    render(
      <ErrorBoundary onRetry={mockRetry}>
        <ThrowError />
      </ErrorBoundary>
    );
    
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);
    
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  test('shows error details when showDetails is true', () => {
    render(
      <ErrorBoundary showDetails={true}>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Stack Trace:')).toBeInTheDocument();
  });

  test('hides error details by default', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.queryByText('Stack Trace:')).not.toBeInTheDocument();
  });

  test('reload page button works', () => {
    // Mock window.location.reload
    const mockReload = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    });
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    const reloadButton = screen.getByText('Reload Page');
    fireEvent.click(reloadButton);
    
    expect(mockReload).toHaveBeenCalledTimes(1);
  });

  test('resets error state when retry is clicked', () => {
    const ErrorToggle: React.FC = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true);
      
      return (
        <ErrorBoundary onRetry={() => setShouldThrow(false)}>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );
    };
    
    render(<ErrorToggle />);
    
    // Should show error initially
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    
    // Click retry
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);
    
    // Should show success state
    expect(screen.getByText('No error occurred')).toBeInTheDocument();
  });
});

describe('NetworkErrorBoundary', () => {
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  
  afterAll(() => {
    console.error = originalError;
  });

  test('shows network-specific error message', () => {
    render(
      <NetworkErrorBoundary>
        <ThrowError />
      </NetworkErrorBoundary>
    );
    
    expect(screen.getByText('Network Connection Error')).toBeInTheDocument();
    expect(screen.getByText(/check your internet connection/)).toBeInTheDocument();
  });

  test('shows retry button when onRetry provided', () => {
    const mockRetry = jest.fn();
    
    render(
      <NetworkErrorBoundary onRetry={mockRetry}>
        <ThrowError />
      </NetworkErrorBoundary>
    );
    
    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });
});

describe('RPCErrorBoundary', () => {
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  
  afterAll(() => {
    console.error = originalError;
  });

  test('shows RPC-specific error message', () => {
    render(
      <RPCErrorBoundary>
        <ThrowError />
      </RPCErrorBoundary>
    );
    
    expect(screen.getByText('RPC Service Unavailable')).toBeInTheDocument();
    expect(screen.getByText(/blockchain RPC service is temporarily unavailable/)).toBeInTheDocument();
  });

  test('shows warning severity for RPC errors', () => {
    render(
      <RPCErrorBoundary>
        <ThrowError />
      </RPCErrorBoundary>
    );
    
    // Check for warning alert (MUI Alert with warning severity)
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-standardWarning');
  });

  test('includes retry connection button', () => {
    const mockRetry = jest.fn();
    
    render(
      <RPCErrorBoundary onRetry={mockRetry}>
        <ThrowError />
      </RPCErrorBoundary>
    );
    
    const retryButton = screen.getByText('Retry Connection');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });
});

describe('ErrorBoundary Integration', () => {
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  
  afterAll(() => {
    console.error = originalError;
  });

  test('works with nested error boundaries', () => {
    const OuterError: React.FC = () => {
      throw new Error('Outer error');
    };
    
    const InnerError: React.FC = () => {
      throw new Error('Inner error');
    };
    
    render(
      <ErrorBoundary context="outer component">
        <OuterError />
        <ErrorBoundary context="inner component">
          <InnerError />
        </ErrorBoundary>
      </ErrorBoundary>
    );
    
    // Outer boundary should catch the error
    expect(screen.getByText(/error while loading this outer component/)).toBeInTheDocument();
    expect(screen.getByText('Outer error')).toBeInTheDocument();
  });

  test('logs errors to console', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(console.error).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.any(Error),
      expect.any(Object)
    );
  });

  test('provides helpful user guidance', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/If this problem persists/)).toBeInTheDocument();
    expect(screen.getByText(/check your network connection/)).toBeInTheDocument();
  });
});