import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Card, CardContent, Typography, Button, Grid, Box } from '@mui/material';
import { CheckCircle as CheckIcon } from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import { supportedLanguages } from '../i18n';
import { themes, ThemeName } from '../themes';

const OnboardingContainer = styled(Box)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  backdrop-filter: var(--glass-backdrop);
`;

const OnboardingCard = styled(Card)`
  max-width: 600px;
  width: 90vw;
  max-height: 85vh;
  background: var(--bg-glass) !important;
  backdrop-filter: var(--glass-backdrop) !important;
  border: 1px solid var(--border-glass) !important;
  box-shadow: var(--shadow-glass) !important;
  display: flex;
  flex-direction: column;
`;

const ScrollableContent = styled(Box)`
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  
  /* Enhanced scrollbar styling for better visibility */
  &::-webkit-scrollbar {
    width: 12px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: var(--radius-sm);
    margin: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--interactive-primary);
    border-radius: var(--radius-sm);
    border: 2px solid var(--bg-secondary);
    transition: background var(--animation-duration-normal) var(--animation-easing-default);
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: var(--interactive-hover);
  }
  
  /* Firefox scrollbar styling */
  scrollbar-width: auto;
  scrollbar-color: var(--interactive-primary) var(--bg-secondary);
`;

const StepHeader = styled(Box)`
  text-align: center;
  margin-bottom: 2rem;
`;

const StepTitle = styled(Typography)`
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const StepSubtitle = styled(Typography)`
  color: var(--text-secondary);
  font-size: 1rem;
`;

const OptionGrid = styled(Grid)`
  gap: 1rem;
`;

const OptionCard = styled(Card)<{ selected?: boolean }>`
  cursor: pointer;
  transition: all var(--animation-duration-normal) var(--animation-easing-default);
  border: 2px solid ${props => props.selected ? 'var(--border-focus)' : 'var(--border-primary)'} !important;
  background: var(--bg-secondary) !important;
  
  &:hover {
    transform: translateY(-2px);
    border-color: var(--border-focus) !important;
    box-shadow: var(--shadow-md) !important;
  }

  ${props => props.selected && `
    background: var(--bg-glass) !important;
    box-shadow: var(--shadow-lg) !important;
    transform: translateY(-1px);
  `}
`;

const OptionContent = styled(CardContent)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem !important;
  position: relative;
`;

const SelectedIcon = styled(CheckIcon)`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  color: var(--status-success);
  width: 24px;
  height: 24px;
`;

const LanguageFlag = styled(Box)`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
`;

const LanguageText = styled(Typography)`
  font-family: var(--font-primary) !important;
  font-weight: 600 !important;
  color: var(--text-primary) !important;
  line-height: 1.2 !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
  
  /* Ensure proper rendering for all Unicode ranges */
  font-feature-settings: "kern" 1, "liga" 1;
  -webkit-font-feature-settings: "kern" 1, "liga" 1;
  text-rendering: optimizeLegibility;
`;

const LanguageSubtext = styled(Typography)`
  font-family: var(--font-primary) !important;
  color: var(--text-secondary) !important;
  line-height: 1.2 !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
  
  /* Ensure proper rendering for all Unicode ranges */
  font-feature-settings: "kern" 1, "liga" 1;
  -webkit-font-feature-settings: "kern" 1, "liga" 1;
  text-rendering: optimizeLegibility;
`;

const ThemePreview = styled(Box)<{ theme: string }>`
  width: 60px;
  height: 40px;
  border-radius: var(--radius-md);
  margin-bottom: 0.5rem;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-primary);
  
  ${props => {
    const themeData = themes[props.theme as ThemeName];
    if (!themeData) return '';
    
    return `
      background: linear-gradient(135deg, 
        ${themeData.colors.background.primary} 0%, 
        ${themeData.colors.background.secondary} 50%, 
        ${themeData.colors.background.tertiary} 100%
      );
      
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: ${themeData.colors.interactive.primary};
        box-shadow: 0 0 8px ${themeData.colors.interactive.primary}66;
      }
    `;
  }}
`;

const ActionButtons = styled(Box)`
  display: flex;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--border-primary);
  background: var(--bg-secondary);
  gap: 1rem;
  flex-shrink: 0;
