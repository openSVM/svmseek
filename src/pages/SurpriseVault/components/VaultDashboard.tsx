import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
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
import { 
  VaultHeader, 
  VaultButton, 
  LoadingContainer,
  ErrorContainer,
  SecondaryButton 
} from './shared/StyledComponents';



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
  
  const vaultService = useMemo(() => VaultService.getInstance(), []);

  const loadVaultStats = useCallback(async () => {
    try {
      setLoading(true);
      if (!vaultService || !vaultService.getVaultStats) {
        throw new Error('VaultService not properly initialized');
      }
      const stats = await vaultService.getVaultStats();
      setVaultStats(stats);
      setError(null);
    } catch (err) {
      setError('Failed to load vault statistics');
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading vault stats:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [vaultService]);

  useEffect(() => {
    loadVaultStats();
    
    // Subscribe to real-time updates with proper cleanup
    if (vaultService && vaultService.subscribeToEvents) {
      const unsubscribe = vaultService.subscribeToEvents((event) => {
        if (event.type === 'jackpot_update') {
          setVaultStats(prev => prev ? { ...prev, ...event.data } : null);
        }
      });

      // Cleanup function ensures proper memory management
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, [loadVaultStats, vaultService]);

  // Cleanup VaultService on component unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      // Only call destroy if we're unmounting and vaultService exists
      if (vaultService && vaultService.destroy) {
        const timeoutId = setTimeout(() => {
          vaultService.destroy();
        }, 100);
        
        return () => clearTimeout(timeoutId);
      }
    };
  }, []); // Empty dependency array ensures this only runs on mount/unmount

  const handleJoinLottery = async () => {
    if (!vaultStats || !vaultService || !vaultService.joinLottery) return;
    
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
        <Typography variant="body2" color="text.secondary">
          Loading vault data...
        </Typography>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <SecondaryButton onClick={loadVaultStats}>
          Retry
        </SecondaryButton>
      </ErrorContainer>
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
      <VaultHeader>
        <Typography variant="h3" component="h1" gutterBottom>
          🎰 Surprise Vault Dashboard 🎰
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Lottery-Style Rewards for Every Trade
        </Typography>
      </VaultHeader>

      {/* Stats Section */}
      <Box mb={3}>
        <VaultStats 
          jackpot={vaultStats.jackpot}
          tradesToday={vaultStats.tradesToday}
          userTickets={vaultStats.userTickets}
          totalParticipants={vaultStats.totalParticipants}
          nextDrawTime={vaultStats.nextDrawTime}
        />
      </Box>

      {/* Join Button */}
      <Box display="flex" justifyContent="center" mb={4}>
        <VaultButton
          size="large"
          startIcon={<CasinoIcon />}
          onClick={handleJoinLottery}
          disabled={joining}
        >
          {joining ? 'JOINING...' : 'JOIN THE LOTTERY'}
        </VaultButton>
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