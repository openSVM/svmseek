import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CardContent,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  PersonAdd as PersonAddIcon,
  ContentCopy as CopyIcon,
  Share as ShareIcon,
  Twitter as TwitterIcon,
  Wallet as WalletIcon,
} from '@mui/icons-material';
import VaultService from '../services/VaultService';
import { useVaultWallet } from '../hooks/useVaultWallet';
import { useTruncateAddress } from '../utils';
import { 
  GlassCard, 
  VaultTextField, 
  SecondaryButton,
  SectionHeader,
  StatusChip 
} from './shared/StyledComponents';



const InviteSection: React.FC = () => {
  const [inviteLink, setInviteLink] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  const { walletAddress, isConnected, connectWallet, isConnecting } = useVaultWallet();
  const truncateAddress = useTruncateAddress();
  const vaultService = VaultService.getInstance();

  useEffect(() => {
    // Generate invite link for current user
    if (walletAddress) {
      const link = vaultService.generateReferralLink(walletAddress);
      setInviteLink(link);
    } else {
      setInviteLink('');
    }
  }, [walletAddress, vaultService]);

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
    <GlassCard>
      <CardContent>
        <SectionHeader>
          <Typography variant="h6">
            <PersonAddIcon sx={{ color: '#FFD700' }} />
            Invite Friends & Earn More!
          </Typography>
        </SectionHeader>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Share your invite link and earn bonus lottery tickets when your friends start trading!
        </Typography>

        {/* Wallet Connection Status */}
        <Box mb={3}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <WalletIcon sx={{ color: isConnected ? '#4CAF50' : '#FFD700' }} />
            <Typography variant="subtitle2">
              Wallet Status:
            </Typography>
            <StatusChip 
              status={isConnected ? 'success' : 'warning'}
              label={isConnected ? 'Connected' : 'Mock Address'}
              size="small"
            />
          </Box>
          
          {walletAddress && (
            <Box mb={2}>
              <Typography variant="caption" color="text.secondary">
                Your Address: {truncateAddress(walletAddress)}
              </Typography>
            </Box>
          )}
          
          {!isConnected && (
            <SecondaryButton
              size="small"
              startIcon={<WalletIcon />}
              onClick={connectWallet}
              disabled={isConnecting}
              sx={{ mb: 2 }}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </SecondaryButton>
          )}
        </Box>

        {/* Benefits */}
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Referral Benefits:
          </Typography>
          <Box>
            <StatusChip status="info" size="small" label="Bonus Lottery Tickets" sx={{ m: 0.5 }} />
            <StatusChip status="success" size="small" label="Fee Share Rewards" sx={{ m: 0.5 }} />
            <StatusChip status="warning" size="small" label="Streak Multipliers" sx={{ m: 0.5 }} />
            <StatusChip status="error" size="small" label="Exclusive NFT Badges" sx={{ m: 0.5 }} />
          </Box>
        </Box>

        {/* Invite Link */}
        {walletAddress && (
          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom>
              Your Invite Link:
            </Typography>
            <VaultTextField
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
        )}

        {/* Share Buttons */}
        {walletAddress && (
          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" flexDirection="row" gap={2} flexWrap="wrap">
              <SecondaryButton
                sx={{ flex: 1, minWidth: 120 }}
                startIcon={<CopyIcon />}
                onClick={handleCopyLink}
              >
                Copy Link
              </SecondaryButton>
              <SecondaryButton
                sx={{ 
                  flex: 1, 
                  minWidth: 120,
                  background: 'linear-gradient(135deg, #1DA1F2, #0D8BD9)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0D8BD9, #0A7BC2)',
                  },
                }}
                startIcon={<TwitterIcon />}
                onClick={handleShareOnTwitter}
              >
                Share on X
              </SecondaryButton>
              <SecondaryButton
                sx={{ 
                  flex: 1, 
                  minWidth: 120,
                  background: 'linear-gradient(135deg, #9B59B6, #8E44AD)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8E44AD, #7D3C98)',
                  },
                }}
                startIcon={<ShareIcon />}
                onClick={handleGenericShare}
              >
                Share
              </SecondaryButton>
            </Box>
          </Box>
        )}

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
    </GlassCard>
  );
};

export default InviteSection;