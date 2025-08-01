import React, { useState } from 'react';
import DialogForm from '../pages/Wallet/components/DialogForm';
import { forgetWallet } from '../utils/wallet-seed';
import DialogTitle from '@mui/material/DialogTitle';
import { DialogContentText } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

export default function DeleteMnemonicDialog({ open, onClose }) {
  const [deleteCheck, setDeleteCheck] = useState('');
  return (
    <>
      <DialogForm
        open={open}
        onClose={onClose}
        onSubmit={() => {
          forgetWallet();
          onClose();
        }}
        fullWidth
      >
        <DialogTitle>Delete Mnemonic</DialogTitle>
        <DialogContentText style={{ margin: 20 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            You will not be able to recover the current accounts without the
            seed phrase, and the account private key. This action will delete
            all current accounts from your browser.
            <br />
            <br />
            <strong>
              To prevent loss of funds, please ensure you have the seed phrase
              and the private key for all current accounts.
            </strong>
          </div>
          <TextField
            label={`Please type "delete" to confirm`}
            fullWidth
            variant="outlined"
            margin="normal"
            value={deleteCheck}
            onChange={(e) => setDeleteCheck(e.target.value.trim())}
          />
        </DialogContentText>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button
            type="submit"
            color="secondary"
            disabled={deleteCheck !== 'delete'}
          >
            Delete
          </Button>
        </DialogActions>
      </DialogForm>
    </>
  );
}
