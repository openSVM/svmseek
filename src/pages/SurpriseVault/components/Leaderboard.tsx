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
  Badge
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Leaderboard as LeaderboardIcon,
  EmojiEvents as TrophyIcon,
  LocalOffer as BadgeIcon,
  MoneyOff as RebateIcon,
  Star as StarIcon
} from '@mui/icons-material';

const LeaderboardCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 16,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  '& h6': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
}));

const LeaderItem = styled(ListItem)<{ rank: number }>(({ theme, rank }) => ({
  background: rank <= 3 
    ? `linear-gradient(135deg, rgba(255, 215, 0, ${0.15 - rank * 0.03}), rgba(255, 165, 0, ${0.1 - rank * 0.02}))` 
    : 'rgba(255, 255, 255, 0.04)',
  borderRadius: 12,
  marginBottom: theme.spacing(1),
  border: rank <= 3 ? '1px solid rgba(255, 215, 0, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: rank <= 3 
      ? `linear-gradient(135deg, rgba(255, 215, 0, ${0.2 - rank * 0.03}), rgba(255, 165, 0, ${0.15 - rank * 0.02}))` 
      : 'rgba(255, 255, 255, 0.08)',
    transform: 'translateX(4px)',
  },
}));

const RankAvatar = styled(Avatar)<{ rank: number }>(({ theme, rank }) => {
  const getRankColor = () => {
    switch (rank) {
      case 1: return 'linear-gradient(135deg, #FFD700, #FFA500)'; // Gold
      case 2: return 'linear-gradient(135deg, #C0C0C0, #A8A8A8)'; // Silver
      case 3: return 'linear-gradient(135deg, #CD7F32, #B8860B)'; // Bronze
      default: return 'linear-gradient(135deg, #6C7B7F, #5A6C70)'; // Default
    }
  };

  return {
    background: getRankColor(),
    color: '#000',
    fontWeight: 'bold',
    fontSize: '1.1rem',
  };
});

const InviteCount = styled(Typography)(({ theme }) => ({
  color: '#FFD700',
  fontWeight: 'bold',
  fontSize: '1rem',
}));

const RewardBadge = styled(Chip)<{ rewardtype: 'nft' | 'rebate' | 'odds' }>(({ theme, rewardtype }) => {
  const getRewardColor = () => {
    switch (rewardtype) {
      case 'nft': return 'linear-gradient(135deg, #FF6B6B, #FF8E8E)';
      case 'rebate': return 'linear-gradient(135deg, #4ECDC4, #44B7B8)';
      case 'odds': return 'linear-gradient(135deg, #9B59B6, #8E44AD)';
      default: return 'linear-gradient(135deg, #95A5A6, #7F8C8D)';
    }
  };

  return {
    background: getRewardColor(),
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '0.7rem',
    height: 24,
    '& .MuiChip-icon': {
      color: '#fff',
      fontSize: '0.9rem',
    },
  };
});

interface LeaderboardEntry {
  id: string;
  address: string;
  invites: number;
  reward: {
    type: 'nft' | 'rebate' | 'odds';
    description: string;
  };
}

const Leaderboard: React.FC = () => {
  const [leaders] = useState<LeaderboardEntry[]>([
    {
      id: '1',
      address: '0xAlice',
      invites: 32,
      reward: { type: 'nft', description: 'NFT Badge' },
    },
    {
      id: '2',
      address: '0xBob',
      invites: 27,
      reward: { type: 'rebate', description: 'Fee Rebate' },
    },
    {
      id: '3',
      address: '0xCharlie',
      invites: 23,
      reward: { type: 'odds', description: 'Higher Odds' },
    },
    {
      id: '4',
      address: '0xDave',
      invites: 18,
      reward: { type: 'nft', description: 'NFT Badge' },
    },
    {
      id: '5',
      address: '0xEve',
      invites: 15,
      reward: { type: 'rebate', description: 'Fee Rebate' },
    },
  ]);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-4)}`;
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'nft': return <BadgeIcon />;
      case 'rebate': return <RebateIcon />;
      case 'odds': return <StarIcon />;
      default: return <BadgeIcon />;
    }
  };

  return (
    <LeaderboardCard>
      <CardContent>
        <SectionHeader>
          <Typography variant="h6">
            <LeaderboardIcon sx={{ color: '#FFD700' }} />
            Leaderboard (Top Inviters)
          </Typography>
        </SectionHeader>

        <List>
          {leaders.map((leader, index) => {
            const rank = index + 1;
            return (
              <LeaderItem key={leader.id} rank={rank}>
                <ListItemAvatar>
                  <Badge
                    badgeContent={rank <= 3 ? <TrophyIcon sx={{ fontSize: 12 }} /> : null}
                    color="primary"
                    overlap="circular"
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  >
                    <RankAvatar rank={rank}>
                      {rank}
                    </RankAvatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body1" fontWeight="bold">
                        {truncateAddress(leader.address)}
                      </Typography>
                      <RewardBadge
                        rewardtype={leader.reward.type}
                        size="small"
                        icon={getRewardIcon(leader.reward.type)}
                        label={leader.reward.description}
                      />
                    </Box>
                  }
                  secondary={
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                      <InviteCount>{leader.invites} invites</InviteCount>
                      <Typography variant="caption" color="text.secondary">
                        Week #{Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)) % 52}
                      </Typography>
                    </Box>
                  }
                />
              </LeaderItem>
            );
          })}
        </List>
      </CardContent>
    </LeaderboardCard>
  );
};

export default Leaderboard;