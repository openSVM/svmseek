import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
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
import VaultService from '../services/VaultService';
import { VaultStats as VaultStatsType } from '../types';

const DashboardHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3),
  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1))',
  borderRadius: theme.spacing(2),
  border: '1px solid rgba(255, 215, 0, 0.2)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.1), transparent)',
    animation: 'shimmer 3s infinite',
  },
  '@keyframes shimmer': {
    '0%': { left: '-100%' },
    '100%': { left: '100%' },
  },
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
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    background: 'linear-gradient(135deg, #FFA500, #FFD700)',
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(255, 215, 0, 0.4)',
  },
  '&:disabled': {
    background: 'linear-gradient(135deg, #888, #666)',
    color: '#ccc',
    transform: 'none',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
    transition: 'left 0.5s',
  },
  '&:hover::before': {
    left: '100%',
  },
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '200px',
}));

const VaultDashboard: React.FC = () => {
  const [vaultStats, setVaultStats] = useState<VaultStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const vaultService = VaultService.getInstance();

  useEffect(() => {
    loadVaultStats();
    
    // Subscribe to real-time updates
    const unsubscribe = vaultService.subscribeToEvents((event) => {
      if (event.type === 'jackpot_update') {
        setVaultStats(prev => prev ? { ...prev, ...event.data } : null);
      }
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadVaultStats = async () => {
    try {
      setLoading(true);
      const stats = await vaultService.getVaultStats();
      setVaultStats(stats);
      setError(null);
    } catch (err) {
      setError('Failed to load vault statistics');
      console.error('Error loading vault stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLottery = async () => {
    if (!vaultStats) return;
    
    try {
      setJoining(true);
      // Mock trade amount for demo
      const result = await vaultService.joinLottery(100);
      
      if (result.success) {
        // Update local stats
        setVaultStats(prev => prev ? {
          ...prev,
          userTickets: prev.userTickets + result.tickets
        } : null);
        
        // Show success notification
        setNotification({
          open: true,
          message: `🎉 Success! You received ${result.tickets} lottery tickets!`,
          severity: 'success'
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join lottery';
      setError(errorMessage);
      setNotification({
        open: true,
        message: `❌ ${errorMessage}`,
        severity: 'error'
      });
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress sx={{ color: '#FFD700' }} />
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
        <Button onClick={loadVaultStats} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  if (!vaultStats) {
    return (
      <Alert severity="warning">
        No vault data available
      </Alert>
    );
  }

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
          jackpot={vaultStats.jackpot}
          tradesToday={vaultStats.tradesToday}
          userTickets={vaultStats.userTickets}
          totalParticipants={vaultStats.totalParticipants}
          nextDrawTime={vaultStats.nextDrawTime}
        />
      </StatsContainer>

      {/* Join Button */}
      <Box display="flex" justifyContent="center" mb={4}>
        <JoinButton
          size="large"
          startIcon={<CasinoIcon />}
          onClick={handleJoinLottery}
          disabled={joining}
        >
          {joining ? 'JOINING...' : 'JOIN THE LOTTERY'}
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
      
      {/* Success/Error Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setNotification(prev => ({ ...prev, open: false }))} 
          severity={notification.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            fontWeight: 'bold',
            fontSize: '1rem',
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VaultDashboard;