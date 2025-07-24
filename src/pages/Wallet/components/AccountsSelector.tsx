import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '@mui/material';
import { BtnCustom } from '../../../components/BtnCustom';
import { useWalletSelector } from '../../../utils/wallet';
import {
  RowContainer,
  Card,
  Title,
  StyledRadio,
  Row,
  Legend,
} from '../../commonStyles';
import { GreyTitle } from './AssetsTable';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import AddIcon from '../../../images/addIcon.svg';
import ImportHardwareIcon from '../../../images/importHardware.svg';
import ExportMnemonicIcon from '../../../images/exportMnemonic.svg';
import DeleteAccountIcon from '../../../images/deleteAccount.svg';
import MergeAccountsIcon from '../../../images/merge.svg';
import ManageConnections from '../../../images/connections.svg';

import AddAccountPopup from './AddAccountPopup';
import AddHardwareWalletPopup from './AddHardwareWalletPopup';
import ExportAccount, { ExportMnemonicDialog } from './ExportAccount';
import ForgetWallet from './ForgetWallet';
import MergeAccountsDialog from '../../../components/MergeAccountsDialog';
import ConnectionsPage from '../../Connections';
// import { isExtension } from '../../../utils/utils';

const ExportPrivateKeyButton = styled(BtnCustom)`
  @media (max-width: 540px) {
    font-size: 1.2rem;
  }
`;

export const StyledCard = styled(({ isFromPopup, ...props }) => (
  <Card {...props} />
))`
  position: absolute;
  top: 100%;
  ${(props) => (props.isFromPopup ? 'right: 0' : 'left: 0')};
  width: 28rem;
  height: auto;
  display: none;
  z-index: 2;
  background: #222429;
  border: 0.1rem solid #3a475c;
  box-shadow: 0px 0px 16px rgba(125, 125, 131, 0.1);

  @media (max-width: 540px) {
    width: 35rem;
  }
`;

const RowWithSelector = styled(({ isFromPopup, ...props }) => (
  <Row {...props} />
))`
  position: relative;
  bottom: ${(props) => (props.isFromPopup ? '0' : '1rem')};
  padding: ${(props) => (props.isFromPopup ? '2rem' : '1rem 3rem 2rem 0')};
  left: ${(props) => (props.isFromPopup ? '2rem' : '0')};

  &:hover #accountSelector {
    display: flex;
  }

  @media (max-width: 540px) {
    padding: 1rem 0;
  }
`;

export const WalletActionButton = ({ theme, openPopup, icon, buttonText }) => {
  return (
    <BtnCustom
      textTransform={'capitalize'}
      borderWidth="0"
      height={'100%'}
      padding={'1.2rem 0 1.2rem 1rem'}
      style={{ justifyContent: 'flex-start' }}
      btnWidth="100%"
      onClick={openPopup}
    >
      <img
        src={icon}
        alt={buttonText}
        style={{ marginRight: '1rem', width: '2rem', height: '2rem' }}
      />
      <GreyTitle theme={theme}>{buttonText}</GreyTitle>
    </BtnCustom>
  );
};