`;

const ActionButton = styled(Button)`
  min-width: 120px;
  padding: 0.75rem 2rem;
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all var(--animation-duration-normal) var(--animation-easing-default);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
`;

interface OnboardingSetupProps {
  onComplete: () => void;
}

const languageFlags: Record<string, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  ru: '🇷🇺',
  de: '🇩🇪',
  ja: '🇯🇵',
  el: '🇬🇷',
  zh: '🇨🇳',
  th: '🇹🇭',
  ko: '🇰🇷',
  sa: '🕉️',
  eo: '🏳️',
};

export const OnboardingSetup: React.FC<OnboardingSetupProps> = ({ onComplete }) => {
  const { i18n, t } = useTranslation();
  const { setTheme, availableThemes } = useTheme();
  const [step, setStep] = useState<'language' | 'theme'>('language');
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>('eink');

  // Check if user has already completed onboarding
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('onboarding-setup-complete');
    if (hasCompletedOnboarding) {
      onComplete();
    }
  }, [onComplete]);

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
  };

  const handleThemeSelect = (themeName: ThemeName) => {
    setSelectedTheme(themeName);
  };

  const handleNext = () => {
    if (step === 'language') {
      i18n.changeLanguage(selectedLanguage);
      setStep('theme');
    } else {
      // Complete onboarding
      setTheme(selectedTheme);
      localStorage.setItem('onboarding-setup-complete', 'true');
      onComplete();
    }
  };

  const handleBack = () => {
    if (step === 'theme') {
      setStep('language');
    }
  };

  const renderLanguageStep = () => (
    <ScrollableContent data-testid="language-selection-scrollable">
      <StepHeader>
        <StepTitle variant="h4">
          {t('onboarding.languageSelection.title')}
        </StepTitle>
        <StepSubtitle variant="body1">
          {t('onboarding.languageSelection.subtitle')}
        </StepSubtitle>
      </StepHeader>

      <OptionGrid container spacing={2}>
        {supportedLanguages.map((language) => (
          <Grid item xs={6} sm={4} key={language.code}>
            <OptionCard
              selected={selectedLanguage === language.code}
              onClick={() => handleLanguageSelect(language.code)}
            >
              <OptionContent>
                {selectedLanguage === language.code && <SelectedIcon />}
                <LanguageFlag>
                  {languageFlags[language.code] || '🌐'}
                </LanguageFlag>
                <LanguageText variant="subtitle2">
                  {language.nativeName}
                </LanguageText>
                <LanguageSubtext variant="caption">
                  {language.name}
                </LanguageSubtext>
              </OptionContent>
            </OptionCard>
          </Grid>
        ))}
      </OptionGrid>
    </ScrollableContent>
  );

  const renderThemeStep = () => (
    <ScrollableContent data-testid="theme-selection-scrollable">
      <StepHeader>
        <StepTitle variant="h4">
          {t('onboarding.themeSelection.title')}
        </StepTitle>
        <StepSubtitle variant="body1">
          {t('onboarding.themeSelection.subtitle')}
        </StepSubtitle>
      </StepHeader>

      <OptionGrid container spacing={2}>
        {Object.entries(availableThemes).map(([themeKey, theme]) => (
          <Grid item xs={6} sm={4} key={themeKey}>
            <OptionCard
              selected={selectedTheme === themeKey}
              onClick={() => handleThemeSelect(themeKey as ThemeName)}
            >
              <OptionContent>
                {selectedTheme === themeKey && <SelectedIcon />}
                <ThemePreview theme={themeKey} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t(`onboarding.themeSelection.themes.${themeKey}`, theme.displayName)}
                </Typography>
              </OptionContent>
            </OptionCard>
          </Grid>
        ))}
      </OptionGrid>
    </ScrollableContent>
  );

  return (
    <OnboardingContainer>
      <OnboardingCard>
        {step === 'language' ? renderLanguageStep() : renderThemeStep()}
        
        <ActionButtons>
          <ActionButton
            variant="outlined"
            onClick={handleBack}
            disabled={step === 'language'}
            sx={{ 
              opacity: step === 'language' ? 0 : 1,
              visibility: step === 'language' ? 'hidden' : 'visible'
            }}
          >
            {t('common.back')}
          </ActionButton>
          
          <ActionButton
            variant="contained"
            onClick={handleNext}
            disabled={
              (step === 'language' && !selectedLanguage) ||
              (step === 'theme' && !selectedTheme)
            }
          >
            {step === 'theme' ? t('common.confirm') : t('common.next')}
          </ActionButton>
        </ActionButtons>
      </OnboardingCard>
    </OnboardingContainer>
  );
};

export default OnboardingSetup;