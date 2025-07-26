import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Helmet from 'react-helmet';
import { Box, Grid } from '@mui/material';
import { Add as AddIcon, Restore as RestoreIcon } from '@mui/icons-material';
import styled from 'styled-components';
import {
  isExtension,
  openExtensionInNewTab,
} from '../../utils/utils';
import { 
  InteractiveCard, 
  DisplayTitle, 
  SecondaryText,
  FlexContainer
} from '../../components/GlassComponents';
import Logo from '../../components/Logo';

const WelcomeContainer = styled(Box)`
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at 30% 20%, 
      var(--interactive-primary)15 0%, 
      transparent 50%
    ),
    radial-gradient(
      circle at 70% 80%, 
      var(--interactive-secondary)15 0%, 
      transparent 50%
    );
    pointer-events: none;
  }
`;

const WelcomeContent = styled(Box)`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 800px;
`;

const LogoContainer = styled(FlexContainer)`
  margin-bottom: 3rem;
`;

const WelcomeHeader = styled(Box)`
  text-align: center;
  margin-bottom: 3rem;
`;

const OptionsGrid = styled(Grid)`
  gap: 2rem;
`;

const OptionCard = styled(InteractiveCard)`
  height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  transition: all var(--animation-duration-normal) var(--animation-easing-bounce);
  text-decoration: none;
  color: inherit;
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    
    .option-icon {
      transform: scale(1.2);
      color: var(--interactive-primary);
    }
  }
  
  @media (max-width: 768px) {
    height: 220px;
    padding: 1.5rem;
  }
`;

const OptionIcon = styled(Box)`
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  background: var(--bg-glass);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  border: 2px solid var(--border-glass);
  transition: all var(--animation-duration-normal) var(--animation-easing-default);
  
  .MuiSvgIcon-root {
    font-size: 2.5rem;
    color: var(--text-accent);
    transition: all var(--animation-duration-normal) var(--animation-easing-default);
  }
  
  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    
    .MuiSvgIcon-root {
      font-size: 2rem;
    }
  }
`;

const OptionTitle = styled(DisplayTitle)`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const OptionDescription = styled(SecondaryText)`
  font-size: 1rem;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

export const WelcomePage = () => {
  const { t } = useTranslation();
  const hash = sessionStorage.getItem('hash');

  const CreateWalletOption = () => (
    <OptionCard>
      <OptionIcon className="option-icon">
        <AddIcon />
      </OptionIcon>
      <OptionTitle variant="h5">
        {t('wallet.createWallet.title')}
      </OptionTitle>
      <OptionDescription variant="body1">
        {t('wallet.createWallet.description')}
      </OptionDescription>
    </OptionCard>
  );

  const RestoreWalletOption = () => (
    <OptionCard>
      <OptionIcon className="option-icon">
        <RestoreIcon />
      </OptionIcon>
      <OptionTitle variant="h5">
        {t('wallet.restoreWallet.title')}
      </OptionTitle>
      <OptionDescription variant="body1">
        {t('wallet.restoreWallet.description')}
      </OptionDescription>
    </OptionCard>
  );

  const renderCreateWalletLink = () => {
    if (window.opener) {
      return (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={'http://svmseek.com/create_wallet'}
          onClick={() => {
            window.close();
          }}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <CreateWalletOption />
        </a>
      );
    } else if (isExtension && hash !== '#from_extension') {
      return (
        <Box onClick={openExtensionInNewTab} sx={{ cursor: 'pointer' }}>
          <CreateWalletOption />
        </Box>
      );
    } else {
      return (
        <Link to="/create_wallet" style={{ textDecoration: 'none', color: 'inherit' }}>
          <CreateWalletOption />
        </Link>
      );
    }
  };

  return (
    <WelcomeContainer>
      <Helmet>
        <title>{t('wallet.title')} | {t('common.welcome')}</title>
      </Helmet>
      
      <WelcomeContent>
        {isExtension && (
          <LogoContainer justify="center">
            <Logo />
          </LogoContainer>
        )}
        
        <WelcomeHeader>
          <DisplayTitle variant="h2" sx={{ 
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            marginBottom: '1rem',
            background: `linear-gradient(135deg, var(--text-primary), var(--text-accent))`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {t('common.welcome')}
          </DisplayTitle>
          <SecondaryText variant="h6" sx={{ 
            fontSize: { xs: '1rem', sm: '1.125rem' },
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            {t('wallet.subtitle')}
          </SecondaryText>
        </WelcomeHeader>

        <OptionsGrid container spacing={0} justifyContent="center">
          <Grid item xs={12} sm={6} md={5}>
            {renderCreateWalletLink()}
          </Grid>
          
          <Grid item xs={12} sm={6} md={5}>
            <Link to="/restore_wallet" style={{ textDecoration: 'none', color: 'inherit' }}>
              <RestoreWalletOption />
            </Link>
          </Grid>
        </OptionsGrid>
      </WelcomeContent>
    </WelcomeContainer>
  );
};