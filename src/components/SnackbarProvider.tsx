import React from 'react';
import { SnackbarProvider } from 'notistack';
import { withStyles } from '@mui/styles';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import errorIcon from '../images/errorIcon.svg';
import successIcon from '../images/successIcon.svg';
import infoIcon from '../images/infoIcon.svg';

const cancelStyles = (theme) => ({
  icon: {
    fontSize: 20,
    color: '#fff'
  },
});

const CloseButton = withStyles(cancelStyles)((props: any): any => {
  return <IconButton key="close" aria-label="Close" {...props}>
    <CloseIcon className={props.classes.icon} />
  </IconButton>
});

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
      action={<CloseButton />}
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
