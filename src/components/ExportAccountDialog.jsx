import React, { useState } from 'react';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import DialogForm from '../pages/Wallet/components/DialogForm';
import { useWallet } from '../utils/wallet';
// import { getUnlockedMnemonicAndSeed } from '../utils/wallet-seed';
import { useUnlockedMnemonicAndSeed } from '../utils/wallet-seed';

export default function ExportAccountDialog({ open, onClose }) {
  const wallet = useWallet();
  const [isHidden, setIsHidden] = useState(true);
  const keyOutput = `[${Array.from(wallet.provider.account.secretKey)}]`;
  return (
    <DialogForm open={open} onClose={onClose} fullWidth>
      <DialogTitle>Export account</DialogTitle>
      <DialogContent>
        <TextField
          label="Private key"
          fullWidth
          type={isHidden && 'password'}
          variant="outlined"
          margin="normal"
          value={keyOutput}
        />
        <FormControlLabel
          control={
            <Switch
              checked={!isHidden}
              onChange={() => setIsHidden(!isHidden)}
            />
          }
          label="Reveal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </DialogForm>
  );
}

export function ExportMnemonicDialog({ open, onClose }) {
  const [isHidden, setIsHidden] = useState(true);
  const [mnemKey] = useUnlockedMnemonicAndSeed();
  return (
    <DialogForm open={open} onClose={onClose} fullWidth>
      <DialogTitle>Export mnemonic</DialogTitle>
      <DialogContent>
        <TextField
          label="Mnemonic"
          fullWidth
          type={isHidden && 'password'}
          variant="outlined"
          margin="normal"
          value={mnemKey.mnemonic}
        />
        <FormControlLabel
          control={
            <Switch
              checked={!isHidden}
              onChange={() => setIsHidden(!isHidden)}
            />
          }
          label="Reveal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </DialogForm>
  );
}
