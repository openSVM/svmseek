import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField,
  Card,
  CardContent,
  IconButton,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  PersonAdd as PersonAddIcon,
  ContentCopy as CopyIcon,
  Share as ShareIcon,
  Twitter as TwitterIcon,
} from '@mui/icons-material';

const InviteCard = styled(Card)(({ theme }) => ({
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

const InviteLink = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.08)',
    },
    '&.Mui-focused': {
      background: 'rgba(255, 255, 255, 0.08)',
    },
  },
  '& .MuiOutlinedInput-input': {
    color: '#FFD700',
    fontFamily: 'monospace',
    fontSize: '0.9rem',
  },
}));

const BenefitChip = styled(Chip)(({ theme }) => ({
  background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
  color: '#fff',
  fontWeight: 'bold',
  margin: theme.spacing(0.5),
}));

const InviteSection: React.FC = () => {
  const [inviteLink] = useState('https://svmseek.com/vault?ref=0xYourWallet123');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setSnackbar({ open: true, message: 'Invite link copied to clipboard!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to copy link', severity: 'error' });
    }
  };

  const handleShareOnTwitter = () => {
    const tweetText = encodeURIComponent(
      '🎰 Join the SVMSeek Surprise Vault! Get lottery-style rewards for every trade! ' +
      'Use my invite link and we both get bonus tickets! 🎁'
    );
    const tweetUrl = encodeURIComponent(inviteLink);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`, '_blank');
  };

  const handleGenericShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SVMSeek Surprise Vault',
          text: 'Join the lottery-style trading rewards!',
          url: inviteLink,
        });
      } catch (error) {
        handleCopyLink(); // Fallback to copy
      }
    } else {
      handleCopyLink(); // Fallback to copy
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <InviteCard>
      <CardContent>
        <SectionHeader>
          <Typography variant="h6">
            <PersonAddIcon sx={{ color: '#FFD700' }} />
            Invite Friends & Earn More!
          </Typography>
        </SectionHeader>

        <Typography variant="body2" color="text.secondary" paragraph>
          Share your invite link and earn bonus lottery tickets when your friends start trading!
        </Typography>

        {/* Benefits */}
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Referral Benefits:
          </Typography>
          <Box>
            <BenefitChip size="small" label="Bonus Lottery Tickets" />
            <BenefitChip size="small" label="Fee Share Rewards" />
            <BenefitChip size="small" label="Streak Multipliers" />
            <BenefitChip size="small" label="Exclusive NFT Badges" />
          </Box>
        </Box>

        {/* Invite Link */}
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Your Invite Link:
          </Typography>
          <InviteLink
            fullWidth
            value={inviteLink}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <IconButton onClick={handleCopyLink} sx={{ color: '#FFD700' }}>
                  <CopyIcon />
                </IconButton>
              ),
            }}
          />
        </Box>

        {/* Share Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
            <Button
              sx={{ 
                flex: 1, 
                minWidth: 120,
                background: 'linear-gradient(135deg, #4ECDC4, #44B7B8)',
                color: '#fff',
                fontWeight: 'bold',
                borderRadius: 3,
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #44B7B8, #3BAEA3)',
                  transform: 'translateY(-2px)',
                },
              }}
              startIcon={<CopyIcon />}
              onClick={handleCopyLink}
            >
              Copy Link
            </Button>
            <Button
              sx={{ 
                flex: 1, 
                minWidth: 120,
                background: 'linear-gradient(135deg, #1DA1F2, #0D8BD9)',
                color: '#fff',
                fontWeight: 'bold',
                borderRadius: 3,
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0D8BD9, #0A7BC2)',
                  transform: 'translateY(-2px)',
                },
              }}
              startIcon={<TwitterIcon />}
              onClick={handleShareOnTwitter}
            >
              Share on X
            </Button>
            <Button
              sx={{ 
                flex: 1, 
                minWidth: 120,
                background: 'linear-gradient(135deg, #9B59B6, #8E44AD)',
                color: '#fff',
                fontWeight: 'bold',
                borderRadius: 3,
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #8E44AD, #7D3C98)',
                  transform: 'translateY(-2px)',
                },
              }}
              startIcon={<ShareIcon />}
              onClick={handleGenericShare}
            >
              Share
            </Button>
          </div>
        </div>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </CardContent>
    </InviteCard>
  );
};

export default InviteSection;