import DialogForm from '../pages/Wallet/components/DialogForm';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { DialogContentText } from '@mui/material';
import { abbreviateAddress } from '../utils/utils';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import React from 'react';
import { useSendTransaction } from '../utils/notifications';
import { refreshWalletPublicKeys, useWallet } from '../utils/wallet';

export default function CloseTokenAccountDialog({
  open,
  onClose,
  publicKey,
  balanceInfo,
}) {
  const wallet = useWallet();
  const [sendTransaction, sending] = useSendTransaction();
  const { mint, tokenName } = balanceInfo;

  function onSubmit() {
    sendTransaction(wallet.closeTokenAccount(publicKey), {
      onSuccess: () => {
        refreshWalletPublicKeys(wallet);
        onClose();
      },
    });
  }

  return (
    <DialogForm open={open} onClose={onClose} onSubmit={onSubmit}>
      <DialogTitle>
        Delete {tokenName ?? mint.toBase58()} Address{' '}
        {abbreviateAddress(publicKey)}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete your {tokenName ?? mint.toBase58()}{' '}
          address {publicKey.toBase58()}? This will permanently disable token
          transfers to this address and remove it from your wallet.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" color="secondary" disabled={sending}>
          Delete
        </Button>
      </DialogActions>
    </DialogForm>
  );
}
