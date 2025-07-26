import React, { lazy, Suspense, useMemo } from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import './i18n'; // Initialize i18n
import LoadingIndicator from './components/LoadingIndicator';
import NavigationFrame from './components/Navbar/NavigationFrame';
import SnackbarProvider from './components/SnackbarProvider';
import OnboardingTutorial from './components/OnboardingTutorial';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { ConnectedWalletsProvider } from './utils/connected-wallets';
import { ConnectionProvider } from './utils/connection';
import { TokenRegistryProvider } from './utils/tokens/names';
import { isExtension } from './utils/utils';
import { useWallet, WalletProvider } from './utils/wallet';
import { useHasLockedMnemonicAndSeed } from './utils/wallet-seed';
import useOnboarding from './utils/useOnboarding';
// Import OnboardingSetup component synchronously since it's needed immediately
import { OnboardingSetup } from './components/OnboardingSetup';
// import { MASTER_BUILD } from './utils/config';
// import { MigrationToNewUrlPopup } from './components/MigrationToNewUrlPopup';

const ConnectPopup = lazy(() => import('./routes/ConnectPopup'));
const WelcomeBackPage = lazy(() => import('./routes/WelcomeBack'));  
const Wallet = lazy(() => import('./routes/WalletRouter'));
const RestorePage = lazy(() => import('./routes/RestoreWallet'));
const WelcomePage = lazy(() => import('./routes/Welcome'));
const CreateWalletPage = lazy(() => import('./routes/CreateWallet'));

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
      <OnboardingSetup onComplete={handleOnboardingSetupComplete} />
    );
  }

  return (
    <>
      {/* Onboarding Tutorial */}
      <OnboardingTutorial
        isOpen={showOnboarding}
        onClose={completeOnboarding}
      />
      
      {/* PWA Install Prompt */}
      {showPWAPrompt && (
        <PWAInstallPrompt
          onInstall={handlePWAInstall}
          onDismiss={dismissPWAPrompt}
        />
      )}
      
      {/* {!MASTER_BUILD && !LOCAL_BUILD && (
        <DevUrlPopup
          open={isDevUrlPopupOpen}
          close={() => openDevUrlPopup(false)}
        />
      )} */}

      <Switch>
        <Route 
          path="/wallet" 
          render={(routeProps) => (
            <ErrorBoundary context="wallet interface">
              <Wallet {...routeProps} />
            </ErrorBoundary>
          )} 
        />
        <Route 
          path="/restore_wallet" 
          render={(routeProps) => (
            <ErrorBoundary context="wallet restoration">
              <RestorePage {...routeProps} />
            </ErrorBoundary>
          )} 
        />
        <Route 
          path="/welcome" 
          render={(routeProps) => (
            <ErrorBoundary context="welcome page">
              <WelcomePage {...routeProps} />
            </ErrorBoundary>
          )} 
        />
        <Route 
          path="/create_wallet" 
          render={(routeProps) => (
            <ErrorBoundary context="wallet creation">
              <CreateWalletPage {...routeProps} />
            </ErrorBoundary>
          )} 
        />
        <Route 
          exact 
          path="/welcome_back" 
          render={(routeProps) => (
            <ErrorBoundary context="welcome back page">
              <WelcomeBackPage {...routeProps} />
            </ErrorBoundary>
          )} 
        />
        <Route 
          path="/connect_popup" 
          render={(routeProps) => (
            <ErrorBoundary context="wallet connection">
              <ConnectPopup {...routeProps} />
            </ErrorBoundary>
          )} 
        />

        {/* popup if connecting from dex UI */}
        {/* TODO: Migrate to React Router v6 - Replace Redirect with Navigate component */}
        {window.opener && !!wallet && <Redirect from="/" to="/connect_popup" />}

        {/* if wallet exists - for case when we'll have unlocked wallet */}
        {/* TODO: Migrate to React Router v6 - Replace Redirect with Navigate component */}
        {!!wallet && <Redirect from="/" to="/wallet" />}

        {/* if have mnemonic in localstorage - login, otherwise - restore/import/create */}
        {/* TODO: Migrate to React Router v6 - Replace Redirect with Navigate component */}
        {hasLockedMnemonicAndSeed ? (
          <Redirect from="/" to="/welcome_back" />
        ) : (
          <Redirect from="/" to="/welcome" />
        )}
      </Switch>
    </>
  );
};
