import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  Chip,
  IconButton,
  Skeleton,
  Avatar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  AccessTime as TimeIcon,
  TrendingUp as SuccessIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const TransactionsContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
}));

const StyledList = styled(List)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  padding: 0,
}));

const TransactionItem = styled(ListItem)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 12,
  marginBottom: theme.spacing(1),
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateX(4px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  },
  
  '&:last-child': {
    marginBottom: 0,
  },
}));

const TransactionHash = styled(Typography)(({ theme }) => ({
  fontFamily: 'monospace',
  fontWeight: 600,
  fontSize: '0.9rem',
  color: theme.palette.primary.main,
}));

const TransactionInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginTop: theme.spacing(0.5),
  flexWrap: 'wrap',
}));

const InfoChip = styled(Chip)(({ theme }) => ({
  fontSize: '0.75rem',
  height: 20,
  '& .MuiChip-label': {
    padding: '0 6px',
  },
}));

const StatusAvatar = styled(Avatar)(({ theme }) => ({
  width: 32,
  height: 32,
  marginRight: theme.spacing(1),
}));

interface Transaction {
  signature: string;
  status: 'success' | 'failed';
  type: string;
  timestamp: Date;
  fee: number;
  slot: number;
  accounts: number;
  programId?: string;
}

const TransactionList: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const generateMockTransactions = (): Transaction[] => {
    const now = new Date();
    const mockTransactions: Transaction[] = [];
    
    const types = ['Transfer', 'Swap', 'Stake', 'Vote', 'Program Call', 'Token Create', 'NFT Mint'];
    const programs = [
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
      'So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo',
    ];
    
    for (let i = 0; i < 15; i++) {
      const signature = Array.from({ length: 88 }, () => 
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
          .charAt(Math.floor(Math.random() * 62))
      ).join('');
      
      mockTransactions.push({
        signature,
        status: Math.random() > 0.05 ? 'success' : 'failed',
        type: types[Math.floor(Math.random() * types.length)],
        timestamp: new Date(now.getTime() - i * 2000 - Math.random() * 10000),
        fee: Math.random() * 0.01 + 0.000005,
        slot: 323139497 - Math.floor(i / 3),
        accounts: Math.floor(Math.random() * 8) + 2,
        programId: programs[Math.floor(Math.random() * programs.length)],
      });
    }
    
    return mockTransactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const fetchTransactions = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const newTransactions = generateMockTransactions();
    setTransactions(newTransactions);
    
    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    fetchTransactions();
    
    // Auto-refresh every 45 seconds
    const interval = setInterval(() => {
      fetchTransactions(true);
    }, 45000);
    
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  const handleRefresh = () => {
    fetchTransactions(true);
  };

  const handleTransactionClick = (transaction: Transaction) => {
    console.log('Navigate to transaction:', transaction.signature);
    // TODO: Implement navigation to transaction detail view
  };

  const formatTimeAgo = (timestamp: Date): string => {
    const seconds = Math.floor((new Date().getTime() - timestamp.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const formatSignature = (signature: string): string => {
    return `${signature.slice(0, 8)}...${signature.slice(-8)}`;
  };

  const getStatusIcon = (status: string) => {
    return status === 'success' ? (
      <SuccessIcon sx={{ color: 'success.main' }} />
    ) : (
      <ErrorIcon sx={{ color: 'error.main' }} />
    );
  };

  if (isLoading) {
    return (
      <TransactionsContainer>
        <HeaderBox>
          <Typography variant="h6" fontWeight={600}>
            Recent Transactions
          </Typography>
        </HeaderBox>
        <Box>
          {[...Array(10)].map((_, index) => (
            <Box key={index} mb={1}>
              <Skeleton
                variant="rectangular"
                height={75}
                sx={{ borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.05)' }}
              />
            </Box>
          ))}
        </Box>
      </TransactionsContainer>
    );
  }

  return (
    <TransactionsContainer>
      <HeaderBox>
        <Typography variant="h6" fontWeight={600}>
          Recent Transactions
        </Typography>
        <IconButton
          onClick={handleRefresh}
          disabled={isRefreshing}
          size="small"
          sx={{
            animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            },
          }}
        >
          <RefreshIcon />
        </IconButton>
      </HeaderBox>
      
      <StyledList>
        {transactions.map((transaction) => (
          <TransactionItem
            key={transaction.signature}
            onClick={() => handleTransactionClick(transaction)}
          >
            <StatusAvatar
              sx={{
                bgcolor: transaction.status === 'success' ? 'success.main' : 'error.main',
              }}
            >
              {getStatusIcon(transaction.status)}
            </StatusAvatar>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <TransactionHash>
                    {formatSignature(transaction.signature)}
                  </TransactionHash>
                  <InfoChip
                    label={transaction.type}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                </Box>
              }
              secondary={
                <TransactionInfo>
                  <InfoChip
                    icon={<TimeIcon />}
                    label={formatTimeAgo(transaction.timestamp)}
                    variant="outlined"
                    size="small"
                  />
                  <InfoChip
                    label={`${transaction.fee.toFixed(6)} SOL`}
                    color="secondary"
                    variant="outlined"
                    size="small"
                  />
                  <InfoChip
                    label={`Slot ${transaction.slot.toLocaleString()}`}
                    variant="outlined"
                    size="small"
                  />
                  <InfoChip
                    label={`${transaction.accounts} accounts`}
                    variant="outlined"
                    size="small"
                  />
                </TransactionInfo>
              }
            />
          </TransactionItem>
        ))}
      </StyledList>
    </TransactionsContainer>
  );
};

export default TransactionList;