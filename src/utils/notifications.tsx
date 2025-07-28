import React, { useState } from 'react';
import { useSnackbar } from 'notistack';
import { useConnection, useSolanaExplorerUrlSuffix } from './connection';
import Button from '@mui/material/Button';
import { confirmTransaction } from './utils';
import { logWarn, logError } from './logger';

interface TransactionCallbacks {
  onSuccess?: (signature: string) => void;
  onError?: (error: Error) => void;
}

interface NotificationConfig {
  progressMessage?: string;
  successMessage?: string;
  onSuccess?: (result: unknown) => void;
  onError?: (error: Error) => void;
}

type SendTransactionFunction = (
  signaturePromise: Promise<string>,
  callbacks?: TransactionCallbacks
) => Promise<void>;

export function useSendTransaction(): [SendTransactionFunction, boolean] {
  const connection = useConnection();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [sending, setSending] = useState(false);

  async function sendTransaction(
    signaturePromise: Promise<string>,
    {
      onSuccess = () => {},
      onError = (e: Error) => {
        logError(e.message || String(e));
      },
    }: TransactionCallbacks = {},
  ): Promise<void> {
    let id = String(
      enqueueSnackbar('Sending transaction...', {
        variant: 'info',
        persist: true,
      }) || ''
    );
    setSending(true);
    try {
      const signature = await signaturePromise;
      closeSnackbar(id);
      id = String(
        enqueueSnackbar('Confirming transaction...', {
          variant: 'info',
          persist: true,
          action: <ViewTransactionOnExplorerButton signature={signature} />,
        }) || ''
      );
      await confirmTransaction(connection, signature);
      closeSnackbar(id);
      setSending(false);
      enqueueSnackbar('Transaction confirmed', {
        variant: 'success',
        autoHideDuration: 3000,
        action: <ViewTransactionOnExplorerButton signature={signature} />,
      });
      onSuccess(signature);
    } catch (e) {
      closeSnackbar(id);
      setSending(false);

      let message = (e as Error).message;

      if (
        message.includes(
          'Error processing Instruction 0: custom program error: 0x1',
        )
      ) {
        message = 'Insufficient SOL balance for this transaction';
      }

      logWarn(message);
      enqueueSnackbar(message, { variant: 'error' });
      onError(e as Error);
    }
  }

  return [sendTransaction, sending];
}

interface ViewTransactionButtonProps {
  signature: string;
}

function ViewTransactionOnExplorerButton({ signature }: ViewTransactionButtonProps) {
  const urlSuffix = useSolanaExplorerUrlSuffix();
  return (
    <Button
      style={{ color: 'var(--text-inverse)' }}
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

  return async function callAsync<T>(promise: Promise<T>, notificationObj?: NotificationConfig): Promise<void> {
    const {
      progressMessage = 'Submitting...',
      successMessage = 'Success',
      onSuccess = () => {},
      onError = (e: Error) => {
        logError(e.message || String(e));
      },
    } = notificationObj || {};

    let id = '';

    if (progressMessage) {
      id = String(
        enqueueSnackbar(progressMessage, {
          variant: 'info',
          persist: true,
        }) || ''
      );
    }

    try {
      const result = await promise;
      closeSnackbar(id);
      if (successMessage) {
        enqueueSnackbar(successMessage, { variant: 'success' });
      }
      onSuccess(result);
    } catch (e) {
      logWarn(e instanceof Error ? e.message : String(e));
      closeSnackbar(id);
      let message = (e as Error).message;

      if (
        message.includes(
          'Error processing Instruction 0: custom program error: 0x1',
        )
      ) {
        message = 'Insufficient SOL balance for this transaction';
      }

      enqueueSnackbar(message, { variant: 'error' });
      onError(e as Error);
    }
  };
}
