import React, { useState, useCallback, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchBar from './SearchBar';
import NetworkStats from './NetworkStats';
import RecentBlocks from './RecentBlocks';
import TransactionList from './TransactionList';
import { GlassContainer } from '../GlassContainer';
import ErrorBoundary, { RPCErrorBoundary, NetworkErrorBoundary } from '../ErrorBoundary';
import { solanaRPCService, NetworkStats as NetworkStatsType } from '../../services/SolanaRPCService';
import { devLog, logError } from '../../utils/logger';

const ExplorerContainer = styled(GlassContainer)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  padding: theme.spacing(3),
  overflow: 'auto',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const ContentGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.spacing(3),
  flex: 1,
  minHeight: 0,
  
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

const Section = styled(GlassContainer)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

// Default stats for loading state
const defaultStats: NetworkStatsType = {
  blocksProcessed: 0,
  activeValidators: 0,
  tps: 0,
  epoch: 0,
  networkLoad: 0,
  blockHeight: 0,
  avgBlockTime: 0,
  totalTransactions: 0,
};

interface ExplorerInterfaceProps {
  isActive?: boolean;
}

interface SearchResult {
  type: string;
  id: string;
  title: string;
  status?: string;
  balance?: string;
  tokens?: number;
  transactions?: number;
  timestamp?: Date;
  slot?: number;
  description?: string;
}

const ExplorerInterface: React.FC<ExplorerInterfaceProps> = ({ isActive = true }) => {
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [networkStats, setNetworkStats] = useState<NetworkStatsType>(defaultStats);
  const [statsLoading, setStatsLoading] = useState(true);

  // Load network stats on component mount
  useEffect(() => {
    const loadNetworkStats = async () => {
      try {
        setStatsLoading(true);
        const stats = await solanaRPCService.getNetworkStats();
        setNetworkStats(stats);
      } catch (error) {
        logError('Failed to load network stats:', error);
        // Keep default stats on error
      } finally {
        setStatsLoading(false);
      }
    };

    if (isActive) {
      loadNetworkStats();
      // Refresh stats every 30 seconds
      const interval = setInterval(loadNetworkStats, 30000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await solanaRPCService.search(query);
      const searchResult: SearchResult[] = [];

      switch (result.type) {
        case 'account':
          searchResult.push({
            type: 'account',
            id: result.data.address,
            title: 'Account',
            balance: `${result.data.balance.toFixed(6)} SOL`,
            tokens: result.data.tokens?.length || 0,
          });
          break;
        case 'transaction':
          searchResult.push({
            type: 'transaction',
            id: result.data.signature,
            title: 'Transaction',
            status: result.data.status,
            slot: result.data.slot,
            timestamp: result.data.timestamp,
          });
          break;
        case 'block':
          searchResult.push({
            type: 'block',
            id: result.data.slot.toString(),
            title: `Block #${result.data.slot}`,
            transactions: result.data.transactions,
            timestamp: result.data.timestamp,
          });
          break;
        default:
          searchResult.push({
            type: 'search',
            id: query,
            title: 'No Results Found',
            description: `No account, transaction, or block found for "${query}"`,
          });
      }

      setSearchResults(searchResult);
    } catch (error) {
      logError('Search failed:', error);
      setSearchResults([{
        type: 'search',
        id: query,
        title: 'Search Error',
        description: 'Failed to search. Please try again.',
      }]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearchResultClick = useCallback((result: SearchResult) => {
    devLog('Navigate to:', result);
    
  }, []);

  if (!isActive) {
    return null;
  }

  return (
    <ErrorBoundary context="Explorer" showDetails={false}>
      <ExplorerContainer className="fade-in">
        <Box>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 3,
            }}
          >
            OpenSVM Explorer
          </Typography>
          <NetworkErrorBoundary onRetry={() => window.location.reload()}>
            <SearchBar
              onSearch={handleSearch}
              searchResults={searchResults}
              onResultClick={handleSearchResultClick}
              isLoading={isLoading}
            />
          </NetworkErrorBoundary>
        </Box>

        <StatsContainer>
          <RPCErrorBoundary onRetry={() => window.location.reload()}>
            <NetworkStats stats={networkStats} isLoading={statsLoading} />
          </RPCErrorBoundary>
        </StatsContainer>

        <ContentGrid>
          <Section>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Recent Blocks
            </Typography>
            <RPCErrorBoundary onRetry={() => window.location.reload()}>
              <RecentBlocks />
            </RPCErrorBoundary>
          </Section>
          
          <Section>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Recent Transactions
            </Typography>
            <RPCErrorBoundary onRetry={() => window.location.reload()}>
              <TransactionList />
            </RPCErrorBoundary>
          </Section>
        </ContentGrid>
      </ExplorerContainer>
    </ErrorBoundary>
  );
};

export default ExplorerInterface;