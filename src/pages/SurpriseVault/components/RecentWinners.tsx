import React, { useState, useEffect, memo } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText,
  Avatar,
  Chip,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  EmojiEvents as TrophyIcon,
  Refresh as RefreshIcon,
  CollectionsBookmark as NFTIcon,
  Token as TokenIcon
} from '@mui/icons-material';
import VaultService from '../services/VaultService';

const WinnersCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 16,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
  '& h6': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
}));

const WinnerItem = styled(ListItem)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.04)',
  borderRadius: 12,
  marginBottom: theme.spacing(1),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.08)',
    transform: 'translateX(4px)',
  },
}));

const RewardChip = styled(Chip)<{ rewardtype: 'nft' | 'token' }>(({ theme, rewardtype }) => ({
  background: rewardtype === 'nft' 
    ? 'linear-gradient(135deg, #FF6B6B, #FF8E8E)' 
    : 'linear-gradient(135deg, #4ECDC4, #44B7B8)',
  color: '#fff',
  fontWeight: 'bold',
  '& .MuiChip-icon': {
    color: '#fff',
  },
}));

const PrizeValue = styled(Typography)(({ theme }) => ({
  color: '#FFD700',
  fontWeight: 'bold',
  fontSize: '0.9rem',
}));

interface Winner {
  id: string;
  address: string;
  reward: {
    type: 'nft' | 'token';
    name: string;
    value: number;
  };
  timestamp: Date;
}

const RecentWinners: React.FC = () => {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const vaultService = VaultService.getInstance();

  useEffect(() => {
    loadWinners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadWinners = async () => {
    try {
      setLoading(true);
      const winnersData: Winner[] = await vaultService.getRecentWinners(8);
      setWinners(winnersData);
      setError(null);
    } catch (err) {
      setError('Failed to load recent winners');
      console.error('Error loading winners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWinners();
    setRefreshing(false);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-4)}`;
  };

  const formatTimeAgo = (timestamp: Date) => {
    const minutes = Math.floor((Date.now() - timestamp.getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <WinnersCard>
      <CardContent>
        <SectionHeader>
          <Typography variant="h6">
            <TrophyIcon sx={{ color: '#FFD700' }} />
            Recent Winners
          </Typography>
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{ color: '#FFD700' }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </SectionHeader>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress sx={{ color: '#FFD700' }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
            <Button onClick={loadWinners} size="small" sx={{ ml: 1 }}>
              Retry
            </Button>
          </Alert>
        ) : winners.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
            No recent winners yet. Be the first!
          </Typography>
        ) : (
          <List>
            {winners.map((winner) => (
              <WinnerItem key={winner.id}>
                <ListItemAvatar>
                  <Avatar 
                    sx={{ 
                      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                      color: '#000',
                      fontWeight: 'bold'
                    }}
                  >
                    {winner.address.slice(2, 4).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body1" fontWeight="bold">
                        {truncateAddress(winner.address)}
                      </Typography>
                      <RewardChip
                        rewardtype={winner.reward.type}
                        size="small"
                        icon={winner.reward.type === 'nft' ? <NFTIcon /> : <TokenIcon />}
                        label={winner.reward.name}
                      />
                    </Box>
                  }
                  secondary={
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                      <PrizeValue>${winner.reward.value}</PrizeValue>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimeAgo(winner.timestamp)}
                      </Typography>
                    </Box>
                  }
                />
              </WinnerItem>
            ))}
          </List>
        )}
      </CardContent>
    </WinnersCard>
  );
};

export default memo(RecentWinners);