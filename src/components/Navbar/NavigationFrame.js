import React, { useState } from 'react';
import styled from 'styled-components';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useWallet, useWalletSelector } from '../../utils/wallet';
import ListItemIcon from '@mui/material/ListItemIcon';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import ExitToApp from '@mui/icons-material/ExitToApp';
import AccountIcon from '@mui/icons-material/AccountCircle';
import UsbIcon from '@mui/icons-material/Usb';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useMediaQuery, useTheme } from '@mui/material';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import AddAccountDialog from '../AddAccountDialog';
import DeleteMnemonicDialog from '../DeleteMnemonicDialog';
import AddHardwareWalletDialog from '../AddHarwareWalletDialog';
import { ExportMnemonicDialog } from '../ExportAccountDialog.js';
import { Navbar } from './Navbar';
import { isExtension } from '../../utils/utils';
import { useLocation } from 'react-router-dom';
import { MobileFooter } from '../Footer/MobileFooter';
import { devLog } from '../../utils/logger';

export const footerHeight = isExtension ? 0 : 6;

const StyledMain = styled.main`
  height: ${(props) =>
    props.isConnectPopup
      ? `calc(100% - ${footerHeight}rem)`
      : 'calc(100% - 12rem)'};

  @media (max-width: 850px) {
    height: calc(100%);
  }
  @media (max-width: 540px) {
    height: ${(props) =>
      props.isConnectPopup ? 'calc(100% - 3rem)' : 'calc(100% - 13rem)'};
  }
`;

export const StyledImg = styled.img`
  height: 100%;
`;

export default function NavigationFrame({ children }) {
  const isConnectPopup = window.opener;
  const wallet = useWallet();

  return isConnectPopup ? (
    <>
      <StyledMain isWalletConnected={false} isConnectPopup>
        {children}
      </StyledMain>
      <Footer />
    </>
  ) : (
    <>
      <Navbar />
      <StyledMain isWalletConnected={!!wallet}>{children}</StyledMain>
      <Footer />
      <MobileFooter />
    </>
  );
}

