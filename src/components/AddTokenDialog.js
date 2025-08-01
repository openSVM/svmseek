import React, { useEffect, useState } from 'react';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import {
  refreshWalletPublicKeys,
  useWallet,
  useWalletTokenAccounts,
} from '../utils/wallet';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { TOKENS } from '../utils/tokens/tokens'
import { useUpdateTokenName } from '../utils/tokens/names';
import { useAsyncData } from '../utils/fetch-loop';
import LoadingIndicator from './LoadingIndicator';
import { Tab, Tabs } from '@mui/material';
import { useSendTransaction } from '../utils/notifications';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import { abbreviateAddress } from '../utils/utils';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import {
  useConnectionConfig,
  useSolanaExplorerUrlSuffix,
} from '../utils/connection';
import Link from '@mui/material/Link';
import CopyableDisplay from './CopyableDisplay';
import DialogForm from '../pages/Wallet/components/DialogForm';
import { showSwapAddress } from '../utils/config';
import { swapApiRequest } from '../utils/swap/api';
import TokenIcon from './TokenIcon';

const feeFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 6,
  maximumFractionDigits: 6,
});

export default function AddTokenDialog({ open, onClose }) {
  let wallet = useWallet();
  let [tokenAccountCost] = useAsyncData(
    wallet.tokenAccountCost,
    wallet.tokenAccountCost,
  );
  let updateTokenName = useUpdateTokenName();
  const [sendTransaction, sending] = useSendTransaction();
  const { endpoint } = useConnectionConfig();
  const popularTokens = TOKENS[endpoint];
  const [walletAccounts] = useWalletTokenAccounts();

  const [tab, setTab] = useState(!!popularTokens ? 'popular' : 'manual');
  const [mintAddress, setMintAddress] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [erc20Address, setErc20Address] = useState('');

  useEffect(() => {
    if (!popularTokens) {
      setTab('manual');
    }
  }, [popularTokens]);

  function onSubmit(params) {
    if (tab === 'manual') {
      params = { mintAddress, tokenName, tokenSymbol };
    } else if (tab === 'erc20') {
      params = { erc20Address };
    }
    sendTransaction(addToken(params), {
      onSuccess: () => {
        refreshWalletPublicKeys(wallet);
        onClose();
      },
    });
  }

  async function addToken({
    mintAddress,
    tokenName,
    tokenSymbol,
    erc20Address,
  }) {
    if (erc20Address) {
      let tokenInfo = await swapApiRequest('POST', `coins/eth/${erc20Address}`);
      mintAddress = tokenInfo.splMint;
      tokenName = tokenInfo.name;
      tokenSymbol = tokenInfo.ticker;
      if (tokenInfo.blockchain !== 'sol') {
        tokenName = 'Wrapped ' + tokenName;
      }
    }

    let mint = new PublicKey(mintAddress);
    updateTokenName(mint, tokenName, tokenSymbol);
    const resp = await wallet.createAssociatedTokenAccount(mint);
    return resp[1];
  }

  let valid = true;
  if (tab === 'erc20') {
    valid = erc20Address.length === 42 && erc20Address.startsWith('0x');
  }

  return (
    <DialogForm open={open} onClose={onClose}>
      <DialogTitle>Add Token</DialogTitle>
      <DialogContent>
        {tokenAccountCost ? (
          <DialogContentText>
            Add a token to your wallet. This will cost{' '}
            {feeFormat.format(tokenAccountCost / LAMPORTS_PER_SOL)} SOL.
          </DialogContentText>
        ) : (
          <LoadingIndicator />
        )}
        {!!popularTokens && (
          <Tabs
            value={tab}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              marginBottom: 1,
              borderBottom: (theme) => `1px solid ${theme.palette.background.paper}`,
            }}
            onChange={(e, value) => setTab(value)}
          >
            <Tab label="Popular Tokens" value="popular" />
            {showSwapAddress ? <Tab label="ERC20 Token" value="erc20" /> : null}
            <Tab label="Manual Input" value="manual" />
          </Tabs>
        )}
        {tab === 'manual' || !popularTokens ? (
          <React.Fragment>
            <TextField
              label="Token Mint Address"
              fullWidth
              variant="outlined"
              margin="normal"
              value={mintAddress}
              onChange={(e) => setMintAddress(e.target.value)}
              autoFocus
              disabled={sending}
            />
            <TextField
              label="Token Name"
              fullWidth
              variant="outlined"
              margin="normal"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              disabled={sending}
            />
            <TextField
              label="Token Symbol"
              fullWidth
              variant="outlined"
              margin="normal"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
              disabled={sending}
            />
          </React.Fragment>
        ) : tab === 'popular' ? (
          <List disablePadding>
            {popularTokens
              .filter((token) => !token.deprecated)
              .map((token) => (
                <TokenListItem
                  key={token.mintAddress}
                  {...token}
                  existingAccount={(walletAccounts || []).find(
                    (account) =>
                      account.parsed.mint.toBase58() === token.mintAddress,
                  )}
                  onSubmit={onSubmit}
                  disalbed={sending}
                />
              ))}
          </List>
        ) : tab === 'erc20' ? (
          <>
            <TextField
              label="ERC20 Contract Address"
              fullWidth
              variant="outlined"
              margin="normal"
              value={erc20Address}
              onChange={(e) => setErc20Address(e.target.value.trim())}
              autoFocus
              disabled={sending}
            />
            {erc20Address && valid ? (
              <Link
                href={`https://etherscan.io/token/${erc20Address}`}
                target="_blank"
                rel="noopener"
              >
                View on Etherscan
              </Link>
            ) : null}
          </>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {tab !== 'popular' && (
          <Button
            type="submit"
            color="primary"
            disabled={sending || !valid}
            onClick={() => onSubmit({ tokenName, tokenSymbol, mintAddress })}
          >
            Add
          </Button>
        )}
      </DialogActions>
    </DialogForm>
  );
}

function TokenListItem({
  tokenName,
  icon,
  tokenSymbol,
  mintAddress,
  onSubmit,
  disabled,
  existingAccount,
}) {
  const [open, setOpen] = useState(false);
  const urlSuffix = useSolanaExplorerUrlSuffix();
  const alreadyExists = !!existingAccount;
  return (
    <React.Fragment>
      <div style={{ display: 'flex' }} key={tokenName}>
        <ListItem button onClick={() => setOpen((open) => !open)}>
          <ListItemIcon>
            <TokenIcon url={icon} tokenName={tokenName} size={20} />
          </ListItemIcon>
          <ListItemText
            primary={
              <Link
                target="_blank"
                rel="noopener"
                href={
                  `https://explorer.solana.com/account/${mintAddress}` +
                  urlSuffix
                }
              >
                {tokenName ?? abbreviateAddress(mintAddress)}
                {tokenSymbol ? ` (${tokenSymbol})` : null}
              </Link>
            }
          />
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Button
          type="submit"
          color="primary"
          disabled={disabled || alreadyExists}
          onClick={() => onSubmit({ tokenName, tokenSymbol, mintAddress })}
        >
          {alreadyExists ? 'Added' : 'Add'}
        </Button>
      </div>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <CopyableDisplay
          value={mintAddress}
          label={`${tokenSymbol} Mint Address`}
        />
      </Collapse>
    </React.Fragment>
  );
}
