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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  AccessTime as TimeIcon,
  Receipt as TransactionIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const BlocksContainer = styled(Box)(({ theme }) => ({
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

const BlockItem = styled(ListItem)(({ theme }) => ({
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

const BlockNumber = styled(Typography)(({ theme }) => ({
  fontFamily: 'monospace',
  fontWeight: 700,
  fontSize: '1.1rem',
  color: theme.palette.primary.main,
}));

const BlockInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginTop: theme.spacing(0.5),
}));

const InfoChip = styled(Chip)(({ theme }) => ({
  fontSize: '0.75rem',
  height: 20,
  '& .MuiChip-label': {
    padding: '0 6px',
  },
}));

interface Block {
  number: number;
  hash: string;
  timestamp: Date;
  transactions: number;
  size: number;
  slot: number;
}

const RecentBlocks: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const generateMockBlocks = (): Block[] => {
    const now = new Date();
    const mockBlocks: Block[] = [];
    
    for (let i = 0; i < 10; i++) {
      const blockNumber = 323139497 - i;
      mockBlocks.push({
        number: blockNumber,
        hash: `${blockNumber.toString(16).padStart(16, '0')}...${Math.random().toString(16).slice(2, 8)}`,
        timestamp: new Date(now.getTime() - i * 400), // 400ms per block (approximate Solana block time)
        transactions: Math.floor(Math.random() * 3000) + 500,
        size: Math.floor(Math.random() * 50000) + 10000,
        slot: blockNumber,
      });
    }
    
    return mockBlocks;
  };

  const fetchBlocks = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newBlocks = generateMockBlocks();
    setBlocks(newBlocks);
    
    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    fetchBlocks();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchBlocks(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchBlocks]);

  const handleRefresh = () => {
    fetchBlocks(true);
  };

  const handleBlockClick = (block: Block) => {
    console.log('Navigate to block:', block.number);
    // TODO: Implement navigation to block detail view
  };

  const formatTimeAgo = (timestamp: Date): string => {
    const seconds = Math.floor((new Date().getTime() - timestamp.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <BlocksContainer>
        <HeaderBox>
          <Typography variant="h6" fontWeight={600}>
            Recent Blocks
          </Typography>
        </HeaderBox>
        <Box>
          {[...Array(8)].map((_, index) => (
            <Box key={index} mb={1}>
              <Skeleton
                variant="rectangular"
                height={80}
                sx={{ borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.05)' }}
              />
            </Box>
          ))}
        </Box>
      </BlocksContainer>
    );
  }

  return (
    <BlocksContainer>
      <HeaderBox>
        <Typography variant="h6" fontWeight={600}>
          Recent Blocks
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
        {blocks.map((block) => (
          <BlockItem key={block.number} onClick={() => handleBlockClick(block)}>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  <TransactionIcon color="primary" />
                  <BlockNumber>
                    Block #{block.number.toLocaleString()}
                  </BlockNumber>
                </Box>
              }
              secondary={
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'monospace',
                      color: 'text.secondary',
                      display: 'block',
                      marginTop: 0.5,
                    }}
                  >
                    {block.hash}
                  </Typography>
                  <BlockInfo>
                    <InfoChip
                      icon={<TimeIcon />}
                      label={formatTimeAgo(block.timestamp)}
                      variant="outlined"
                      size="small"
                    />
                    <InfoChip
                      icon={<TransactionIcon />}
                      label={`${block.transactions.toLocaleString()} txns`}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                    <InfoChip
                      label={formatBytes(block.size)}
                      color="secondary"
                      variant="outlined"
                      size="small"
                    />
                  </BlockInfo>
                </Box>
              }
            />
          </BlockItem>
        ))}
      </StyledList>
    </BlocksContainer>
  );
};

export default RecentBlocks;