const AccountsSelector = ({
  accountNameSize = '2.4rem',
  isFromPopup = false,
}: {
  accountNameSize?: string;
  isFromPopup?: boolean;
}) => {
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [
    isAddHardwareWalletDialogOpen,
    setIsAddHardwareWalletDialogOpen,
  ] = useState(false);
  const [isExportMnemonicOpen, setIsExportMnemonicOpen] = useState(false);
  const [isExportAccountOpen, setIsExportAccountOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isMergeAccountsOpen, setIsMergeAccoutsOpen] = useState(false);
  const [isManageConnectiosOpen, setIsManageConnectiosOpen] = useState(false);

  const theme = useTheme();
  const {
    accounts,
    hardwareWalletAccount,
    setHardwareWalletAccount,
    setWalletSelector,
    addAccount,
  } = useWalletSelector();

  const accountsToShow = hardwareWalletAccount
    ? accounts.concat(hardwareWalletAccount)
    : accounts;
  const selectedAccount = accounts.find((a) => a.isSelected);

  return (
    <RowWithSelector isFromPopup={isFromPopup}>
      <Title
        fontSize={accountNameSize}
        fontFamily="Avenir Next Demi"
        style={{
          textTransform: 'capitalize',
          marginRight: '1rem',
          whiteSpace: 'nowrap',
        }}
      >
        {selectedAccount && selectedAccount.name}
      </Title>
      <ExpandMoreIcon fontSize="large" />

      <StyledCard isFromPopup={isFromPopup} id="accountSelector">
        <RowContainer align="flex-start" direction="column" padding="1.6rem 0">
          <RowContainer padding="0 1.6rem" margin="1rem 0 0 0">
            <Title
              fontFamily="Avenir Next Demi"
              fontSize="1.4rem"
              style={{ whiteSpace: 'nowrap', paddingRight: '1rem' }}
            >
              Your Accounts
            </Title>
            <Legend />
          </RowContainer>
          <RowContainer
            style={{
              display: 'block',
              borderBottom: theme.customPalette.border.new,
              maxHeight: '30rem',
              overflowY: 'auto',
            }}
            direction="column"
            margin="0 0 1rem 0"
            padding="0 1.6rem 0rem 1.6rem"
          >
            {accountsToShow.map(({ isSelected, name, selector }, i) => {
              return (
                <RowContainer
                  key={`${name}-${i}`}
                  direction="row"
                  align={'center'}
                  justify={isFromPopup ? 'flex-start' : 'space-between'}
                  padding=".5rem 1.6rem .5rem 0"
                  style={{
                    cursor: 'pointer',
                    borderBottom:
                      accounts.length === i + 1
                        ? 'none'
                        : theme.customPalette.border.new,
                  }}
                  onClick={() => {
                    if (!isSelected) {
                      setWalletSelector(selector);
                    }
                  }}
                >
                  <Row justify="flex-start">
                    <StyledRadio theme={theme} checked={isSelected} />
                    <Title
                      style={{
                        width: '100%',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis ',
                      }}
                    >
                      {name && name.length > 14
                        ? name.slice(0, 10) + '...'
                        : name}
                    </Title>
                  </Row>
                  {!isFromPopup && (
                    <Row>
                      <ExportPrivateKeyButton
                        btnWidth="auto"
                        textTransform="capitalize"
                        color={theme.customPalette.blue.serum}
                        borderWidth="0"
                        fontFamily="Avenir Next Demi"
                        fontSize="1rem"
                        onClick={() => setIsExportAccountOpen(true)}
                      >
                        Export Private Key
                      </ExportPrivateKeyButton>
                    </Row>
                  )}
                </RowContainer>
              );
            })}
          </RowContainer>
          <RowContainer padding="0 1.6rem" direction="column">
            <WalletActionButton
              theme={theme}
              icon={AddIcon}
              buttonText={'Add Account'}
              openPopup={() => setIsAddAccountOpen(true)}
            />
            <WalletActionButton
              theme={theme}
              icon={ImportHardwareIcon}
              buttonText={'Import Hardware Wallet'}
              openPopup={() => setIsAddHardwareWalletDialogOpen(true)}
            />
            <WalletActionButton
              theme={theme}
              icon={MergeAccountsIcon}
              buttonText={'Merge Accounts'}
              openPopup={() => setIsMergeAccoutsOpen(true)}
            />
            <WalletActionButton
              theme={theme}
              icon={ExportMnemonicIcon}
              buttonText={'Export Seed Phrase'}
              openPopup={() => setIsExportMnemonicOpen(true)}
            />
            {/* {isExtension && ( */}
            <WalletActionButton
              theme={theme}
              icon={ManageConnections}
              buttonText={'View Connected Sites'}
              openPopup={() => {
                setIsManageConnectiosOpen(true);
              }}
            />
            {/* )} */}

            <WalletActionButton
              theme={theme}
              icon={DeleteAccountIcon}
              buttonText={'Forget wallet for this device'}
              openPopup={() => setIsDeleteAccountOpen(true)}
            />
          </RowContainer>
        </RowContainer>
      </StyledCard>

      <AddAccountPopup
        open={isAddAccountOpen}
        onAdd={({ name, importedAccount }) => {
          addAccount({ name, importedAccount });
          setWalletSelector({
            walletIndex: importedAccount
              ? undefined
              : accounts.filter((acc) => acc.selector.walletIndex !== undefined)
                  .length,
            importedPubkey: importedAccount
              ? importedAccount.publicKey.toString()
              : undefined,
            ledger: false,
          });
          setIsAddAccountOpen(false);
        }}
        onClose={() => setIsAddAccountOpen(false)}
      />

      <AddHardwareWalletPopup
        open={isAddHardwareWalletDialogOpen}
        onClose={() => setIsAddHardwareWalletDialogOpen(false)}
        onAdd={({ publicKey, derivationPath, account, change }) => {
          setHardwareWalletAccount({
            name: 'Hardware wallet',
            publicKey,
            importedAccount: publicKey.toString(),
            ledger: true,
            derivationPath,
            account,
            change,
          });
          setWalletSelector({
            walletIndex: undefined,
            importedPubkey: publicKey.toString(),
            ledger: true,
            derivationPath,
            account,
            change,
          });
        }}
      />
      <MergeAccountsDialog
        open={isMergeAccountsOpen}
        onClose={() => setIsMergeAccoutsOpen(false)}
      />
      <ExportMnemonicDialog
        open={isExportMnemonicOpen}
        onClose={() => setIsExportMnemonicOpen(false)}
      />
      <ExportAccount
        open={isExportAccountOpen}
        onClose={() => setIsExportAccountOpen(false)}
      />
      <ForgetWallet
        open={isDeleteAccountOpen}
        openExportMnemonicPopup={() => setIsExportMnemonicOpen(true)}
        onClose={() => setIsDeleteAccountOpen(false)}
      />
      <ConnectionsPage
        theme={theme}
        close={setIsManageConnectiosOpen}
        open={isManageConnectiosOpen}
      />
    </RowWithSelector>
  );
};

export default AccountsSelector;
