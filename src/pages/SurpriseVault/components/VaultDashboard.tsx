import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Casino as CasinoIcon,
} from '@mui/icons-material';
import VaultStats from './VaultStats';
import RecentWinners from './RecentWinners';
import Leaderboard from './Leaderboard';
import InviteSection from './InviteSection';
import GuildSection from './GuildSection';

const DashboardHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3),
  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1))',
  borderRadius: theme.spacing(2),
  border: '1px solid rgba(255, 215, 0, 0.2)',
}));

const JoinButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
  color: '#000',
  fontWeight: 'bold',
  fontSize: '1.2rem',
  padding: theme.spacing(1.5, 4),
  borderRadius: theme.spacing(3),
  textTransform: 'none',
  boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'linear-gradient(135deg, #FFA500, #FFD700)',
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(255, 215, 0, 0.4)',
  },
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const VaultDashboard: React.FC = () => {
  const [jackpot] = useState(123456);
  const [tradesToday] = useState(987);
  const [userTickets, setUserTickets] = useState(12);

  const handleJoinLottery = () => {
    // Mock join lottery functionality
    setUserTickets(prev => prev + 1);
  };

  return (
    <Box>
      <DashboardHeader>
        <Typography variant="h3" component="h1" gutterBottom>
          🎰 Surprise Vault Dashboard 🎰
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Lottery-Style Rewards for Every Trade
        </Typography>
      </DashboardHeader>

      {/* Stats Section */}
      <StatsContainer>
        <VaultStats 
          jackpot={jackpot}
          tradesToday={tradesToday}
          userTickets={userTickets}
        />
      </StatsContainer>

      {/* Join Button */}
      <Box display="flex" justifyContent="center" mb={4}>
        <JoinButton
          size="large"
          startIcon={<CasinoIcon />}
          onClick={handleJoinLottery}
        >
          JOIN THE LOTTERY
        </JoinButton>
      </Box>

      <Divider sx={{ my: 4, background: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Recent Winners */}
      <RecentWinners />

      <Divider sx={{ my: 4, background: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Leaderboard */}
      <Leaderboard />

      <Divider sx={{ my: 4, background: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Invite Section */}
      <InviteSection />

      <Divider sx={{ my: 4, background: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Guild Section */}
      <GuildSection />
    </Box>
  );
};

export default VaultDashboard;