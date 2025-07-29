import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingIcon,
  ConfirmationNumber as TicketIcon
} from '@mui/icons-material';

const StatsCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 16,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    background: 'rgba(255, 255, 255, 0.12)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  },
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 'bold',
  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: theme.spacing(1),
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontWeight: 500,
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  '& svg': {
    fontSize: '2rem',
    marginRight: theme.spacing(1),
    color: '#FFD700',
  },
}));

interface VaultStatsProps {
  jackpot: number;
  tradesToday: number;
  userTickets: number;
}

const VaultStats: React.FC<VaultStatsProps> = ({ jackpot, tradesToday, userTickets }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 250 }}>
          <StatsCard>
            <CardContent>
              <IconWrapper>
                <WalletIcon />
                <Typography variant="h6">Jackpot</Typography>
              </IconWrapper>
              <StatValue>{formatCurrency(jackpot)}</StatValue>
              <StatLabel>Current prize pool</StatLabel>
            </CardContent>
          </StatsCard>
        </div>

        <div style={{ flex: 1, minWidth: 250 }}>
          <StatsCard>
            <CardContent>
              <IconWrapper>
                <TrendingIcon />
                <Typography variant="h6">Trades Today</Typography>
              </IconWrapper>
              <StatValue>{tradesToday.toLocaleString()}</StatValue>
              <StatLabel>Active participants</StatLabel>
            </CardContent>
          </StatsCard>
        </div>

        <div style={{ flex: 1, minWidth: 250 }}>
          <StatsCard>
            <CardContent>
              <IconWrapper>
                <TicketIcon />
                <Typography variant="h6">My Tickets</Typography>
              </IconWrapper>
              <StatValue>{userTickets}</StatValue>
              <StatLabel>Your entries today</StatLabel>
            </CardContent>
          </StatsCard>
        </div>
      </div>
    </div>
  );
};

export default VaultStats;