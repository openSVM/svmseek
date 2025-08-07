import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Navigate } from 'react-router-dom';

import AccountInfo from './components/AccountInfo';
import AssetsTable from './components/AssetsTable';
import ActivityTable from './components/ActivityTable';
import SendDialog from './components/SendPopup';
import ReceiveDialog from './components/ReceivePopup';
import AddTokenDialog from './components/AddTokenPopup';
import WalletGroupManager from './components/WalletGroupManager';
import ChatInterface from '../../components/ChatInterface';
import { ExplorerInterface } from '../../components/Explorer';
import WebBrowser from '../../components/WebBrowser';
import { SVMPayInterface } from '../../components/SVMPay';
import { AEANetworkInterface } from '../../components/AEANetwork';
import VaultAccessButton from '../../components/VaultAccessButton';

import { RowContainer } from '../commonStyles';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '../../utils/wallet';
import { getAllTokensData, TokenInfo, useInterval } from '../../utils/utils';
import { TokensDataSingleton } from '../../components/TokensDataSingleton';
import { useConnection } from '../../utils/connection';
import { useTokenInfosMap } from '../../utils/tokens/names';
import CloseTokenAccountDialog from './components/CloseTokenAccountPopup';
import { MultiAccountManager } from '../../services/MultiAccountManager';

const MainWalletContainer = styled(RowContainer)`
  flex-direction: column;
  height: 100%;
  padding: 0 3rem 3rem 3rem;
  @media (max-width: 540px) {
    padding: 0;
  }
`;

const Switcher = styled.button<{ isTabActive?: boolean }>`
  display: none;

  @media (max-width: 540px) {
    outline: none;
    display: block;
    width: 20%;
    color: ${(props) => (props.isTabActive ? ' #f5f5fb' : '#96999C')};
    background: none;
    font-family: 'Avenir Next Demi';
    height: 4rem;
    cursor: pointer;
    border: none;
    border-bottom: ${(props) =>
      props.isTabActive ? '0.2rem solid #f5f5fb' : '0.2rem solid #96999C'};
  }
`;

const SwitcherRow = styled(RowContainer)`
  display: none;

  @media (max-width: 540px) {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
  }
`;

const TableContainer = styled(RowContainer)`
  max-height: 80%;
  height: 100%;
  justify-content: space-between;

  @media (max-width: 540px) {
    height: 60%;
    flex-direction: column;
  }
`;

