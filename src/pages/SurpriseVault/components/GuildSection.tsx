import React, { useState, useEffect } from 'react';
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
  TextField,
  LinearProgress,
  CircularProgress,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Groups as GroupsIcon,
  Add as AddIcon,
  People as PeopleIcon,
  TrendingUp as TrendingIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import VaultService from '../services/VaultService';
import { Guild as GuildType } from '../types';

const GuildCard = styled(Card)(({ theme }) => ({
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

const GuildItem = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.04)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 12,
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.08)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
}));

const CreateGuildButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #9B59B6, #8E44AD)',
  color: '#fff',
  fontWeight: 'bold',
  borderRadius: 12,
  textTransform: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'linear-gradient(135deg, #8E44AD, #7D3C98)',
    transform: 'translateY(-2px)',
  },
}));

const JoinGuildButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4ECDC4, #44B7B8)',
  color: '#fff',
  fontWeight: 'bold',
  borderRadius: 8,
  textTransform: 'none',
  fontSize: '0.8rem',
  padding: theme.spacing(0.5, 1.5),
  '&:hover': {
    background: 'linear-gradient(135deg, #44B7B8, #3BAEA3)',
  },
}));

const GuildProgress = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  '& .MuiLinearProgress-root': {
    borderRadius: 4,
    height: 6,
    background: 'rgba(255, 255, 255, 0.1)',
  },
  '& .MuiLinearProgress-bar': {
    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
  },
}));

const RewardBadge = styled(Chip)(({ theme }) => ({
  background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
  color: '#fff',
  fontWeight: 'bold',
  fontSize: '0.7rem',
  height: 24,
}));

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
  
  const vaultService = VaultService.getInstance();

  useEffect(() => {
    loadGuilds();
  }, []);

  const loadGuilds = async () => {
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
  };

  const handleCreateGuild = () => {
    // Mock guild creation
    setCreateDialogOpen(false);
    setNewGuildName('');
    setNewGuildDescription('');
  };

  const handleJoinGuild = (guildId: string) => {
    // Mock join guild functionality
    console.log('Joining guild:', guildId);
  };

  return (
    <GuildCard>
      <CardContent>
        <SectionHeader>
          <Typography variant="h6">
            <GroupsIcon sx={{ color: '#FFD700' }} />
            Guilds & Teams
          </Typography>
          <CreateGuildButton
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Form a Guild
          </CreateGuildButton>
        </SectionHeader>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Join or create a guild to pool referral bonuses and unlock team-based vault jackpots!
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress sx={{ color: '#FFD700' }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : guilds.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
            No guilds available. Create the first one!
          </Typography>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {guilds.map((guild) => (
              <GuildItem key={guild.id}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {guild.name}
                          {guild.isJoined && (
                            <Chip 
                              size="small" 
                              label="JOINED" 
                              sx={{ 
                                ml: 1, 
                                background: 'linear-gradient(135deg, #4ECDC4, #44B7B8)',
                                color: '#fff',
                                fontWeight: 'bold'
                              }} 
                            />
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {guild.description}
                        </Typography>
                      </Box>
                      {!guild.isJoined && (
                        <JoinGuildButton
                          size="small"
                          onClick={() => handleJoinGuild(guild.id)}
                        >
                          Join
                        </JoinGuildButton>
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
                        <RewardBadge 
                          size="small" 
                          icon={<TrophyIcon />}
                          label={guild.milestone.reward}
                        />
                      </Box>
                      <GuildProgress>
                        <LinearProgress 
                          variant="determinate" 
                          value={(guild.milestone.current / guild.milestone.target) * 100}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {guild.milestone.current}/{guild.milestone.target}
                        </Typography>
                      </GuildProgress>
                    </Box>
                  </CardContent>
                </GuildItem>
            ))}
          </div>
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
            <TextField
              autoFocus
              margin="dense"
              label="Guild Name"
              fullWidth
              variant="outlined"
              value={newGuildName}
              onChange={(e) => setNewGuildName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={newGuildDescription}
              onChange={(e) => setNewGuildDescription(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <CreateGuildButton onClick={handleCreateGuild}>
              Create Guild
            </CreateGuildButton>
          </DialogActions>
        </Dialog>
      </CardContent>
    </GuildCard>
  );
};

export default GuildSection;