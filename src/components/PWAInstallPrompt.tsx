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

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onInstall, onDismiss }) => {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Check if user has already dismissed the prompt
      const dismissed = localStorage.getItem('svmseek-pwa-prompt-dismissed');
      const lastDismissed = localStorage.getItem('svmseek-pwa-prompt-last-dismissed');
      
      // Only show if not dismissed or if it's been more than 7 days since last dismissal
      if (!dismissed || (lastDismissed && Date.now() - parseInt(lastDismissed) > 7 * 24 * 60 * 60 * 1000)) {
        setShow(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    
    if (!isStandalone && !isInWebAppiOS) {
      // Show prompt after a delay if not already installed
      const timer = setTimeout(() => {
        const dismissed = localStorage.getItem('svmseek-pwa-prompt-dismissed');
        const lastDismissed = localStorage.getItem('svmseek-pwa-prompt-last-dismissed');
        
        if (!dismissed || (lastDismissed && Date.now() - parseInt(lastDismissed) > 7 * 24 * 60 * 60 * 1000)) {
          if (!deferredPrompt) {
            setShow(true);
          }
        }
      }, 10000); // Show after 10 seconds

      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          localStorage.setItem('svmseek-pwa-installed', 'true');
          localStorage.removeItem('svmseek-pwa-prompt-dismissed');
          localStorage.removeItem('svmseek-pwa-prompt-last-dismissed');
          onInstall();
        } else {
          // User dismissed the native prompt - respect their choice
          localStorage.setItem('svmseek-pwa-prompt-dismissed', 'true');
          localStorage.setItem('svmseek-pwa-prompt-last-dismissed', Date.now().toString());
          onDismiss();
        }
      } catch (error) {
        console.warn('PWA install prompt failed:', error);
        onDismiss();
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
      localStorage.setItem('svmseek-pwa-manual-install-shown', 'true');
      onInstall();
      setShow(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('svmseek-pwa-prompt-dismissed', 'true');
    localStorage.setItem('svmseek-pwa-prompt-last-dismissed', Date.now().toString());
    onDismiss();
  };

  // Reset dismissal state if user manually clears storage or after timeout
  const resetDismissalState = () => {
    localStorage.removeItem('svmseek-pwa-prompt-dismissed');
    localStorage.removeItem('svmseek-pwa-prompt-last-dismissed');
    setShow(true);
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