import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
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
} from '@mui/icons-material';
import { GlassContainer } from '../GlassContainer';
import { useWallet } from '../../utils/wallet';
import ErrorBoundary, { NetworkErrorBoundary } from '../ErrorBoundary';
import { WalletInjectionService } from '../../services/WalletInjectionService';

const BrowserContainer = styled(GlassContainer)`
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 1rem;
  overflow: hidden;
`;

const NavigationBar = styled(Box)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
`;

const AddressBar = styled(TextField)`
  flex: 1;
  .MuiOutlinedInput-root {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    backdrop-filter: blur(10px);
  }
`;

const BrowserFrame = styled.iframe`
  flex: 1;
  border: none;
  border-radius: 12px;
  background: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const DAppsGrid = styled(Grid)`
  padding: 1rem 0;
`;

const DAppCard = styled(Card)`
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: rgba(255, 255, 255, 0.2) !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const LoadingOverlay = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  backdrop-filter: blur(10px);
`;

const SecurityIndicator = styled(Box)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
`;

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
          console.log('Wallet providers injected successfully:', result.injectedProviders);
        } else {
          console.warn('Wallet injection failed:', result.error);
          setConnectionError(result.error || 'Failed to inject wallet providers');
        }
      } catch (error) {
        console.error('Wallet injection error:', error);
        setConnectionError('Failed to setup wallet connection');
      }
    }
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
          <SecurityIndicator>
            <Security fontSize="small" />
            <Typography variant="caption">
              {walletInjected ? 'Wallet Ready' : 'Wallet Connected'}
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

      {connectionError && (
        <Alert severity="warning" onClose={() => setConnectionError(null)}>
          {connectionError}
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
    </BrowserContainer>
    </ErrorBoundary>
  );
};

export default WebBrowser;