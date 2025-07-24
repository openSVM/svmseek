import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Button,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DoneAll, ExpandLess, ExpandMore } from '@mui/icons-material';
import { useConnectedWallets } from '../../utils/connected-wallets';
import { useWalletSelector } from '../../utils/wallet';
import DialogForm from '../../pages/Wallet/components/DialogForm';
import { RowContainer } from '../commonStyles';

const StyledPaper = styled(({ ...props }) => <Paper {...props} />)`
  height: auto;
  min-height: 70rem;
  padding: 2rem 4rem;
  width: 35rem;
  background: #222429;
  border: 0.1rem solid #3a475c;
  box-shadow: 0px 0px 16px rgb(125 125 131, 10%);
  border-radius: 2rem;
`;

const Text = styled.span`
  font-size: ${(props) => props.fontSize || '1.5rem'};
  padding-bottom: ${(props) => props.paddingBottom || ''};
  text-transform: none;
  font-family: ${(props) => props.fontFamily || 'Avenir Next Medium'};
  color: ${(props) => props.color || '#ecf0f3'};
`;

export default function ConnectionsList({ theme, close, open }) {
  const connectedWallets = useConnectedWallets();
  console.log('connectedWallets', connectedWallets);
  return (
    <DialogForm
      theme={theme}
      PaperComponent={StyledPaper}
      fullScreen={false}
      onClose={() => close()}
      maxWidth={'md'}
      open={open}
      aria-labelledby="responsive-dialog-title"
    >
      <RowContainer>
        <Text fontSize={'2rem'}>Connected Dapps</Text>
      </RowContainer>
      <List disablePadding>
        {Object.entries(connectedWallets).map(([origin, connectedWallet]) => (
          <ConnectionsListItem
            origin={origin}
            connectedWallet={connectedWallet}
            key={origin}
          />
        ))}
      </List>
    </DialogForm>
  );
}

const ICON_SIZE = 28;
const IMAGE_SIZE = 24;

const ItemDetails = styled.div`
  margin-left: 24px;
  margin-right: 24px;
  margin-bottom: 16px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
  margin-top: 8px;
  margin-bottom: 8px;
`;

const StyledListItemIcon = styled(ListItemIcon)`
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${ICON_SIZE}px;
  width: ${ICON_SIZE}px;
  border-radius: ${ICON_SIZE / 2}px;
`;

const ListItemImage = styled.img`
  height: ${IMAGE_SIZE}px;
  width: ${IMAGE_SIZE}px;
  border-radius: ${IMAGE_SIZE / 2}px;
`;

function ConnectionsListItem({ origin, connectedWallet }) {
  const [open, setOpen] = useState(false);
  // TODO better way to get high res icon?
  const appleIconUrl = origin + '/apple-touch-icon.png';
  const faviconUrl = origin + '/favicon.ico';
  const [iconUrl, setIconUrl] = useState(appleIconUrl);
  const { accounts } = useWalletSelector();
  // TODO better way to do this
  const account = accounts.find(
    (account) => account.address.toBase58() === connectedWallet.publicKey,
  );

  const setAutoApprove = (autoApprove) => {
    chrome.storage.local.get('connectedWallets', (result) => {
      result.connectedWallets[origin].autoApprove = autoApprove;
      chrome.storage.local.set({ connectedWallets: result.connectedWallets });
    });
  };

  const disconnectWallet = () => {
    chrome.storage.local.get('connectedWallets', (result) => {
      delete result.connectedWallets[origin];
      chrome.storage.local.set({ connectedWallets: result.connectedWallets });
    });
  };

  return (
    <>
      <ListItemButton onClick={() => setOpen((open) => !open)}>
        <StyledListItemIcon>
            <ListItemImage
              src={iconUrl}
              onError={() => setIconUrl(faviconUrl)}
              alt=""
            />
        </StyledListItemIcon>
        <div style={{ display: 'flex', flex: 1 }}>
          <ListItemText primary={origin} secondary={account.name} />
        </div>
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <ItemDetails>
          <ButtonContainer>
            <Button
              variant={connectedWallet.autoApprove ? 'contained' : 'outlined'}
              color="primary"
              size="small"
              startIcon={<DoneAll />}
              onClick={() => setAutoApprove(!connectedWallet.autoApprove)}
            >
              {connectedWallet.autoApprove ? 'Auto-Approved' : 'Auto-Approve'}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={disconnectWallet}
            >
              Disconnect
            </Button>
          </ButtonContainer>
        </ItemDetails>
      </Collapse>
    </>
  );
}
