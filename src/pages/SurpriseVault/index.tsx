import React from 'react';
import { Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import VaultDashboard from './components/VaultDashboard';
import { GlassContainer } from '../../components/GlassContainer';

const VaultContainer = styled(Container)(({ theme }) => ({
  maxWidth: '1200px',
  padding: theme.spacing(3),
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const SurpriseVault: React.FC = () => {
  return (
    <VaultContainer>
      <GlassContainer>
        <VaultDashboard />
      </GlassContainer>
    </VaultContainer>
  );
};

export default SurpriseVault;