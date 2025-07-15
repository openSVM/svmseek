import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, Typography, IconButton, Box } from '@mui/material';
import { Close, GetApp, Smartphone } from '@mui/icons-material';
import { GlassContainer } from './GlassContainer';

const PWAPrompt = styled(GlassContainer)`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 320px;
  padding: 1.5rem;
  z-index: 1000;
  transform: translateY(${props => props.show ? '0' : '100px'});
  opacity: ${props => props.show ? '1' : '0'};
  transition: all 0.3s ease;
  pointer-events: ${props => props.show ? 'auto' : 'none'};
  
  @media (max-width: 480px) {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
    width: auto;
  }
`;

const CloseButton = styled(IconButton)`
  position: absolute !important;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.5rem !important;
`;

const InstallIcon = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin: 0 auto 1rem;
`;

interface PWAInstallPromptProps {
  onInstall: () => void;
  onDismiss: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onInstall, onDismiss }) => {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Check if user has already dismissed the prompt
      const dismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!dismissed) {
        setShow(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    
    if (!isStandalone && !isInWebAppiOS) {
      // Show prompt after a delay if not already installed
      const timer = setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-prompt-dismissed');
        if (!dismissed && !deferredPrompt) {
          setShow(true);
        }
      }, 10000); // Show after 10 seconds

      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        onInstall();
      }
      
      setDeferredPrompt(null);
      setShow(false);
    } else {
      // Fallback for browsers that don't support the API
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        alert('To install this app on your iOS device, tap the Share button and then "Add to Home Screen".');
      } else {
        alert('To install this app, look for the install option in your browser menu.');
      }
      onInstall();
      setShow(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
    onDismiss();
  };

  return (
    <PWAPrompt show={show}>
      <CloseButton onClick={handleDismiss}>
        <Close fontSize="small" />
      </CloseButton>
      
      <InstallIcon>
        <GetApp />
      </InstallIcon>
      
      <Typography variant="h6" align="center" gutterBottom>
        Install SVMSeek Wallet
      </Typography>
      
      <Typography variant="body2" align="center" paragraph>
        Get the full app experience with offline access and faster loading
      </Typography>
      
      <Box display="flex" gap={1} mt={2}>
        <Button
          variant="outlined"
          size="small"
          onClick={handleDismiss}
          fullWidth
        >
          Not Now
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={handleInstall}
          fullWidth
          startIcon={<Smartphone />}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
            }
          }}
        >
          Install
        </Button>
      </Box>
    </PWAPrompt>
  );
};

export default PWAInstallPrompt;