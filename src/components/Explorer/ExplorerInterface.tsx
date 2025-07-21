import React, { useState, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchBar from './SearchBar';
import NetworkStats from './NetworkStats';
import RecentBlocks from './RecentBlocks';
import TransactionList from './TransactionList';
import { GlassContainer } from '../GlassContainer';
import ErrorBoundary, { RPCErrorBoundary, NetworkErrorBoundary } from '../ErrorBoundary';

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

// Mock data
const mockStats = {
  blocksProcessed: 323139497,
  activeValidators: 1388,
  tps: 4108,
  epoch: 748,
  networkLoad: 0.81,
  blockHeight: 323139497,
  avgBlockTime: 0.4,
  totalTransactions: 285847329,
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

  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    setIsLoading(true);
    
    // Simulate search API call
    setTimeout(() => {
      // Parse search query to determine type
      const lowerQuery = query.toLowerCase().trim();
      const mockResults: SearchResult[] = [];

      // Mock transaction search
      if (lowerQuery.length === 88 || lowerQuery.includes('transaction')) {
        mockResults.push({
          type: 'transaction',
          id: query.length === 88 ? query : '5VfydnLz8YGV4RqD6DF9hnVxf7YGEWJFaAqN7h1QEi3m9KjH8P1BX3x9yYnA1W4R',
          title: 'Transaction',
          status: 'Success',
          slot: 323139497,
          timestamp: new Date(),
        });
      }

      // Mock account search
      if (lowerQuery.length === 44 || lowerQuery.includes('account')) {
        mockResults.push({
          type: 'account',
          id: query.length === 44 ? query : 'FD1VbCsN8HB8cYaW6P2o9L1YkJiZcBHGdLz4J3x9Y2k',
          title: 'Account',
          balance: '1,234.567 SOL',
          tokens: 5,
        });
      }

      // Mock block search
      if (/^\d+$/.test(lowerQuery) || lowerQuery.includes('block')) {
        const blockNumber = /^\d+$/.test(lowerQuery) ? parseInt(lowerQuery) : 323139497;
        mockResults.push({
          type: 'block',
          id: blockNumber.toString(),
          title: `Block #${blockNumber}`,
          transactions: 1234,
          timestamp: new Date(),
        });
      }

      // Default to general search if no specific pattern matches
      if (mockResults.length === 0) {
        mockResults.push({
          type: 'search',
          id: query,
          title: 'General Search',
          description: `Search results for "${query}"`,
        });
      }

      setSearchResults(mockResults);
      setIsLoading(false);
    }, 800);
  }, []);

  const handleSearchResultClick = useCallback((result: SearchResult) => {
    console.log('Navigate to:', result);
    // TODO: Implement navigation to detailed views
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
            <NetworkStats stats={mockStats} />
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