const Wallet = () => {
  const wallet = useWallet();
  const connection = useConnection();
  const [multiAccountManager, setMultiAccountManager] = useState<MultiAccountManager | null>(null);

  const [selectedTokenData, selectToken] = useState<{
    publicKey: PublicKey;
    isAssociatedToken: boolean;
  }>({
    publicKey: wallet.publicKey,
    isAssociatedToken: false,
  });
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [
    closeTokenAccountDialogOpen,
    setCloseTokenAccountDialogOpen,
  ] = useState(false);

  const hash = sessionStorage.getItem('hash');
  const [showAddTokenDialog, setShowAddTokenDialog] = useState(
    hash === '#add_token_to_rebalance',
  );
  const [activeTab, setTabActive] = useState('assets');

  const tokenInfosMap = useTokenInfosMap();
  const [refreshCounter, changeRefreshCounter] = useState(0);
  const [tokensData, setTokensData] = useState<Map<string, number>>(new Map());

  // Initialize MultiAccountManager
  useEffect(() => {
    if (connection && !multiAccountManager) {
      const manager = new MultiAccountManager(connection);
      setMultiAccountManager(manager);

      // Add current wallet to manager if not already there
      manager.importWallet(
        wallet.publicKey,
        'Main Wallet',
        'derived',
        []
      ).catch(console.error);
    }
  }, [connection, wallet.publicKey, multiAccountManager]);

  // Cleanup MultiAccountManager on unmount
  useEffect(() => {
    return () => {
      if (multiAccountManager) {
        multiAccountManager.dispose();
      }
    };
  }, [multiAccountManager]);
  const [allTokensData, setAllTokensData] = useState<Map<string, TokenInfo>>(
    new Map(),
  );

  const walletPubkey = wallet?.publicKey?.toString();
  const refreshTokensData = () => changeRefreshCounter(refreshCounter + 1);
  const isTokenSelected =
    allTokensData.get(selectedTokenData.publicKey.toString()) &&
    selectedTokenData.publicKey;

  useInterval(refreshTokensData, 5 * 1000);

  useEffect(() => {
    const getData = async () => {
      const data = await TokensDataSingleton.getData();
      const allTokensInfo = await getAllTokensData(
        new PublicKey(walletPubkey),
        connection,
        tokenInfosMap,
      );

      setTokensData(data);
      setAllTokensData(allTokensInfo);
    };

    getData();
    // eslint-disable-next-line
  }, [
    connection,
    walletPubkey,
    // eslint-disable-next-line
    JSON.stringify([...tokenInfosMap.entries()]),
    refreshCounter,
  ]);

  return (
    <MainWalletContainer data-testid="wallet-interface">
      {window.opener && <Navigate to={'/connect_popup'} replace />}
      <AccountInfo tokensData={tokensData} allTokensData={allTokensData} />
      <TableContainer>
        <SwitcherRow>
          <Switcher
            isTabActive={activeTab === 'assets'}
            onClick={() => {
              setTabActive('assets');
            }}
          >
            Assets
          </Switcher>
          <Switcher
            isTabActive={activeTab === 'activity'}
            onClick={() => {
              setTabActive('activity');
            }}
          >
            Activity
          </Switcher>
          <Switcher
            isTabActive={activeTab === 'multiAccount'}
            onClick={() => {
              setTabActive('multiAccount');
            }}
          >
            Multi-Account
          </Switcher>
          <Switcher
            isTabActive={activeTab === 'chat'}
            onClick={() => {
              setTabActive('chat');
            }}
          >
            AI Chat
          </Switcher>
          <Switcher
            isTabActive={activeTab === 'explorer'}
            onClick={() => {
              setTabActive('explorer');
            }}
          >
            Explorer
          </Switcher>
          <Switcher
            isTabActive={activeTab === 'browser'}
            onClick={() => {
              setTabActive('browser');
            }}
          >
            Browser
          </Switcher>
          <Switcher
            isTabActive={activeTab === 'svmpay'}
            onClick={() => {
              setTabActive('svmpay');
            }}
          >
            SVM-Pay
          </Switcher>
          <Switcher
            isTabActive={activeTab === 'aea'}
            onClick={() => {
              setTabActive('aea');
            }}
          >
            AEA
          </Switcher>
        </SwitcherRow>

        <AssetsTable
          isActive={activeTab === 'assets'}
          tokensData={tokensData}
          allTokensData={allTokensData}
          refreshTokensData={refreshTokensData}
          selectToken={selectToken}
          setSendDialogOpen={setSendDialogOpen}
          setDepositDialogOpen={setDepositDialogOpen}
          setShowAddTokenDialog={setShowAddTokenDialog}
          setCloseTokenAccountDialogOpen={setCloseTokenAccountDialogOpen}
        />

        <ActivityTable
          isActive={activeTab === 'activity'}
          multiAccountManager={multiAccountManager}
          walletId={`wallet_${wallet.publicKey.toBase58()}`}
        />

        {activeTab === 'multiAccount' && multiAccountManager && (
          <div  className="fade-in">
            <WalletGroupManager multiAccountManager={multiAccountManager} />
          </div>
        )}

        {activeTab === 'chat' && (
          <div  className="fade-in">
            <ChatInterface />
          </div>
        )}

        {activeTab === 'explorer' && (
          <div  className="fade-in">
            <ExplorerInterface isActive={true} />
          </div>
        )}

        {activeTab === 'browser' && (
          <div  className="fade-in">
            <WebBrowser isActive={true} />
          </div>
        )}

        {activeTab === 'svmpay' && (
          <div  className="fade-in">
            <SVMPayInterface isActive={true} />
          </div>
        )}

        {activeTab === 'aea' && (
          <div  className="fade-in">
            <AEANetworkInterface isActive={true} />
          </div>
        )}
      </TableContainer>
      {isTokenSelected && (
        <SendDialog
          open={sendDialogOpen}
          balanceInfo={allTokensData.get(
            selectedTokenData.publicKey.toString(),
          )}
          refreshTokensData={refreshTokensData}
          onClose={() => setSendDialogOpen(false)}
          publicKey={selectedTokenData.publicKey}
        />
      )}
      {isTokenSelected && (
        <ReceiveDialog
          open={depositDialogOpen}
          onClose={() => setDepositDialogOpen(false)}
          isAssociatedToken={selectedTokenData.isAssociatedToken}
          publicKey={selectedTokenData.publicKey}
        />
      )}

      <AddTokenDialog
        open={showAddTokenDialog}
        allTokensData={allTokensData}
        balanceInfo={allTokensData.get(wallet.publicKey.toString())}
        refreshTokensData={refreshTokensData}
        onClose={() => setShowAddTokenDialog(false)}
      />
      {/* <TokenInfoDialog
        open={tokenInfoDialogOpen}
        onClose={() => setTokenInfoDialogOpen(false)}
        publicKey={selectedPublicKey}
      /> */}
      {isTokenSelected && (
        <CloseTokenAccountDialog
          open={closeTokenAccountDialogOpen}
          onClose={() => setCloseTokenAccountDialogOpen(false)}
          publicKey={selectedTokenData.publicKey}
          refreshTokensData={refreshTokensData}
          balanceInfo={allTokensData.get(
            selectedTokenData.publicKey.toString(),
          )}
        />
      )}

      {/* Floating Vault Access Button */}
      <VaultAccessButton />
    </MainWalletContainer>
  );
};

export default Wallet;
