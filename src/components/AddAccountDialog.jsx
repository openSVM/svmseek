import React, { useState } from 'react';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Switch from '@mui/material/Switch';
import { Account } from '@solana/web3.js';
import DialogForm from '../pages/Wallet/components/DialogForm';
import { devLog } from '../utils/logger';

export default function AddAccountDialog({ open, onAdd, onClose }) {
  const [name, setName] = useState('');
  const [isImport, setIsImport] = useState(false);
  const [importedPrivateKey, setPrivateKey] = useState('');

  const importedAccount = isImport
    ? decodeAccount(importedPrivateKey)
    : undefined;
  const isAddEnabled = isImport ? name && importedAccount !== undefined : name;

  return (
    <DialogForm
      open={open}
      onEnter={() => {
        setName('');
        setIsImport(false);
        setPrivateKey('');
      }}
      onClose={onClose}
      onSubmit={() => onAdd({ name, importedAccount })}
      fullWidth
    >
      <DialogTitle>Add account</DialogTitle>
      <DialogContent style={{ paddingTop: 16 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <TextField
            label="Name"
            fullWidth
            variant="outlined"
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value.trim())}
          />
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={isImport}
                  onChange={() => setIsImport(!isImport)}
                />
              }
              label="Import private key"
            />
          </FormGroup>
          {isImport && (
            <TextField
              label="Paste your private key here"
              fullWidth
              type="password"
              value={importedPrivateKey}
              variant="outlined"
              margin="normal"
              onChange={(e) => setPrivateKey(e.target.value.trim())}
            />
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button type="submit" color="primary" disabled={!isAddEnabled}>
          Add
        </Button>
      </DialogActions>
    </DialogForm>
  );
}

/**
 * Returns an account object when given the private key
 *
 * @param {string} privateKey - the private key in array format
 */
function decodeAccount(privateKey) {
  try {
    // SECURITY: Comprehensive private key validation before parsing
    if (!privateKey || typeof privateKey !== 'string' || privateKey.trim().length === 0) {
      devLog('Invalid private key: empty or non-string input');
      return undefined;
    }
    
    const trimmedKey = privateKey.trim();
    let parsedKey;
    
    try {
      parsedKey = JSON.parse(trimmedKey);
    } catch (parseError) {
      devLog('Failed to parse private key JSON:', parseError.message);
      return undefined;
    }
    
    // Validate that parsed key is a valid array of numbers for Solana Account
    if (!Array.isArray(parsedKey) || parsedKey.length !== 64) {
      devLog('Invalid private key: must be array of 64 numbers');
      return undefined;
    }
    
    // Validate all elements are valid numbers in the expected range for private key bytes
    for (const byte of parsedKey) {
      if (!Number.isInteger(byte) || byte < 0 || byte > 255) {
        devLog('Invalid private key: contains invalid byte values');
        return undefined;
      }
    }
    
    const a = new Account(parsedKey);
    return a;
  } catch (error) {
    const errorMessage = error?.message || 'Invalid private key format';
    devLog('Failed to decode private key:', errorMessage);
    return undefined;
  }
}
