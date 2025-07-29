import React, { useEffect, useState } from 'react';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogForm from '../pages/Wallet/components/DialogForm';
import { LedgerWalletProvider } from '../utils/walletProvider/ledger';
import CircularProgress from '@mui/material/CircularProgress';
import { useSnackbar } from 'notistack';
import { devLog } from '../utils/logger';

export default function AddHardwareWalletDialog({ open, onAdd, onClose }) {
  const [pubKey, setPubKey] = useState();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    (async () => {
      if (open) {
        try {
          const provider = new LedgerWalletProvider();
          await provider.init();
          setPubKey(provider.publicKey);
        } catch (err) {
          devLog(
            `received error when attempting to connect ledger: ${err}`,
          );
          if (err.statusCode === 0x6804) {
            enqueueSnackbar('Unlock ledger device', { variant: 'error' });
          }
          setPubKey(undefined);
          onClose();
        }
      }
    })();
  }, [open, onClose, enqueueSnackbar]);

  return (
    <DialogForm
      open={open}
      onEnter={() => {}}
      onClose={() => {
        setPubKey(undefined);
        onClose();
      }}
      onSubmit={() => {
        setPubKey(undefined);
        onAdd(pubKey);
        onClose();
      }}
      fullWidth
    >
      <DialogTitle>Add hardware wallet</DialogTitle>
      <DialogContent style={{ paddingTop: 16 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {pubKey ? (
            <>
              <b>Hardware wallet detected:</b>
              <div>{pubKey.toString()}</div>
            </>
          ) : (
            <>
              <b>Connect your ledger and open the Solana application</b>
              <CircularProgress />
            </>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setPubKey(undefined);
            onClose();
          }}
        >
          Close
        </Button>
        <Button type="submit" color="primary" disabled={!pubKey}>
          Add
        </Button>
      </DialogActions>
    </DialogForm>
  );
}
