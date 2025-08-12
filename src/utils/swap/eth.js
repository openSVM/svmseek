import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import ERC20_ABI from './erc20-abi.json';
import SWAP_ABI from './swap-abi.json';
import { useCallAsync } from '../notifications';
import { VioletButton } from '../../pages/commonStyles';
import { useTheme } from '@mui/material';
import { isExtension } from '../utils';
import { devLog } from '../logger';

// Safe ethereum provider access with multiple provider support
function getEthereumProvider() {
  if (typeof window === 'undefined') return null;
  
  // Check for multiple providers
  if (window.ethereum?.providers && Array.isArray(window.ethereum.providers)) {
    // Prefer MetaMask if available
    const metamask = window.ethereum.providers.find(p => p.isMetaMask);
    if (metamask) return metamask;
    
    // Otherwise use the first available provider
    return window.ethereum.providers[0];
  }
  
  // Single provider or legacy access
  if (window.ethereum) {
    return window.ethereum;
  }
  
  // Check for provider-specific access patterns
  if (window.web3?.currentProvider) {
    return window.web3.currentProvider;
  }
  
  return null;
}

// Initialize Web3 with safe provider access
let web3;
try {
  const provider = getEthereumProvider();
  if (provider) {
    web3 = new Web3(provider);
  } else {
    // Create a minimal Web3 instance for cases where no provider is available
    web3 = new Web3();
  }
} catch (error) {
  console.warn('SVMSeek: Failed to initialize Web3 with provider, using minimal instance:', error);
  web3 = new Web3();
}

// Change to use estimated gas limit
const SUGGESTED_GAS_LIMIT = 200000;

export function useEthAccount() {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const provider = getEthereumProvider();
    if (provider) {
      const onChange = (accounts) =>
        setAccount(accounts.length > 0 ? accounts[0] : null);
      
      // Safe account access with error handling
      const initializeAccount = async () => {
        try {
          const accounts = await provider.request({ method: 'eth_accounts' });
          onChange(accounts);
        } catch (error) {
          console.warn('SVMSeek: Failed to get initial eth accounts:', error);
          setAccount(null);
        }
      };
      
      initializeAccount();
      
      // Set up event listener with error handling
      try {
        provider.on('accountsChanged', onChange);
      } catch (error) {
        console.warn('SVMSeek: Failed to set up accountsChanged listener:', error);
      }
      
      return () => {
        try {
          if (provider && provider.removeListener) {
            provider.removeListener('accountsChanged', onChange);
          }
        } catch (error) {
          console.warn('SVMSeek: Failed to remove accountsChanged listener:', error);
        }
      };
    }
  }, []);

  return account;
}

export async function getErc20Balance(account, erc20Address) {
  try {
    if (!erc20Address) {
      const balance = await web3.eth.getBalance(account);
      return parseInt(balance) / 1e18;
    }

    const erc20 = new web3.eth.Contract(ERC20_ABI, erc20Address);
    const [value, decimals] = await Promise.all([
      erc20.methods.balanceOf(account).call(),
      erc20.methods.decimals().call(),
    ]);
    return parseInt(value, 10) / 10 ** parseInt(decimals, 10);
  } catch (error) {
    console.warn('SVMSeek: Failed to get ERC20 balance:', error);
    return 0;
  }
}

export async function estimateErc20SwapFees({
  erc20Address,
  swapAddress,
  ethAccount,
}) {
  if (!erc20Address) {
    return estimateEthSwapFees({ swapAddress });
  }

  const erc20 = new web3.eth.Contract(ERC20_ABI, erc20Address);
  const decimals = parseInt(await erc20.methods.decimals().call(), 10);

  const approveAmount = addDecimals('100000000', decimals);

  let approveEstimatedGas = await erc20.methods
    .approve(swapAddress, approveAmount)
    .estimateGas({ from: ethAccount });
  // Account for Metamask over-estimation
  approveEstimatedGas *= 1.5;

  // Use estimated gas limit for now
  const swapEstimatedGas = SUGGESTED_GAS_LIMIT;

  const gasPrice = (await web3.eth.getGasPrice()) * 1e-18;

  return [approveEstimatedGas * gasPrice, swapEstimatedGas * gasPrice];
}

export async function estimateEthSwapFees() {
  const estimatedGas = SUGGESTED_GAS_LIMIT;

  const gasPrice = (await web3.eth.getGasPrice()) * 1e-18;

  return estimatedGas * gasPrice;
}

