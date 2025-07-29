import React, { useState } from 'react';
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
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  EmojiEvents as TrophyIcon,
  Refresh as RefreshIcon,
  CollectionsBookmark as NFTIcon,
  Token as TokenIcon
} from '@mui/icons-material';

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
  const [winners] = useState<Winner[]>([
    {
      id: '1',
      address: '0xTr4der1',
      reward: { type: 'nft', name: 'RareDragon', value: 500 },
      timestamp: new Date(Date.now() - 5 * 60000),
    },
    {
      id: '2',
      address: '0xUserB',
      reward: { type: 'token', name: '100 $SVM', value: 50 },
      timestamp: new Date(Date.now() - 15 * 60000),
    },
    {
      id: '3',
      address: '0xAlice99',
      reward: { type: 'nft', name: 'GoldenCoin', value: 250 },
      timestamp: new Date(Date.now() - 25 * 60000),
    },
    {
      id: '4',
      address: '0xBob777',
      reward: { type: 'token', name: '500 $SVM', value: 125 },
      timestamp: new Date(Date.now() - 35 * 60000),
    },
  ]);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    // Mock refresh with new data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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
            Refresh
          </Button>
        </SectionHeader>

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
      </CardContent>
    </WinnersCard>
  );
};

export default RecentWinners;