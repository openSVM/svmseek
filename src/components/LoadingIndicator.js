import React, { useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useEffectAfterTimeout } from '../utils/utils';

export default function LoadingIndicator({
  height = null,
  delay = 500,
  ...rest
}) {
  const [visible, setVisible] = useState(false);

  useEffectAfterTimeout(() => setVisible(true), delay);

  let style = {};
  if (height) {
    style.height = height;
  }

  if (!visible) {
    return height ? <div style={style} /> : null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        padding: 2,
      }}
      style={style}
      {...rest}
    >
      <CircularProgress />
    </Box>
  );
}
