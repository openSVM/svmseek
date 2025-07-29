import React from 'react';
import { SnackbarProvider } from 'notistack';
import { IconButton, styled } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import errorIcon from '../images/errorIcon.svg';
import successIcon from '../images/successIcon.svg';
import infoIcon from '../images/infoIcon.svg';

const CloseButton = styled(IconButton)(({ theme }) => ({
  '& .MuiSvgIcon-root': {
    fontSize: 20,
    color: '#fff'
  },
}));

const IntegrationNotistack = ({ ...props }) => {
  return (
    <SnackbarProvider
      iconVariant={{
        success: (
          <img
            src={successIcon}
            alt="success"
            style={{
              marginRight: '.8rem',
              width: '3.5rem',
              height: 'auto',
            }}
          />
        ),
        error: (
          <img
            src={errorIcon}
            alt="error"
            style={{
              marginRight: '.8rem',
              width: '3.5rem',
              height: 'auto',
            }}
          />
        ),
        info: (
          <img
            src={infoIcon}
            alt="info"
            style={{
              marginRight: '.8rem',
              width: '3.5rem',
              height: 'auto',
            }}
          />
        ),
      }}
      maxSnack={3}
      autoHideDuration={3000}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      // @ts-ignore
      action={(snackbarKey) => (
        <CloseButton key="close" aria-label="Close">
          <CloseIcon />
        </CloseButton>
      )}
      // classes={{
      //   variantSuccess: snackStyles.success,
      //   variantError: snackStyles.error,
      //   variantInfo: snackStyles.success,
      // }}
    >
      {props.children}
    </SnackbarProvider>
  );
};

export default IntegrationNotistack;
