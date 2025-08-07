import React, { useCallback, useMemo } from 'react';
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
  totalParticipants: number;
  nextDrawTime: Date;
}

const VaultStats: React.FC<VaultStatsProps> = ({
  jackpot,
  tradesToday,
  userTickets,
  totalParticipants,
  nextDrawTime
}) => {
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const formatTimeUntilDraw = useCallback((drawTime: Date) => {
    const now = new Date();
    const diff = drawTime.getTime() - now.getTime();

    if (diff <= 0) return 'Drawing now!';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, []);

  // Memoize formatted values for performance
  const formattedJackpot = useMemo(() => formatCurrency(jackpot), [formatCurrency, jackpot]);
  const formattedDrawTime = useMemo(() => formatTimeUntilDraw(nextDrawTime), [formatTimeUntilDraw, nextDrawTime]);

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
              <StatValue>{formattedJackpot}</StatValue>
              <StatLabel>Current prize pool</StatLabel>
            </CardContent>
          </StatsCard>
        </div>

        <div style={{ flex: 1, minWidth: 250 }}>
          <StatsCard>
            <CardContent>
              <IconWrapper>
                <TrendingIcon />
                <Typography variant="h6">Participants</Typography>
              </IconWrapper>
              <StatValue>{totalParticipants.toLocaleString()}</StatValue>
              <StatLabel>{tradesToday} trades today</StatLabel>
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

      {/* Next Draw Countdown */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <StatsCard sx={{ maxWidth: 400 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Next Draw In
            </Typography>
            <StatValue style={{ fontSize: '1.8rem' }}>
              {formattedDrawTime}
            </StatValue>
            <StatLabel>
              {nextDrawTime.toLocaleDateString()} at {nextDrawTime.toLocaleTimeString()}
            </StatLabel>
          </CardContent>
        </StatsCard>
      </div>
    </div>
  );
};

export default VaultStats;
