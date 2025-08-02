import React, { lazy, Suspense, useMemo } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './i18n'; // Initialize i18n
import LoadingIndicator from './components/LoadingIndicator';
import NavigationFrame from './components/Navbar/NavigationFrame';
import SnackbarProvider from './components/SnackbarProvider';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { ConnectedWalletsProvider } from './utils/connected-wallets';
import { ConnectionProvider } from './utils/connection';
import { TokenRegistryProvider } from './utils/tokens/names';
import { isExtension } from './utils/utils';
import { useWallet, WalletProvider } from './utils/wallet';
import { useHasLockedMnemonicAndSeed } from './utils/wallet-seed';
import useOnboarding from './utils/useOnboarding';

// Lazy load all route components and heavy dependencies
const ConnectPopup = lazy(() => import('./routes/ConnectPopup'));
const WelcomeBackPage = lazy(() => import('./routes/WelcomeBack'));  
const Wallet = lazy(() => import('./routes/WalletRouter'));
const RestorePage = lazy(() => import('./routes/RestoreWallet'));
const WelcomePage = lazy(() => import('./routes/Welcome'));
const CreateWalletPage = lazy(() => import('./routes/CreateWallet'));
const HelpPage = lazy(() => import('./routes/Help'));
const SurpriseVault = lazy(() => import('./pages/SurpriseVault'));

// Lazy load heavy components
const OnboardingTutorial = lazy(() => import('./components/OnboardingTutorial'));
const PWAInstallPrompt = lazy(() => import('./components/PWAInstallPrompt'));
const OnboardingSetup = lazy(() => import('./components/OnboardingSetup'));

interface CustomPalette {
  text: {
    grey: string;
  };
  border: {
    main: string;
    new: string;
  };
  grey: {
    additional: string;
    border: string;
    light: string;
    dark: string;
    soft: string;
    background: string;
  };
  dark: {
    main: string;
    background: string;
  };
  blue: {
    serum: string;
    new: string;
  };
  white: {
    main: string;
    background: string;
  };
  red: {
    main: string;
  };
  green: {
    main: string;
    light: string;
  };
  orange: {
    dark: string;
    light: string;
  };
}

declare module '@mui/material/styles' {
  interface Theme {
    customPalette: CustomPalette;
  }

  interface ThemeOptions {
    customPalette?: CustomPalette;
  }
}

export default function App() {
  // Disallow rendering inside an iframe to prevent clickjacking.
  if (window.self !== window.top) {
    return null;
  }

  let appElement = (
    <ErrorBoundary context="navigation">
      <NavigationFrame>
        <ErrorBoundary context="application routes">
          <Pages />
        </ErrorBoundary>
      </NavigationFrame>
    </ErrorBoundary>
  );

  if (isExtension) {
    appElement = (
      <ConnectedWalletsProvider>{appElement}</ConnectedWalletsProvider>
    );
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingIndicator />}>
        <ThemeProvider>
          <ConnectionProvider>
            <TokenRegistryProvider>
              <SnackbarProvider maxSnack={5} autoHideDuration={3000}>
                <WalletProvider>{appElement}</WalletProvider>
              </SnackbarProvider>
            </TokenRegistryProvider>
          </ConnectionProvider>
        </ThemeProvider>
      </Suspense>
    </BrowserRouter>
  );
}

const Pages = () => {
  const wallet = useWallet();
  const {
    showOnboarding,
    showPWAPrompt,
    completeOnboarding,
    dismissPWAPrompt,
    handlePWAInstall,
  } = useOnboarding();
  
  // Check if user needs to complete initial setup (language/theme selection)
  const [showOnboardingSetup, setShowOnboardingSetup] = React.useState(() => {
    return !localStorage.getItem('onboarding-setup-complete');
  });

  const handleOnboardingSetupComplete = () => {
    setShowOnboardingSetup(false);
  };
  // const [isDevUrlPopupOpen, openDevUrlPopup] = useState(true);

  // const [isMigrationToNewUrlPopupOpen, openMigrationToNewUrlPopup] = useState(
  //   true,
  // );

  const [hasLockedMnemonicAndSeed] = useHasLockedMnemonicAndSeed();
  useMemo(() => {
    let params = new URLSearchParams(window.location.hash.slice(1));
    const origin = params.get('origin');
    const hash = window.location.hash;

    if (origin) {
      sessionStorage.setItem('origin', origin);
    } else {
      sessionStorage.removeItem('origin');
    }

    if (hash) {
      sessionStorage.setItem('hash', hash);
    } else {
      sessionStorage.removeItem('hash');
    }
  }, []);

  // Show onboarding setup first if not completed
  if (showOnboardingSetup) {
    return (
      <Suspense fallback={<LoadingIndicator />}>
        <OnboardingSetup onComplete={handleOnboardingSetupComplete} />
      </Suspense>
    );
  }

  return (
    <>
      {/* Onboarding Tutorial */}
      <Suspense fallback={null}>
        <OnboardingTutorial
          isOpen={showOnboarding}
          onClose={completeOnboarding}
        />
      </Suspense>
      
      {/* PWA Install Prompt */}
      {showPWAPrompt && (
        <Suspense fallback={null}>
          <PWAInstallPrompt
            onInstall={handlePWAInstall}
            onDismiss={dismissPWAPrompt}
          />
        </Suspense>
      )}
      
      {/* {!MASTER_BUILD && !LOCAL_BUILD && (
        <DevUrlPopup
          open={isDevUrlPopupOpen}
          close={() => openDevUrlPopup(false)}
        />
      )} */}

      <Routes>
        <Route 
          path="/wallet/*" 
          element={
            <ErrorBoundary context="wallet interface">
              <Wallet />
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/restore_wallet" 
          element={
            <ErrorBoundary context="wallet restoration">
              <RestorePage />
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/welcome" 
          element={
            <ErrorBoundary context="welcome page">
              <WelcomePage />
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/create_wallet" 
          element={
            <ErrorBoundary context="wallet creation">
              <CreateWalletPage />
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/welcome_back" 
          element={
            <ErrorBoundary context="welcome back page">
              <WelcomeBackPage />
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/connect_popup" 
          element={
            <ErrorBoundary context="wallet connection">
              <ConnectPopup />
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/help" 
          element={
            <ErrorBoundary context="help center">
              <HelpPage />
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/vault" 
          element={
            <ErrorBoundary context="surprise vault">
              <SurpriseVault />
            </ErrorBoundary>
          } 
        />

        {/* popup if connecting from dex UI */}
        {window.opener && !!wallet && <Route path="/" element={<Navigate to="/connect_popup" replace />} />}

        {/* if wallet exists - for case when we'll have unlocked wallet */}
        {!!wallet && <Route path="/" element={<Navigate to="/wallet" replace />} />}

        {/* if have mnemonic in localstorage - login, otherwise - restore/import/create */}
        <Route 
          path="/" 
          element={
            hasLockedMnemonicAndSeed ? (
              <Navigate to="/welcome_back" replace />
            ) : (
              <Navigate to="/welcome" replace />
            )
          }
        />
      </Routes>
    </>
  );
};
