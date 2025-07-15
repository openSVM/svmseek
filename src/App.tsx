import React, { lazy, Suspense, useMemo } from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import LoadingIndicator from './components/LoadingIndicator';
import NavigationFrame from './components/Navbar/NavigationFrame';
import SnackbarProvider from './components/SnackbarProvider';
import OnboardingTutorial from './components/OnboardingTutorial';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { ThemeProvider } from './context/ThemeContext';
import { ConnectedWalletsProvider } from './utils/connected-wallets';
import { ConnectionProvider } from './utils/connection';
import { TokenRegistryProvider } from './utils/tokens/names';
import { isExtension } from './utils/utils';
import { useWallet, WalletProvider } from './utils/wallet';
import { useHasLockedMnemonicAndSeed } from './utils/wallet-seed';
import useOnboarding from './utils/useOnboarding';
// import { MASTER_BUILD } from './utils/config';
// import { MigrationToNewUrlPopup } from './components/MigrationToNewUrlPopup';

const ConnectPopup = lazy(() => import('./routes/ConnectPopup'));
const WelcomeBackPage = lazy(() => import('./routes/WelcomeBack'));
const Wallet = lazy(() => import('./routes/WalletRouter'));

// const ConnectingWallet = lazy(() => import('./routes/ConnectingWallet'));
// const Wallet = lazy(() => import('./routes/WalletRouter'));
const RestorePage = lazy(() => import('./routes/RestoreWallet'));
const WelcomePage = lazy(() => import('./routes/Welcome'));
const CreateWalletPage = lazy(() => import('./routes/CreateWallet'));
// const ImportWalletPage = lazy(() => import('./routes/ImportWallet'));
// const WelcomeBackPage = lazy(() => import('./routes/WelcomeBack'));

declare module '@mui/material/styles' {
  interface Theme {
    // add types later
    customPalette: any;
  }

  interface ThemeOptions {
    customPalette: any;
  }
}

export default function App() {
  // Disallow rendering inside an iframe to prevent clickjacking.
  if (window.self !== window.top) {
    return null;
  }

  let appElement = (
    <NavigationFrame>
      <Pages />
    </NavigationFrame>
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
        {/* <Route path="/connecting_wallet" component={ConnectingWallet} /> */}
        <Route path="/wallet" component={Wallet} />
        <Route path="/restore_wallet" component={RestorePage} />
        <Route path="/welcome" component={WelcomePage} />
        <Route path="/create_wallet" component={CreateWalletPage} />
        {/* <Route path="/import_wallet" component={ImportWalletPage} /> */}
        <Route exact path="/welcome_back" component={WelcomeBackPage} />
        <Route path="/connect_popup" component={ConnectPopup} />

        {/* popup if connecting from dex UI */}
        {window.opener && !!wallet && <Redirect from="/" to="/connect_popup" />}

        {/* if wallet exists - for case when we'll have unlocked wallet */}
        {!!wallet && <Redirect from="/" to="/wallet" />}

        {/* if have mnemonic in localstorage - login, otherwise - restore/import/create */}
        {hasLockedMnemonicAndSeed ? (
          <Redirect from="/" to="/welcome_back" />
        ) : (
          <Redirect from="/" to="/welcome" />
        )}
      </Switch>
    </>
  );
};
