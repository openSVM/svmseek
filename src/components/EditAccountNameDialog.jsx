import React, { useState } from 'react';
import DialogForm from '../pages/Wallet/components/DialogForm';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';

export default function EditAccountNameDialog({
  open,
  oldName,
  onClose,
  onEdit,
}) {
  const [name, setName] = useState(oldName);
  return (
    <DialogForm
      open={open}
      onEnter={() => setName(oldName)}
      onClose={onClose}
      onSubmit={() => onEdit(name.trim())}
      fullWidth
    >
      <DialogTitle>Edit Account</DialogTitle>
      <DialogContent>
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
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button type="submit" color="primary">
          Save
        </Button>
      </DialogActions>
    </DialogForm>
  );
}
