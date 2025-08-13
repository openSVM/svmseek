import { createContext, useContext, useEffect, useState } from 'react';

const ConnectedWalletsContext = createContext({});

export const ConnectedWalletsProvider = ({ children }) => {
  const [connectedWallets, setConnectedWallets] = useState({});

  useEffect(() => {
    const updateConnectionAmount = () => {
      // SECURITY: Validate chrome storage access before use
      if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
        console.warn('Chrome storage not available, using empty wallet list');
        setConnectedWallets({});
        return;
      }
      
      try {
        chrome.storage.local.get('connectedWallets', (result) => {
          // SECURITY: Validate result structure
          if (chrome.runtime.lastError) {
            console.error('Chrome storage error:', chrome.runtime.lastError);
            setConnectedWallets({});
            return;
          }
          
          const wallets = result.connectedWallets;
          if (wallets && typeof wallets === 'object' && !Array.isArray(wallets)) {
            setConnectedWallets(wallets);
          } else {
            setConnectedWallets({});
          }
        });
      } catch (error) {
        console.error('Error accessing chrome storage:', error);
        setConnectedWallets({});
      }
    };
    
    const listener = (changes) => {
      if ('connectedWallets' in changes) {
        updateConnectionAmount();
      }
    };
    
    updateConnectionAmount();
    
    // SECURITY: Validate chrome storage listener availability
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local && chrome.storage.local.onChanged) {
      chrome.storage.local.onChanged.addListener(listener);
      return () => {
        if (chrome.storage && chrome.storage.local && chrome.storage.local.onChanged) {
          chrome.storage.local.onChanged.removeListener(listener);
        }
      };
    }
  }, []);

  return (
    <ConnectedWalletsContext.Provider value={connectedWallets}>
      {children}
    </ConnectedWalletsContext.Provider>
  );
};

export const useConnectedWallets = () => useContext(ConnectedWalletsContext);
