import React from 'react';
import { Fab, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Casino as CasinoIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const VaultFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
  color: '#000',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  boxShadow: '0 8px 32px rgba(255, 215, 0, 0.4)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  zIndex: 1000,
  '&:hover': {
    background: 'linear-gradient(135deg, #FFA500, #FFD700)',
    transform: 'translateY(-4px) scale(1.05)',
    boxShadow: '0 12px 40px rgba(255, 215, 0, 0.6)',
  },
  '&:active': {
    transform: 'translateY(-2px) scale(1.02)',
  },
  // Keyboard focus styling for accessibility
  '&:focus-visible': {
    outline: '3px solid rgba(255, 215, 0, 0.8)',
    outlineOffset: '2px',
    background: 'linear-gradient(135deg, #FFA500, #FFD700)',
    transform: 'translateY(-2px) scale(1.02)',
    boxShadow: '0 12px 40px rgba(255, 215, 0, 0.7)',
  },
  // Pulsing animation to draw attention
  animation: 'vault-pulse 3s ease-in-out infinite',
  '@keyframes vault-pulse': {
    '0%, 100%': {
      boxShadow: '0 8px 32px rgba(255, 215, 0, 0.4)',
    },
    '50%': {
      boxShadow: '0 8px 32px rgba(255, 215, 0, 0.7)',
    },
  },
  // Mobile responsiveness
  [theme.breakpoints.down('sm')]: {
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    width: 56,
    height: 56,
  },
}));

const VaultAccessButton: React.FC = () => {
  const navigate = useNavigate();

  const handleVaultClick = () => {
    navigate('/vault');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleVaultClick();
    }
  };

  return (
    <Tooltip 
      title="🎰 Surprise Vault - Lottery rewards for every trade!"
      placement="left"
      arrow
    >
      <VaultFab
        onClick={handleVaultClick}
        onKeyDown={handleKeyDown}
        aria-label="Access Surprise Vault - Lottery rewards for every trade"
        tabIndex={0}
        role="button"
      >
        <CasinoIcon sx={{ fontSize: 28 }} />
      </VaultFab>
    </Tooltip>
  );
};

export default VaultAccessButton;