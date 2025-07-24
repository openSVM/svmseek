import React from 'react';
import Link from '@mui/material/Link';
import { Title } from '../../pages/commonStyles';
import { useTheme } from '@mui/material';

export default function LabelValue({ label, value, link = false, onClick }) {
  const theme = useTheme()

  return (
    <Title fontSize="1.6rem" style={{ display: 'block', textAlign: 'left' }}>
      {label}:{' '}
      {link ? (
        <Link style={{ fontSize: '1.6rem', color: theme.customPalette.blue.serum }} href="#" onClick={onClick}>
          {value}
        </Link>
      ) : (
        <Title style={{ color: '#7B7B7B' }}>{value}</Title>
      )}
    </Title>
  );
}
