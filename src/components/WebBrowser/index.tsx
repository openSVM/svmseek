import React, { useState, useRef, useEffect, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import {
  IconButton,
  TextField,
  Box,
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  Refresh,
  Home,
  Search,
  OpenInNew,
  Security,
  Language,
  Warning,
  CheckCircle,
  Replay,
} from '@mui/icons-material';
import { GlassContainer } from '../GlassContainer';
import { useWallet } from '../../utils/wallet';
import ErrorBoundary, { NetworkErrorBoundary } from '../ErrorBoundary';
import { WalletInjectionService } from '../../services/WalletInjectionService';
import { createInputProps, ValidationPresets } from '../../utils/inputValidation';

const BrowserContainer = styled(GlassContainer)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  gap: theme.spacing(2),
  overflow: 'hidden',
}));

const NavigationBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: 12,
  backdropFilter: 'blur(10px)',
}));

const AddressBar = styled(TextField)(({ theme }) => ({
  flex: 1,
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    backdropFilter: 'blur(10px)',
  },
}));

const BrowserFrame = styled('iframe')(({ theme }) => ({
  flex: 1,
  border: 'none',
  borderRadius: 12,
  background: 'white',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
}));

const DAppsGrid = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(2, 0),
}));

const DAppCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1) !important',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.2) !important',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
  },
}));

const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255, 255, 255, 0.9)',
  borderRadius: 12,
  backdropFilter: 'blur(10px)',
}));

const SecurityIndicator = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'error',
})<{ error?: boolean }>(({ theme, error }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.5, 1.5),
  borderRadius: 20,
  background: error ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)',
  border: error ? '1px solid rgba(244, 67, 54, 0.3)' : '1px solid rgba(76, 175, 80, 0.3)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  
  '&:hover': {
    background: error ? 'rgba(244, 67, 54, 0.2)' : 'rgba(76, 175, 80, 0.2)',
  },
}));

const WalletStatusDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
}));

// Popular Solana dApps
const POPULAR_DAPPS = [
  {
    name: 'Jupiter',
    description: 'Swap Aggregator',
    url: 'https://jup.ag',
    icon: '🪐',
    category: 'DEX',
  },
  {
    name: 'Raydium',
    description: 'Automated Market Maker',
    url: 'https://raydium.io',
    icon: '⚡',
    category: 'DEX',
  },
  {
    name: 'Orca',
    description: 'User-friendly DEX',
    url: 'https://www.orca.so',
    icon: '🐋',
    category: 'DEX',
  },
  {
    name: 'Magic Eden',
    description: 'NFT Marketplace',
    url: 'https://magiceden.io',
    icon: '🎨',
    category: 'NFT',
  },
  {
    name: 'Marinade',
    description: 'Liquid Staking',
    url: 'https://marinade.finance',
    icon: '🥩',
    category: 'Staking',
  },
  {
    name: 'Solend',
    description: 'Lending Protocol',
    url: 'https://solend.fi',
    icon: '💰',
    category: 'Lending',
  },
  {
    name: 'Mango Markets',
    description: 'Leveraged Trading',
    url: 'https://app.mango.markets',
    icon: '🥭',
    category: 'Trading',
  },
  {
    name: 'Step Finance',
    description: 'Portfolio Manager',
    url: 'https://app.step.finance',
    icon: '📊',
    category: 'Portfolio',
  },
  {
    name: 'Tensor',
    description: 'NFT Trading Platform',
    url: 'https://www.tensor.trade',
    icon: '⚡',
    category: 'NFT',
  },
  {
    name: 'Kamino',
    description: 'Yield Optimization',
    url: 'https://kamino.finance',
    icon: '🌊',
    category: 'DeFi',
  },
  {
    name: 'Phoenix',
    description: 'Order Book DEX',
    url: 'https://app.phoenix.trade',
    icon: '🔥',
    category: 'DEX',
  },
];

interface WebBrowserProps {
  isActive?: boolean;
}

