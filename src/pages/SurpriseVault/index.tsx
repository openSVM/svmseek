import React from 'react';
import { Container, Alert, Box, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import VaultDashboard from './components/VaultDashboard';
import { GlassContainer } from '../../components/GlassContainer';
import { useWallet } from '../../utils/wallet';

const VaultContainer = styled(Container)(({ theme }) => ({
  maxWidth: '1200px',
  padding: theme.spacing(3),
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const WalletGuardContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
  textAlign: 'center',
  gap: theme.spacing(3),
}));

const SurpriseVault: React.FC = () => {
  const navigate = useNavigate();
  const wallet = useWallet();

  // Wallet authentication guard
  if (!wallet) {
    return (
      <VaultContainer>
        <GlassContainer>
          <WalletGuardContainer>
            <Typography variant="h4" component="h1" gutterBottom>
              🎰 Surprise Vault
            </Typography>
            <Alert severity="warning" sx={{ maxWidth: 500 }}>
              <Typography variant="h6" gutterBottom>
                Wallet Required
              </Typography>
              <Typography variant="body1" paragraph>
                You need to connect or create a wallet to access the Surprise Vault lottery features.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The vault provides lottery-style rewards for every trade, but requires wallet authentication for security.
              </Typography>
            </Alert>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate('/wallet')}
                sx={{
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  color: '#000',
                  fontWeight: 'bold',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #FFA500, #FFD700)',
                  },
                }}
              >
                Connect Wallet
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => navigate('/welcome')}
                sx={{
                  borderColor: '#FFD700',
                  color: '#FFD700',
                  '&:hover': {
                    borderColor: '#FFA500',
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                  },
                }}
              >
                Create Wallet
              </Button>
            </Box>
          </WalletGuardContainer>
        </GlassContainer>
      </VaultContainer>
    );
  }

  return (
    <VaultContainer>
      <GlassContainer>
        <VaultDashboard />
      </GlassContainer>
    </VaultContainer>
  );
};

export default SurpriseVault;