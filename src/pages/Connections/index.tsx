import React from 'react';
import Container from '@mui/material/Container';
import { Grid } from '@mui/material';
import ConnectionsList from './ConnectionsList';

export default function ConnectionsPage({ theme, close, open }) {
  return (
    <Container>
      <Grid container>
        <Grid size={12}>
          <ConnectionsList theme={theme} close={() => close()} open={open} />
        </Grid>
      </Grid>
    </Container>
  );
}
