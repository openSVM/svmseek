# SVMSeek Error Handling and Recovery System

This document describes the comprehensive error handling mechanisms implemented in SVMSeek and how applications should consume error recovery events.

## Overview

SVMSeek implements a multi-layered error handling system designed to:
1. **Prevent crashes** from third-party wallet extension conflicts
2. **Recover gracefully** from null pointer access errors
3. **Provide user-friendly feedback** for recoverable errors
4. **Maintain application stability** in complex browser environments

## Architecture

### Global Error Handler (`src/utils/globalErrorHandler.ts`)

The `GlobalErrorHandler` class provides comprehensive error catching and recovery:

```typescript
import { globalErrorHandler } from './utils/globalErrorHandler';

// The handler auto-initializes, but you can access error stats
const errorStats = globalErrorHandler.getErrorStats();
console.log('Error statistics:', errorStats);
```

### Error Types Handled

#### 1. Wallet Extension Conflicts
- **Problem**: Multiple wallet extensions try to define `window.ethereum`
- **Solution**: Monkey-patch `Object.defineProperty` to detect and resolve conflicts
- **Event**: `svmseek-wallet-conflict`

#### 2. Null Property Access
- **Problem**: Third-party code assumes `event.data` is always defined
- **Solution**: Wrap event listeners with null-safe validation
- **Event**: `svmseek-error-recovery`

#### 3. Unhandled Promise Rejections
- **Problem**: Async operations fail without proper error handling
- **Solution**: Global promise rejection handler with recovery attempts
- **Event**: `svmseek-error-recovery`

## Event-Driven Error Recovery

The error handling system dispatches custom events that your application can listen for:

### 1. Error Recovery Events (`svmseek-error-recovery`)

```typescript
window.addEventListener('svmseek-error-recovery', (event) => {
  const { errorMessage, errorType, errorCount } = event.detail;
  
  // Show user-friendly error message
  showErrorToast(`Recovered from ${errorType}: ${errorMessage}`);
  
  // Track error for analytics
  analytics.track('error_recovered', {
    type: errorType,
    message: errorMessage,
    count: errorCount
  });
  
  // Attempt specific recovery actions
  switch (errorType) {
    case 'promise_rejection':
      // Retry failed operation
      retryLastOperation();
      break;
    case 'global_error':
      // Refresh component state
      refreshApplicationState();
      break;
  }
});
```

### 2. Wallet Conflict Events (`svmseek-wallet-conflict`)

```typescript
window.addEventListener('svmseek-wallet-conflict', (event) => {
  const { message, suggestion } = event.detail;
  
  // Show user guidance for wallet conflicts
  showWalletConflictDialog({
    title: 'Multiple Wallets Detected',
    message: message,
    suggestion: suggestion,
    actions: [
      {
        label: 'Learn More',
        action: () => openWalletCompatibilityGuide()
      },
      {
        label: 'Continue Anyway',
        action: () => dismissWalletConflictDialog()
      }
    ]
  });
});
```

### 3. Custom SVMSeek Events (`svmseek-event`)

```typescript
window.addEventListener('svmseek-event', (event) => {
  const eventData = event.detail;
  
  // Handle application-specific events
  switch (eventData.type) {
    case 'wallet_injection_ready':
      console.log('Wallet providers injected successfully');
      break;
    case 'security_violation':
      handleSecurityViolation(eventData);
      break;
  }
});
```

## Implementation Guidelines

### For Component Developers

#### 1. Defensive Programming
Always assume external data might be null or undefined:

```typescript
// ❌ Bad: Assumes event.data exists
const handleMessage = (event: MessageEvent) => {
  const { type, payload } = event.data;
  // This will crash if event.data is null
};

// ✅ Good: Defensive null checking
const handleMessage = (event: MessageEvent) => {
  if (!event.data || typeof event.data !== 'object') {
    console.warn('Invalid message data received');
    return;
  }
  
  const { type, payload } = event.data;
  // Safe to proceed
};
```

#### 2. Error Boundary Integration
Integrate with React Error Boundaries to catch component-level errors:

```typescript
// ErrorBoundary should listen for recovery events
class ErrorBoundary extends React.Component {
  componentDidMount() {
    window.addEventListener('svmseek-error-recovery', this.handleErrorRecovery);
  }
  
  handleErrorRecovery = (event) => {
    // Attempt to recover component state
    this.setState({ hasError: false, error: null });
  };
}
```

### For API Integrations

#### 1. Timeout Handling
Use centralized timeout constants:

```typescript
import { TIMEOUT_CONSTANTS } from '../utils/constants';

const apiCall = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    TIMEOUT_CONSTANTS.NETWORK_REQUEST
  );
  
  try {
    const response = await fetch('/api/data', {
      signal: controller.signal
    });
    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
};
```

#### 2. Retry Logic
Implement exponential backoff for failed requests:

```typescript
import { getRetryDelay, ERROR_CONSTANTS } from '../utils/constants';

const retryableApiCall = async (attempt = 0) => {
  try {
    return await apiCall();
  } catch (error) {
    if (attempt < ERROR_CONSTANTS.MAX_RETRIES) {
      const delay = getRetryDelay(attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryableApiCall(attempt + 1);
    }
    throw error;
  }
};
```

