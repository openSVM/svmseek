import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Button, IconButton, Typography, Box } from '@mui/material';
import { Close, ArrowForward, ArrowBack, Security, AccountBalanceWallet, SwapHoriz, Chat } from '@mui/icons-material';
import { GlassContainer } from './GlassContainer';

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -60%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
`;

const OnboardingOverlay = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 10000;
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  animation: ${slideIn} 0.3s ease-out;
`;

const OnboardingContent = styled(GlassContainer)`
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  padding: 2rem;
  animation: ${slideIn} 0.3s ease-out;
`;

const CloseButton = styled(IconButton)`
  position: absolute !important;
  top: 1rem;
  right: 1rem;
  z-index: 1;
`;

const StepIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
  font-size: 24px;
`;

const NavigationButtons = styled(Box)`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  gap: 1rem;
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin-bottom: 2rem;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    width: ${props => props.progress}%;
    height: 100%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transition: width 0.3s ease;
  }
`;

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const tutorialSteps = [
  {
    icon: <Security />,
    title: 'Welcome to SVMSeek Wallet',
    content: 'Your secure gateway to the Solana ecosystem. SVMSeek provides industry-leading security for your digital assets with military-grade encryption and non-custodial architecture.'
  },
  {
    icon: <AccountBalanceWallet />,
    title: 'Wallet Management',
    content: 'Create or import your wallet using a secure seed phrase. Your private keys are stored locally and never leave your device. Connect hardware wallets for additional security.'
  },
  {
    icon: <SwapHoriz />,
    title: 'Token Management',
    content: 'Send, receive, and manage SPL tokens with ease. View your portfolio, track balances, and execute transactions with our intuitive interface.'
  },
  {
    icon: <Chat />,
    title: 'AI-Powered Assistant',
    content: 'Get help with DeFi strategies, market insights, and wallet operations through our integrated AI chat. Supports multiple AI providers for comprehensive assistance.'
  }
];

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  return (
    <OnboardingOverlay show={isOpen}>
      <OnboardingContent>
        <CloseButton onClick={onClose}>
          <Close />
        </CloseButton>
        
        <ProgressBar progress={progress} />
        
        <StepIcon>
          {tutorialSteps[currentStep]?.icon}
        </StepIcon>
        
        <Typography variant="h4" align="center" gutterBottom>
          {tutorialSteps[currentStep]?.title}
        </Typography>
        
        <Typography variant="body1" align="center" paragraph>
          {tutorialSteps[currentStep]?.content}
        </Typography>
        
        <Box textAlign="center" mb={2}>
          <Typography variant="body2" color="textSecondary">
            Step {currentStep + 1} of {tutorialSteps.length}
          </Typography>
        </Box>
        
        <NavigationButtons>
          <Button
            onClick={handleBack}
            disabled={currentStep === 0}
            startIcon={<ArrowBack />}
            variant="outlined"
          >
            Back
          </Button>
          
          <Button
            onClick={handleNext}
            endIcon={currentStep === tutorialSteps.length - 1 ? null : <ArrowForward />}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
              }
            }}
          >
            {currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
          </Button>
        </NavigationButtons>
      </OnboardingContent>
    </OnboardingOverlay>
  );
};

export default OnboardingTutorial;