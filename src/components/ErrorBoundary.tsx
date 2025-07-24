import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Alert, Card, CardContent } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { GlassContainer } from './GlassContainer';
import { loggingService } from '../services/LoggingService';

const ErrorContainer = styled(GlassContainer)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '300px',
  padding: theme.spacing(4),
  textAlign: 'center',
  gap: theme.spacing(3),
}));

const ErrorIcon = styled(ErrorOutline)(({ theme }) => ({
  fontSize: '4rem',
  color: theme.palette.error.main,
  marginBottom: theme.spacing(2),
}));

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  showDetails?: boolean;
  onRetry?: () => void;
  context?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log to centralized logging service
    loggingService.logComponentError(error, errorInfo, this.props.context || 'UnknownComponent');
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      const context = this.props.context || 'component';

      return (
        <ErrorContainer>
          <ErrorIcon />
          <Typography variant="h5" gutterBottom>
            Oops! Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            We encountered an error while loading this {context}. 
            This might be due to network connectivity issues or temporary service disruption.
          </Typography>
          
          <Alert severity="error" sx={{ width: '100%', maxWidth: 600 }}>
            <Typography variant="subtitle2" gutterBottom>
              Error Details:
            </Typography>
            <Typography variant="body2" component="pre" sx={{ 
              fontSize: '0.875rem',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
            }}>
              {this.state.error?.message || 'Unknown error occurred'}
            </Typography>
          </Alert>

          {this.props.showDetails && this.state.errorInfo && (
            <Card sx={{ width: '100%', maxWidth: 600, mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Stack Trace:
                </Typography>
                <Typography 
                  variant="body2" 
                  component="pre" 
                  sx={{ 
                    fontSize: '0.75rem',
                    overflow: 'auto',
                    maxHeight: 200,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {this.state.errorInfo.componentStack}
                </Typography>
              </CardContent>
            </Card>
          )}

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={this.handleRetry}
              size="large"
            >
              Try Again
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
              size="large"
            >
              Reload Page
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
            If this problem persists, please try refreshing the page or check your network connection.
          </Typography>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Convenience wrapper for specific use cases
export const NetworkErrorBoundary: React.FC<{ children: ReactNode; onRetry?: () => void }> = ({ 
  children, 
  onRetry 
}) => (
  <ErrorBoundary 
    context="network operation" 
    onRetry={onRetry}
    fallbackComponent={
      <Alert severity="error" sx={{ m: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Network Connection Error
        </Typography>
        <Typography variant="body2">
          Unable to connect to the network. Please check your internet connection and try again.
        </Typography>
        {onRetry && (
          <Button size="small" onClick={onRetry} sx={{ mt: 1 }}>
            Retry
          </Button>
        )}
      </Alert>
    }
  >
    {children}
  </ErrorBoundary>
);

export const RPCErrorBoundary: React.FC<{ children: ReactNode; onRetry?: () => void }> = ({ 
  children, 
  onRetry 
}) => (
  <ErrorBoundary 
    context="RPC service" 
    onRetry={onRetry}
    fallbackComponent={
      <Alert severity="warning" sx={{ m: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          RPC Service Unavailable
        </Typography>
        <Typography variant="body2">
          The blockchain RPC service is temporarily unavailable. Data may be outdated.
        </Typography>
        {onRetry && (
          <Button size="small" onClick={onRetry} sx={{ mt: 1 }}>
            Retry Connection
          </Button>
        )}
      </Alert>
    }
  >
    {children}
  </ErrorBoundary>
);