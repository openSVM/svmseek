import { useState, useEffect } from 'react';

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPWAPrompt, setShowPWAPrompt] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('svmseek-onboarding-completed');

    if (!hasCompletedOnboarding) {
      // Show onboarding after a short delay
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      // Check for PWA install prompt
      const hasSeenPWAPrompt = localStorage.getItem('svmseek-pwa-prompt-seen');
      if (!hasSeenPWAPrompt) {
        setShowPWAPrompt(true);
      }
    }
  }, []);

  const completeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('svmseek-onboarding-completed', 'true');

    // Show PWA prompt after onboarding
    setTimeout(() => {
      const hasSeenPWAPrompt = localStorage.getItem('svmseek-pwa-prompt-seen');
      if (!hasSeenPWAPrompt) {
        setShowPWAPrompt(true);
      }
    }, 2000);
  };

  const dismissPWAPrompt = () => {
    setShowPWAPrompt(false);
    localStorage.setItem('svmseek-pwa-prompt-seen', 'true');
  };

  const handlePWAInstall = () => {
    setShowPWAPrompt(false);
    localStorage.setItem('svmseek-pwa-prompt-seen', 'true');
    localStorage.setItem('svmseek-pwa-installed', 'true');
  };

  const resetOnboarding = () => {
    localStorage.removeItem('svmseek-onboarding-completed');
    localStorage.removeItem('svmseek-pwa-prompt-seen');
    localStorage.removeItem('svmseek-pwa-installed');
    setShowOnboarding(true);
    setShowPWAPrompt(false);
  };

  return {
    showOnboarding,
    showPWAPrompt,
    completeOnboarding,
    dismissPWAPrompt,
    handlePWAInstall,
    resetOnboarding,
  };
};

export default useOnboarding;