export function WalletSelector() {
  const { accounts, setWalletSelector, addAccount } = useWalletSelector();
  const [anchorEl, setAnchorEl] = useState(null);
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [
    addHardwareWalletDialogOpen,
    setAddHardwareWalletDialogOpen,
  ] = useState(false);
  const [deleteMnemonicOpen, setDeleteMnemonicOpen] = useState(false);
  const [exportMnemonicOpen, setExportMnemonicOpen] = useState(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  if (accounts.length === 0) {
    return null;
  }

  return (
    <>
      <AddHardwareWalletDialog
        open={addHardwareWalletDialogOpen}
        onClose={() => setAddHardwareWalletDialogOpen(false)}
        onAdd={(pubKey) => {
          addAccount({
            name: 'Hardware wallet',
            importedAccount: pubKey.toString(),
            ledger: true,
          });
          setWalletSelector({
            walletIndex: undefined,
            importedPubkey: pubKey.toString(),
            ledger: true,
          });
        }}
      />
      <AddAccountDialog
        open={addAccountOpen}
        onClose={() => setAddAccountOpen(false)}
        onAdd={({ name, importedAccount }) => {
          addAccount({ name, importedAccount });
          setWalletSelector({
            walletIndex: importedAccount ? undefined : accounts.length,
            importedPubkey: importedAccount
              ? importedAccount.publicKey.toString()
              : undefined,
            ledger: false,
          });
          setAddAccountOpen(false);
        }}
      />
      <ExportMnemonicDialog
        open={exportMnemonicOpen}
        onClose={() => setExportMnemonicOpen(false)}
      />
      <DeleteMnemonicDialog
        open={deleteMnemonicOpen}
        onClose={() => setDeleteMnemonicOpen(false)}
      />
      {!isSmallScreen && (
        <Button
          color="inherit"
          onClick={(e) => setAnchorEl(e.target)}
          sx={{ marginLeft: 1 }}
        >
          Account
        </Button>
      )}
      {isSmallScreen && (
        <Tooltip title="Select Account" arrow>
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.target)}>
            <AccountIcon />
          </IconButton>
        </Tooltip>
      )}
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        getContentAnchorEl={null}
      >
        {accounts.map(({ isSelected, selector, address, name, label }) => (
          <MenuItem
            key={address.toBase58()}
            onClick={() => {
              setAnchorEl(null);
              setWalletSelector(selector);
            }}
            selected={isSelected}
            component="div"
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              {isSelected ? <CheckIcon fontSize="small" /> : null}
            </ListItemIcon>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Typography>{name}</Typography>
              <Typography color="textSecondary">
                {address.toBase58()}
              </Typography>
            </div>
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={() => setAddHardwareWalletDialogOpen(true)}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <UsbIcon fontSize="small" />
          </ListItemIcon>
          Import Hardware Wallet
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setAddAccountOpen(true);
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          Add Account
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setExportMnemonicOpen(true);
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <ImportExportIcon fontSize="small" />
          </ListItemIcon>
          Export Mnemonic
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setDeleteMnemonicOpen(true);
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <ExitToApp fontSize="small" />
          </ListItemIcon>
          Delete Mnemonic
        </MenuItem>
      </Menu>
    </>
  );
}

const FooterComponent = styled.footer`
  height: 6rem;
  padding: 0 3rem 0 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  @media (max-width: 540px) {
    padding: 0;
    height: 0;
    display: none;
  }
`;
const FooterComponentForExtension = styled.footer`
  display: none;
  @media (max-width: 540px) {
    display: flex;
    justify-content: space-between;
    height: 3rem;
  }
`;

function Footer() {
  const isConnectPopup = window.opener;
  const location = useLocation();
  devLog('location', location);

  if (isConnectPopup) return null

  return (
    <>
      <FooterComponent>
        <span
          style={{
            fontSize: '1.3rem',
            color: '#fbf2f2',
            textTransform: 'none',
            fontFamily: 'Avenir Next medium',
          }}
        >
          {location.pathname.includes('restore')
            ? 'Restore your wallet using seed phrase to get access for SPL assets management and interaction with dApps on the Solana blockchain.'
            : location.pathname.includes('create')
            ? ' Create a cryptocurrency wallet for SPL assets management and secure connection and interaction with dApps on the Solana blockchain.'
            : 'Web-based cryptocurrency wallet or browser extension for SPL assets management and securely connect and interact with dApps on the Solana blockchain.'}
        </span>{' '}
        <Button
          variant="outlined"
          color="primary"
          component="a"
          target="_blank"
          rel="noopener"
          href="https://github.com/Cryptocurrencies-AI/spl-token-wallet"
          style={{
            border: '0',
            fontSize: '1.3rem',
            height: '50%',
            color: '#fbf2f2',
            textTransform: 'none',
          }}
        >
          Source
        </Button>
      </FooterComponent>
      <FooterComponentForExtension>
        {' '}
        <Button
          variant="outlined"
          color="primary"
          component="a"
          target="_blank"
          rel="noopener"
          href="https://t.me/CryptocurrenciesAi"
          style={{
            border: '0',
            fontSize: '1.3rem',
            height: '50%',
            color: '#fbf2f2',
            textTransform: 'none',
          }}
        >
          Need help?
        </Button>{' '}
        <Button
          variant="outlined"
          color="primary"
          component="a"
          target="_blank"
          rel="noopener"
          href="https://github.com/Cryptocurrencies-AI/spl-token-wallet"
          style={{
            border: '0',
            fontSize: '1.3rem',
            height: '50%',
            color: '#fbf2f2',
            textTransform: 'none',
          }}
        >
          Source
        </Button>
      </FooterComponentForExtension>
    </>
  );
}
