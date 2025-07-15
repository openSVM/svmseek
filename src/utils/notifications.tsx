import React, { useState } from 'react';
import { useSnackbar } from 'notistack';
import { useConnection, useSolanaExplorerUrlSuffix } from './connection';
import Button from '@mui/material/Button';
import { confirmTransaction } from './utils';

export function useSendTransaction(): [any, boolean] {
  const connection = useConnection();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [sending, setSending] = useState(false);

  async function sendTransaction(
    signaturePromise,
    {
      onSuccess = (res) => {},
      onError = (e) => {
        console.error(e);
      },
    } = {},
  ) {
    let id =
      enqueueSnackbar('Sending transaction...', {
        variant: 'info',
        persist: true,
      }) || '';
    setSending(true);
    try {
      let signature = await signaturePromise;
      closeSnackbar(id);
      id =
        enqueueSnackbar('Confirming transaction...', {
          variant: 'info',
          persist: true,
          action: <ViewTransactionOnExplorerButton signature={signature} />,
        }) || '';
      await confirmTransaction(connection, signature);
      closeSnackbar(id);
      setSending(false);
      enqueueSnackbar('Transaction confirmed', {
        variant: 'success',
        autoHideDuration: 3000,
        action: <ViewTransactionOnExplorerButton signature={signature} />,
      });
      if (onSuccess) {
        onSuccess(signature);
      }
    } catch (e) {
      closeSnackbar(id);
      setSending(false);

      let message = e.message;

      if (
        message.includes(
          'Error processing Instruction 0: custom program error: 0x1',
        )
      ) {
        message = 'Insufficient SOL balance for this transaction';
      }

      console.warn(message);
      enqueueSnackbar(message, { variant: 'error' });
      if (onError) {
        onError(e);
      }
    }
  }

  return [sendTransaction, sending];
}

function ViewTransactionOnExplorerButton({ signature }) {
  const urlSuffix = useSolanaExplorerUrlSuffix();
  return (
    <Button
      style={{ color: '#fff' }}
      component="a"
      target="_blank"
      rel="noopener"
      href={`https://explorer.solana.com/tx/${signature}` + urlSuffix}
    >
      View on Solana Explorer
    </Button>
  );
}

export function useCallAsync() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  return async function callAsync(promise: any, notificationObj?: any) {
    const {
      progressMessage = 'Submitting...',
      successMessage = 'Success',
      onSuccess = () => {},
      onError = (e) => {
        console.error(e);
      },
    } = notificationObj || {};

    let id = '';

    if (progressMessage) {
      id =
        String(enqueueSnackbar(progressMessage, {
          variant: 'info',
          persist: true,
        })) || '';
    }

    try {
      let result = await promise;
      closeSnackbar(id);
      if (successMessage) {
        enqueueSnackbar(successMessage, { variant: 'success' });
      }
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (e) {
      console.warn(e);
      closeSnackbar(id);
      let message = e.message;

      if (
        message.includes(
          'Error processing Instruction 0: custom program error: 0x1',
        )
      ) {
        message = 'Insufficient SOL balance for this transaction';
      }

      enqueueSnackbar(message, { variant: 'error' });
      if (onError) {
        onError(e);
      }
    }
  };
}
