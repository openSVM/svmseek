import { Typography } from '@mui/material';
import Link from '@mui/material/Link';
import React from 'react';
import { useSolanaExplorerUrlSuffix } from '../utils/connection';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogForm from '../pages/Wallet/components/DialogForm';
import { abbreviateAddress } from '../utils/utils';
import CopyableDisplay from './CopyableDisplay';

export default function TokenInfoDialog({
  open,
  onClose,
  publicKey,
  balanceInfo,
}) {
  let { mint, tokenName, tokenSymbol } = balanceInfo;
  const urlSuffix = useSolanaExplorerUrlSuffix();

  return (
    <DialogForm open={open} onClose={onClose}>
      <DialogTitle>
        {tokenName ?? abbreviateAddress(mint)}
        {tokenSymbol ? ` (${tokenSymbol})` : null}
      </DialogTitle>
      <DialogContent sx={{ minWidth: 600 }}>
        <Typography sx={{ marginBottom: 2 }}>
          Information about {tokenName ?? abbreviateAddress(mint)}
        </Typography>
        <Typography variant="body2" sx={{ marginBottom: 2 }}>
          <Link
            href={
              `https://explorer.solana.com/account/${publicKey.toBase58()}` +
              urlSuffix
            }
            target="_blank"
            rel="noopener"
          >
            View on Solana Explorer
          </Link>
        </Typography>
        {!!mint && (
          <CopyableDisplay
            value={mint.toBase58()}
            label={'Token Mint Address'}
            autoFocus
            helperText={
              <>
                This is <strong>not</strong> your deposit address
              </>
            }
          />
        )}
        {!!tokenName && (
          <CopyableDisplay value={tokenName} label={'Token Name'} />
        )}
        {!!tokenSymbol && (
          <CopyableDisplay value={tokenSymbol} label={'Token Symbol'} />
        )}
      </DialogContent>
    </DialogForm>
  );
}