export async function swapErc20ToSpl({
  ethAccount,
  erc20Address,
  swapAddress,
  destination,
  amount, // string
  onStatusChange,
}) {
  if (!erc20Address) {
    return swapEthToSpl({
      ethAccount,
      swapAddress,
      destination,
      amount,
      onStatusChange,
    });
  }

  const erc20 = new web3.eth.Contract(ERC20_ABI, erc20Address);
  const swap = new web3.eth.Contract(SWAP_ABI, swapAddress);
  const decimals = parseInt(await erc20.methods.decimals().call(), 10);

  const encodedAmount = addDecimals(amount, decimals);

  const approveTx = erc20.methods
    .approve(swapAddress, encodedAmount)
    .send({ from: ethAccount });
  await waitForTxid(approveTx);

  onStatusChange({ step: 1 });

  const swapTx = swap.methods
    .swapErc20(erc20Address, destination, encodedAmount)
    .send({ from: ethAccount, gasLimit: SUGGESTED_GAS_LIMIT });
  const swapTxid = await waitForTxid(swapTx);

  onStatusChange({ step: 2, txid: swapTxid, confirms: 0 });

  await Promise.all([
    approveTx,
    swapTx,
    waitForConfirms(swapTx, onStatusChange),
  ]);

  onStatusChange({ step: 3 });
}

export async function swapEthToSpl({
  ethAccount,
  swapAddress,
  destination,
  amount,
  onStatusChange,
}) {
  const swap = new web3.eth.Contract(SWAP_ABI, swapAddress);

  const encodedAmount = addDecimals(amount, 18);
  const swapTx = swap.methods
    .swapEth(destination)
    .send({ from: ethAccount, value: encodedAmount });
  const swapTxid = await waitForTxid(swapTx);

  onStatusChange({ step: 2, txid: swapTxid, confirms: 0 });

  await Promise.all([swapTx, waitForConfirms(swapTx, onStatusChange)]);

  onStatusChange({ step: 3 });
}

function addDecimals(str, decimals) {
  if (!/^\d*\.?\d*$/.test(str)) {
    throw new Error('Invalid number');
  }
  if (!str.includes('.')) {
    str += '.';
  }
  let [intStr, fractionStr] = str.split('.');
  if (fractionStr.length > decimals) {
    fractionStr = fractionStr.slice(0, decimals);
  } else {
    fractionStr += '0'.repeat(decimals - fractionStr.length);
  }
  return (intStr + fractionStr).replace(/^0+/, '') || '0';
}

const pendingNonces = new Set();

export async function withdrawEth(from, withdrawal, callAsync) {
  const { params, signature } = withdrawal.txData;
  const swap = new web3.eth.Contract(SWAP_ABI, params[1]);
  let method, nonce;
  if (params[0] === 'withdrawErc20') {
    method = swap.methods.withdrawErc20(
      params[2],
      params[3],
      params[4],
      params[5],
      signature,
    );
    nonce = params[5];
  } else if (params[0] === 'withdrawEth') {
    method = swap.methods.withdrawEth(
      params[2],
      params[3],
      params[4],
      signature,
    );
    nonce = params[4];
  } else {
    return;
  }
  if (pendingNonces.has(nonce)) {
    return;
  }
  try {
    await method.estimateGas();
  } catch (e) {
    devLog('Gas estimation failed for withdrawal:', e.message);
    return;
  }
  pendingNonces.add(nonce);
  await callAsync(method.send({ from, gasLimit: SUGGESTED_GAS_LIMIT }), {
    progressMessage: `Completing ${withdrawal.coin.ticker} transfer...`,
  });
  pendingNonces.delete(nonce);
}

function waitForTxid(tx) {
  return new Promise((resolve, reject) => {
    tx.once('transactionHash', resolve).catch(reject);
  });
}

function waitForConfirms(tx, onStatusChange) {
  return new Promise((resolve, reject) => {
    let resolved = false;
    tx.on('confirmation', (confirms, receipt) => {
      if (!resolved) {
        onStatusChange({ confirms: confirms + 1 });
        if (!receipt.status) {
          reject('Transaction failed');
          resolved = true;
        } else if (confirms >= 11) {
          resolve();
          resolved = true;
        }
      }
    });
  });
}

export function ConnectToMetamaskButton() {
  const callAsync = useCallAsync();
  const theme = useTheme();

  const provider = getEthereumProvider();
  if (!provider) {
    return (
      <VioletButton
        theme={theme}
        component="a"
        href={isExtension ? 'https://svmseek.com/' : 'https://metamask.io/'}
        target="_blank"
        rel="noopener"
        width={'calc(50% - .5rem)'}
      >
        {isExtension ? 'Open SVMSeek Wallet' : 'Connect to MetaMask'}
      </VioletButton>
    );
  }

  function connect() {
    callAsync(
      provider.request({
        method: 'eth_requestAccounts',
      }),
      {
        progressMessage: 'Connecting to MetaMask...',
        successMessage: 'Connected to MetaMask',
      },
    );
  }

  return (
    <VioletButton theme={theme} width={'calc(50% - .5rem)'} onClick={connect}>
      Connect to MetaMask
    </VioletButton>
  );
}
