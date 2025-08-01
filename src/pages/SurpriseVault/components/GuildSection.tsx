import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Groups as GroupsIcon,
  Add as AddIcon,
  People as PeopleIcon,
  TrendingUp as TrendingIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import VaultService from '../services/VaultService';
import { useVaultWallet } from '../hooks/useVaultWallet';
import { useTruncateAddress } from '../utils';
import { 
  GlassCard, 
  VaultTextField, 
  SecondaryButton, 
  VaultButton,
  SectionHeader,
  StatusChip,
  LoadingContainer,
  ErrorContainer,
  ProgressContainer 
} from './shared/StyledComponents';



interface Guild {
  id: string;
  name: string;
  description: string;
  members: number;
  maxMembers: number;
  totalReferrals: number;
  milestone: {
    current: number;
    target: number;
    reward: string;
  };
  isJoined: boolean;
}

const GuildSection: React.FC = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newGuildName, setNewGuildName] = useState('');
  const [newGuildDescription, setNewGuildDescription] = useState('');
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [joiningGuildId, setJoiningGuildId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const { walletAddress } = useVaultWallet();
  const truncateAddress = useTruncateAddress();
  const vaultService = useMemo(() => VaultService.getInstance(), []);

  const loadGuilds = useCallback(async () => {
    try {
      setLoading(true);
      const guildsData = await vaultService.getGuilds();
      // Transform the data to match our local interface
      const transformedGuilds: Guild[] = guildsData.map(guild => ({
        id: guild.id,
        name: guild.name,
        description: guild.description,
        members: guild.members.length,
        maxMembers: guild.maxMembers,
        totalReferrals: guild.totalReferrals,
        milestone: guild.milestone,
        isJoined: Math.random() > 0.7, // Mock join status
      }));
      setGuilds(transformedGuilds);
      setError(null);
    } catch (err) {
      setError('Failed to load guilds');
      console.error('Error loading guilds:', err);
    } finally {
      setLoading(false);
    }
  }, [vaultService]);

  useEffect(() => {
    loadGuilds();
  }, [loadGuilds]);

  const handleCreateGuild = async () => {
    if (!walletAddress) {
      setActionFeedback({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }
    
    if (!newGuildName.trim()) {
      setActionFeedback({ type: 'error', message: 'Guild name is required' });
      return;
    }
    
    setCreating(true);
    try {
      const result = await vaultService.createGuild(newGuildName.trim(), newGuildDescription.trim(), walletAddress);
      
      if (result.success) {
        setActionFeedback({ type: 'success', message: result.message });
        setCreateDialogOpen(false);
        setNewGuildName('');
        setNewGuildDescription('');
        // Refresh guilds list
        await loadGuilds();
      } else {
        setActionFeedback({ type: 'error', message: result.message });
      }
    } catch (error) {
      setActionFeedback({ type: 'error', message: 'Failed to create guild. Please try again.' });
    } finally {
      setCreating(false);
    }
  };

  const handleJoinGuild = async (guildId: string) => {
    if (!walletAddress) {
      setActionFeedback({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }
    
    setJoiningGuildId(guildId);
    try {
      const result = await vaultService.joinGuild(guildId, walletAddress);
      
      if (result.success) {
        setActionFeedback({ type: 'success', message: result.message });
        // Refresh guilds list to update join status
        await loadGuilds();
      } else {
        setActionFeedback({ type: 'error', message: result.message });
      }
    } catch (error) {
      setActionFeedback({ type: 'error', message: 'Failed to join guild. Please try again.' });
    } finally {
      setJoiningGuildId(null);
    }
  };

  const handleRetry = () => {
    setError(null);
    loadGuilds();
  };

  const handleDismissFeedback = () => {
    setActionFeedback(null);
  };

  return (
    <GlassCard>
      <CardContent>
        <SectionHeader>
          <Typography variant="h6">
            <GroupsIcon sx={{ color: '#FFD700' }} />
            Guilds & Teams
          </Typography>
          <VaultButton
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            disabled={!walletAddress}
          >
            Form a Guild
          </VaultButton>
        </SectionHeader>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Join or create a guild to pool referral bonuses and unlock team-based vault jackpots!
        </Typography>

        {/* Action Feedback */}
        {actionFeedback && (
          <Alert 
            severity={actionFeedback.type} 
            sx={{ mb: 2 }}
            onClose={handleDismissFeedback}
          >
            {actionFeedback.message}
          </Alert>
        )}

        {loading ? (
          <LoadingContainer>
            <CircularProgress sx={{ color: '#FFD700' }} />
            <Typography variant="body2" color="text.secondary">
              Loading guilds...
            </Typography>
          </LoadingContainer>
        ) : error ? (
          <ErrorContainer>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <SecondaryButton onClick={handleRetry}>
              Retry
            </SecondaryButton>
          </ErrorContainer>
        ) : guilds.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              No guilds available. Create the first one!
            </Typography>
            {!walletAddress && (
              <Typography variant="caption" color="text.secondary">
                Connect your wallet to create or join guilds
              </Typography>
            )}
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap={2}>
            {guilds.map((guild) => (
              <GlassCard key={guild.id} sx={{ background: 'rgba(255, 255, 255, 0.04)' }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {guild.name}
                          {guild.isJoined && (
                            <StatusChip 
                              variant="success"
                              size="small" 
                              label="JOINED" 
                              sx={{ ml: 1 }} 
                            />
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {guild.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Created by: {truncateAddress(guild.creator)}
                        </Typography>
                      </Box>
                      {!guild.isJoined && walletAddress && (
                        <SecondaryButton
                          size="small"
                          onClick={() => handleJoinGuild(guild.id)}
                          disabled={joiningGuildId === guild.id}
                        >
                          {joiningGuildId === guild.id ? 'Joining...' : 'Join'}
                        </SecondaryButton>
                      )}
                    </Box>

                    <Box display="flex" gap={2} mb={2}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <PeopleIcon sx={{ fontSize: 16, color: '#FFD700' }} />
                        <Typography variant="caption">
                          {guild.members}/{guild.maxMembers}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <TrendingIcon sx={{ fontSize: 16, color: '#FFD700' }} />
                        <Typography variant="caption">
                          {guild.totalReferrals} referrals
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="caption" color="text.secondary">
                          Milestone Progress
                        </Typography>
                        <StatusChip 
                          variant="warning"
                          size="small" 
                          icon={<TrophyIcon />}
                          label={guild.milestone.reward}
                        />
                      </Box>
                      <ProgressContainer>
                        <LinearProgress 
                          variant="determinate" 
                          value={(guild.milestone.current / guild.milestone.target) * 100}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {guild.milestone.current}/{guild.milestone.target}
                        </Typography>
                      </ProgressContainer>
                    </Box>
                  </CardContent>
                </GlassCard>
            ))}
          </Box>
        )}

        {/* Create Guild Dialog */}
        <Dialog 
          open={createDialogOpen} 
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          <DialogTitle>
            <Typography variant="h6" display="flex" alignItems="center" gap={1}>
              <GroupsIcon sx={{ color: '#FFD700' }} />
              Create New Guild
            </Typography>
          </DialogTitle>
          <DialogContent>
            <VaultTextField
              autoFocus
              margin="dense"
              label="Guild Name"
              fullWidth
              variant="outlined"
              value={newGuildName}
              onChange={(e) => setNewGuildName(e.target.value)}
              sx={{ mb: 2 }}
              error={!newGuildName.trim() && newGuildName.length > 0}
              helperText={!newGuildName.trim() && newGuildName.length > 0 ? 'Guild name is required' : ''}
            />
            <VaultTextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={newGuildDescription}
              onChange={(e) => setNewGuildDescription(e.target.value)}
            />
            {!walletAddress && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Please connect your wallet to create a guild
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <SecondaryButton onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </SecondaryButton>
            <VaultButton 
              onClick={handleCreateGuild}
              disabled={creating || !walletAddress || !newGuildName.trim()}
            >
              {creating ? 'Creating...' : 'Create Guild'}
            </VaultButton>
          </DialogActions>
        </Dialog>
      </CardContent>
    </GlassCard>
  );
};

export default GuildSection;