## Configuration

### Error Handler Configuration

```typescript
import { GlobalErrorHandler } from './utils/globalErrorHandler';

// Custom configuration
const errorHandler = new GlobalErrorHandler({
  enableRecovery: true,        // Enable automatic recovery attempts
  enableLogging: true,         // Log errors to console
  enableUserNotification: true // Dispatch user-facing events
});

errorHandler.initialize();
```

### Constants Configuration

Modify timeout and error constants in `src/utils/constants.ts`:

```typescript
export const TIMEOUT_CONSTANTS = {
  NETWORK_REQUEST: 10000,      // API request timeout
  IFRAME_LOAD: 10000,          // Iframe loading timeout
  MESSAGE_RESPONSE: 30000,     // Wallet message timeout
  // ... other timeouts
} as const;
```

## Testing Error Handling

### Unit Tests
Test error scenarios with mock failures:

```typescript
import { globalErrorHandler } from '../utils/globalErrorHandler';

describe('Error Recovery', () => {
  test('should recover from null data access', () => {
    const mockEvent = new CustomEvent('svmseek-error-recovery');
    const handler = jest.fn();
    
    window.addEventListener('svmseek-error-recovery', handler);
    
    // Simulate null data error
    window.dispatchEvent(mockEvent);
    
    expect(handler).toHaveBeenCalled();
  });
});
```

### Integration Tests
Test wallet extension conflicts:

```typescript
test('should handle wallet extension conflicts', () => {
  // Simulate MetaMask defining ethereum
  Object.defineProperty(window, 'ethereum', {
    value: { isMetaMask: true },
    configurable: false
  });
  
  // Attempt to redefine (simulating Phantom)
  try {
    Object.defineProperty(window, 'ethereum', {
      value: { isPhantom: true }
    });
  } catch (error) {
    // Error should be caught and handled gracefully
    expect(error.message).toContain('Cannot redefine property');
  }
});
```

## Best Practices

### 1. Event Listener Cleanup
Always clean up event listeners to prevent memory leaks:

```typescript
useEffect(() => {
  const handleError = (event) => {
    // Handle error recovery
  };
  
  window.addEventListener('svmseek-error-recovery', handleError);
  
  return () => {
    window.removeEventListener('svmseek-error-recovery', handleError);
  };
}, []);
```

### 2. Error Analytics
Track error patterns for improvement:

```typescript
window.addEventListener('svmseek-error-recovery', (event) => {
  // Send to analytics service
  analytics.track('error_recovery', {
    error_type: event.detail.errorType,
    error_message: event.detail.errorMessage,
    user_agent: navigator.userAgent,
    timestamp: new Date().toISOString()
  });
});
```

### 3. User Experience
Provide clear, actionable error messages:

```typescript
const showUserFriendlyError = (errorType, errorMessage) => {
  const userMessages = {
    wallet_conflict: {
      title: 'Multiple Wallets Detected',
      message: 'You have multiple wallet extensions installed. This might cause conflicts.',
      action: 'Learn about wallet compatibility'
    },
    null_access: {
      title: 'Temporary Issue',
      message: 'We encountered a temporary issue but recovered automatically.',
      action: 'No action needed'
    }
  };
  
  const config = userMessages[errorType] || {
    title: 'Error Recovered',
    message: 'An error occurred but was handled automatically.',
    action: 'Continue using the app'
  };
  
  showNotification(config);
};
```

## Troubleshooting

### Common Issues

1. **Error Recovery Not Working**
   - Check that `globalErrorHandler.initialize()` is called
   - Verify event listeners are properly attached
   - Check browser console for initialization errors

2. **Too Many Recovery Events**
   - Error handler limits recovery attempts per error type
   - Check if error patterns indicate a deeper issue
   - Review error statistics with `globalErrorHandler.getErrorStats()`

3. **Wallet Extension Conflicts Persist**
   - Some extensions may override our protection
   - Consider showing user guidance to disable conflicting extensions
   - Report specific extension combinations that cause issues

### Debug Mode

Enable debug logging for troubleshooting:

```typescript
import { GlobalErrorHandler } from './utils/globalErrorHandler';

const debugErrorHandler = new GlobalErrorHandler({
  enableLogging: true,
  enableRecovery: true,
  enableUserNotification: true
});

// Monitor error patterns
setInterval(() => {
  const stats = debugErrorHandler.getErrorStats();
  if (Object.keys(stats).length > 0) {
    console.log('Error stats:', stats);
  }
}, 30000);
```

## Future Improvements

1. **Machine Learning Error Prediction**: Analyze error patterns to predict and prevent common failures
2. **A/B Testing Recovery Strategies**: Test different recovery approaches to optimize user experience
3. **Real-time Error Monitoring**: Integrate with error tracking services for production monitoring
4. **Custom Error Recovery Policies**: Allow applications to define custom recovery strategies per error type