export const WebBrowser: React.FC<WebBrowserProps> = ({ isActive = true }) => {
  const [currentUrl, setCurrentUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDApps, setShowDApps] = useState(true);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [walletInjected, setWalletInjected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [injectionAttempts, setInjectionAttempts] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const walletInjectionServiceRef = useRef<WalletInjectionService | null>(null);
  const wallet = useWallet();

  // Initialize wallet injection service
  useEffect(() => {
    if (wallet && !walletInjectionServiceRef.current) {
      walletInjectionServiceRef.current = new WalletInjectionService(wallet);
    }
    
    return () => {
      if (walletInjectionServiceRef.current) {
        walletInjectionServiceRef.current.cleanup();
        walletInjectionServiceRef.current = null;
      }
    };
  }, [wallet]);

  const isValidUrl = (url: string) => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const navigateToUrl = (url: string) => {
    if (!url) return;
    
    const finalUrl = url.startsWith('http') ? url : `https://${url}`;
    
    if (isValidUrl(finalUrl)) {
      setIsLoading(true);
      setCurrentUrl(finalUrl);
      setInputUrl(finalUrl);
      setShowDApps(false);
      
      // Add to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(finalUrl);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const url = history[newIndex];
      setCurrentUrl(url);
      setInputUrl(url);
      setIsLoading(true);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const url = history[newIndex];
      setCurrentUrl(url);
      setInputUrl(url);
      setIsLoading(true);
    }
  };

  const handleRefresh = () => {
    if (currentUrl && iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = currentUrl;
    }
  };

  const handleHome = () => {
    setCurrentUrl('');
    setInputUrl('');
    setShowDApps(true);
    setIsLoading(false);
  };

  const handleIframeLoad = async () => {
    setIsLoading(false);
    setConnectionError(null);
    
    // Inject wallet provider using the secure service
    if (walletInjectionServiceRef.current && iframeRef.current) {
      try {
        const result = await walletInjectionServiceRef.current.injectWalletProviders(iframeRef.current);
        
        if (result.success) {
          setWalletInjected(true);
          setInjectionAttempts(0);
          setShowSuccessMessage(true);
          console.log('Wallet providers injected successfully:', result.injectedProviders);
        } else {
          setWalletInjected(false);
          setInjectionAttempts(prev => prev + 1);
          setConnectionError(result.error || 'Failed to inject wallet providers');
          console.warn('Wallet injection failed:', result.error);
        }
      } catch (error) {
        setWalletInjected(false);
        setInjectionAttempts(prev => prev + 1);
        setConnectionError('Failed to setup wallet connection');
        console.error('Wallet injection error:', error);
      }
    }
  };

  const retryWalletInjection = async () => {
    if (!walletInjectionServiceRef.current || !iframeRef.current) return;
    
    setIsRetrying(true);
    setConnectionError(null);
    
    try {
      // Wait a moment before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await walletInjectionServiceRef.current.injectWalletProviders(iframeRef.current);
      
      if (result.success) {
        setWalletInjected(true);
        setInjectionAttempts(0);
        setShowSuccessMessage(true);
        setShowWalletDialog(false);
      } else {
        setInjectionAttempts(prev => prev + 1);
        setConnectionError(result.error || 'Retry failed');
      }
    } catch (error) {
      setInjectionAttempts(prev => prev + 1);
      setConnectionError('Retry failed');
    } finally {
      setIsRetrying(false);
    }
  };

  const openExternalBrowser = () => {
    if (currentUrl) {
      window.open(currentUrl, '_blank');
    }
  };

  const getWalletStatusMessage = () => {
    if (walletInjected) return 'Wallet Connected Successfully';
    if (injectionAttempts === 0) return 'Connecting Wallet...';
    if (injectionAttempts === 1) return 'Connection Failed - Retrying...';
    return 'Multiple Connection Attempts Failed';
  };

  const getRecoveryOptions = () => {
    const options = [
      'Refresh the page and try again',
      'Open the dApp in a new browser tab',
      'Check if the dApp supports external wallet connections',
    ];
    
    if (injectionAttempts > 2) {
      options.push('Some dApps may not support embedded wallet connections');
    }
    
    return options;
  };

  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      navigateToUrl(inputUrl);
    }
  };

  useEffect(() => {
    if (!isActive) {
      setIsLoading(false);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <ErrorBoundary context="Web3 Browser" showDetails={false}>
      <BrowserContainer className="fade-in">
      <NavigationBar data-testid="browser-navigation">
        <IconButton 
          onClick={handleBack} 
          disabled={historyIndex <= 0}
          size="small"
        >
          <ArrowBack />
        </IconButton>
        
        <IconButton 
          onClick={handleForward} 
          disabled={historyIndex >= history.length - 1}
          size="small"
        >
          <ArrowForward />
        </IconButton>
        
        <IconButton onClick={handleRefresh} size="small">
          <Refresh />
        </IconButton>
        
        <IconButton onClick={handleHome} size="small">
          <Home />
        </IconButton>
        
        <AddressBar
          placeholder="Enter URL or search Solana dApps..."
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onKeyPress={handleKeyPress}
          size="small"
          inputProps={{
            maxLength: 2048,
            'aria-label': 'Address bar - enter URL or search terms'
          }}
          InputProps={{
            startAdornment: <Search style={{ marginRight: '0.5rem', opacity: 0.7 }} />,
          }}
        />
        
        {wallet?.publicKey && (
          <SecurityIndicator 
            error={!walletInjected}
            onClick={() => setShowWalletDialog(true)}
            title="Click for wallet connection details"
          >
            {walletInjected ? <CheckCircle fontSize="small" /> : <Warning fontSize="small" />}
            <Typography variant="caption">
              {walletInjected ? 'Wallet Ready' : 'Connection Issue'}
            </Typography>
          </SecurityIndicator>
        )}
        
        {currentUrl && (
          <IconButton 
            onClick={() => window.open(currentUrl, '_blank')}
            size="small"
            title="Open in new tab"
          >
            <OpenInNew />
          </IconButton>
        )}
      </NavigationBar>

      {connectionError && !showWalletDialog && (
        <Alert 
          severity={injectionAttempts > 2 ? "error" : "warning"} 
          onClose={() => setConnectionError(null)}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setShowWalletDialog(true)}
              startIcon={<Security />}
            >
              Details
            </Button>
          }
        >
          {injectionAttempts > 2 
            ? 'Wallet connection failed multiple times. Some dApps may not support embedded wallets.'
            : 'Wallet connection issue detected. Click Details for recovery options.'
          }
        </Alert>
      )}

      {showDApps ? (
        <Box>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Language color="primary" />
            <Typography variant="h6">
              Popular Solana dApps
            </Typography>
          </Box>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Browse Solana dApps with built-in wallet connectivity. Some features may require external wallet confirmation for security.
          </Alert>
          
          <NetworkErrorBoundary onRetry={() => setShowDApps(true)}>
            <DAppsGrid container spacing={2}>
              {POPULAR_DAPPS.map((dapp) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={dapp.name}>
                  <DAppCard onClick={() => navigateToUrl(dapp.url)} data-testid="dapp-card">
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="h4">{dapp.icon}</Typography>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {dapp.name}
                          </Typography>
                          <Chip 
                            label={dapp.category} 
                            size="small" 
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {dapp.description}
                      </Typography>
                    </CardContent>
                  </DAppCard>
                </Grid>
              ))}
            </DAppsGrid>
          </NetworkErrorBoundary>
        </Box>
      ) : (
        <Box position="relative" flex={1}>
          {isLoading && (
            <LoadingOverlay>
              <CircularProgress />
            </LoadingOverlay>
          )}
          <BrowserFrame
            ref={iframeRef}
            src={currentUrl}
            onLoad={handleIframeLoad}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            title="Solana dApp Browser"
          />
        </Box>
      )}
      
      {/* Wallet Status Dialog */}
      <WalletStatusDialog
        open={showWalletDialog}
        onClose={() => setShowWalletDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            {walletInjected ? (
              <CheckCircle color="success" />
            ) : (
              <Warning color="warning" />
            )}
            <Typography variant="h6">
              {getWalletStatusMessage()}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {walletInjected ? (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                Your SVMSeek wallet is successfully connected to this dApp. You can now interact with Solana features.
              </Alert>
              <Typography variant="body2" color="text.secondary">
                • Wallet address: {wallet?.publicKey?.toString().slice(0, 8)}...{wallet?.publicKey?.toString().slice(-4)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Connection secure and active
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Transaction signing requires confirmation in main app
              </Typography>
            </Box>
          ) : (
            <Box>
              <Alert severity={injectionAttempts > 2 ? "error" : "warning"} sx={{ mb: 2 }}>
                {connectionError || 'Unable to connect wallet to this dApp.'}
              </Alert>
              
              <Typography variant="subtitle2" gutterBottom>
                Try these recovery options:
              </Typography>
              
              <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                {getRecoveryOptions().map((option, index) => (
                  <Typography component="li" variant="body2" key={index} sx={{ mb: 0.5 }}>
                    {option}
                  </Typography>
                ))}
              </Box>
              
              {currentUrl && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  You can also open this dApp in your external browser where it may work better with browser extension wallets.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowWalletDialog(false)}>
            Close
          </Button>
          
          {!walletInjected && (
            <Button
              onClick={retryWalletInjection}
              disabled={isRetrying}
              startIcon={isRetrying ? <CircularProgress size={16} /> : <Replay />}
              variant="outlined"
            >
              {isRetrying ? 'Retrying...' : 'Retry Connection'}
            </Button>
          )}
          
          {currentUrl && (
            <Button
              onClick={openExternalBrowser}
              startIcon={<OpenInNew />}
              variant="contained"
            >
              Open Externally
            </Button>
          )}
        </DialogActions>
      </WalletStatusDialog>
      
      {/* Success notification */}
      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={3000}
        onClose={() => setShowSuccessMessage(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setShowSuccessMessage(false)} 
          severity="success"
          variant="filled"
        >
          Wallet connected successfully!
        </Alert>
      </Snackbar>
    </BrowserContainer>
    </ErrorBoundary>
  );
};

export default WebBrowser;