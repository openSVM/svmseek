import React from 'react';
import styled from 'styled-components';
import { useTheme } from '@mui/material';

import copy from 'clipboard-copy';
import GlassContainer from '../../../components/GlassContainer';

import { useBalanceInfo, useWallet } from '../../../utils/wallet';
import { Row, RowContainer, Title, ExclamationMark } from '../../commonStyles';
import {
  abbreviateAddress,
  formatNumberToUSFormat,
  stripDigitPlaces,
  TokenInfo,
} from '../../../utils/utils';

import AccountsSelector from './AccountsSelector';
import TotalBalance from './TotalBalance';
import { useSnackbar } from 'notistack';
import { PublicKey } from '@solana/web3.js';

const MobilePublicKeyTitle = styled(Title)`
  display: none;
  white-space: nowrap;

  @media (max-width: 540px) {
    display: inline;
  }
`;

const DesktopPublicKeyTitle = styled(Title)`
  display: inline;
  white-space: nowrap;
  @media (max-width: 540px) {
    display: none;
  }
`;

const AccountInfoContainer = styled(RowContainer)`
  width: 100%;
  height: auto;
  padding: 5rem 4rem;

  @media (max-width: 540px) {
    height: 40%;
    flex-direction: column;
    padding: 0 0 3rem 0;
  }
`;

const AccountInfoSubContainer = styled(Row)`
  width: 40%;
  height: 100%;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;

  @media (max-width: 540px) {
    width: 100%;
    padding: 5rem 3rem;
  }
`;

const AccountInfoFirstContainer = styled(RowContainer)`
  @media (max-width: 540px) {
    border-bottom: 0.1rem solid #3a475c;
  }
`;

const Instruction = styled(({ showOnMobile, ...props }) => <Row {...props} />)`
  display: ${(props) => (props.showOnMobile ? 'none' : 'flex')};
  height: 100%;

  @media (max-width: 540px) {
    display: ${(props) => (props.showOnMobile ? 'flex' : 'none')};
    height: 50%;
    padding-right: 3rem;
  }
`;

const Balances = styled(Row)`
  width: 60%;
  height: 100%;
  justify-content: flex-end;
  @media (max-width: 540px) {
    width: 100%;
    margin-top: 3rem;
    padding: 0 3rem;
  }
`;

const BalanceCard = styled(({ needLeftMargin, ...props }) => (
  <GlassContainer {...props} />
))`
  display: flex;
  width: 26rem;
  height: 100%;
  margin: ${(props) => props.margin || '0 4rem 0 0'};
  padding: 1rem 1.5rem;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  background: ${(props) =>
    props.background || 'linear-gradient(135deg, rgba(19, 49, 173, 0.8) 0%, rgba(59, 141, 23, 0.8) 100%) !important'};
  border-radius: 1.2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 540px) {
    margin: 0;
    width: 48%;
    height: 8rem;
    border-radius: 2rem;
    margin-left: ${(props) => (props.needLeftMargin ? '4%' : 0)};
  }
`;

const InstructionTitle = styled(Title)`
  white-space: nowrap;
  @media (max-width: 540px) {
    font-size: 1.3rem;
  }
`;

const CopyButton = styled(Title).attrs({
  as: 'button'
})`
  margin-left: 2rem;
  color: var(--interactive-primary);
  cursor: pointer;
  background: none;
  border: none;
  font-family: inherit;
  font-size: inherit;
  padding: 0;
`;

const InstructionsBlock = ({ theme, showOnMobile = false }) => {
  return (
    <Instruction showOnMobile={showOnMobile}>
      <Row
        height="100%"
        direction="column"
        justify="space-around"
        align="flex-start"
      >
        <InstructionTitle
          fontFamily="Avenir Next"
          fontSize="1.4rem"
          color="var(--success-main)"
        >
          SOL is the fuel for transactions on Solana.
        </InstructionTitle>
        <InstructionTitle
          fontFamily="Avenir Next"
          fontSize="1.4rem"
          color="var(--success-main)"
        >
          You must have some SOL in your wallet for
        </InstructionTitle>
        <InstructionTitle
          fontFamily="Avenir Next"
          fontSize="1.4rem"
          color="var(--success-main)"
        >
          DEX trading or other transactions.
        </InstructionTitle>
      </Row>
      <ExclamationMark
        color="var(--success-main)"
        theme={theme}
        margin={'0 0 0 2rem'}
        fontSize="7rem"
      />
    </Instruction>
  );
};

const AccountInfo = ({
  allTokensData,
  tokensData,
}: {
  allTokensData: Map<string, TokenInfo>;
  tokensData: Map<string, number>;
}) => {
  const theme = useTheme();
  const wallet = useWallet();
  const { enqueueSnackbar } = useSnackbar();

  const balanceInfo = useBalanceInfo(wallet.publicKey);
  let { amount, decimals } = balanceInfo || {
    amount: 0,
    decimals: 8,
    mint: null,
    tokenName: 'Loading...',
    tokenSymbol: '--',
  };

  const publicKey = wallet.publicKey.toBase58();

  return (
    <AccountInfoContainer>
      <AccountInfoFirstContainer justify="flex-start">
        <AccountInfoSubContainer>
          <AccountsSelector />
          <DesktopPublicKeyTitle color="var(--text-secondary)">
            {publicKey}{' '}
            <CopyButton
              onClick={() => {
                copy(publicKey);

                enqueueSnackbar('Copied!', { variant: 'success' });
              }}
            >
              Copy
            </CopyButton>
          </DesktopPublicKeyTitle>
          <MobilePublicKeyTitle
            color="var(--text-secondary)"
          >
            {abbreviateAddress(new PublicKey(publicKey))}
            <CopyButton
              onClick={() => {
                copy(publicKey);

                enqueueSnackbar('Copied!', { variant: 'success' });
              }}
            >
              Copy
            </CopyButton>
          </MobilePublicKeyTitle>
        </AccountInfoSubContainer>
        <InstructionsBlock showOnMobile theme={theme} />
      </AccountInfoFirstContainer>

      <Balances>
        <BalanceCard
          margin="0 2rem 0 0"
          background="linear-gradient(135deg, #1331AD 0%, #95363F 100%)"
        >
          <Title
            fontSize="1.4rem"
            fontFamily={'Avenir Next Demi'}
            color="var(--text-secondary)"
            maxFont={'2rem'}
          >
            Total Balance
          </Title>
          <Title
            maxFont={'2.1rem'}
            fontSize="2.4rem"
            fontFamily={'Avenir Next Demi'}
          >
            <TotalBalance
              allTokensData={allTokensData}
              tokensData={tokensData}
              key="navbarfalse"
            />
          </Title>
        </BalanceCard>
        <BalanceCard needLeftMargin>
          <Title
            fontSize="1.4rem"
            fontFamily={'Avenir Next Demi'}
            color="var(--text-secondary)"
            maxFont={'2rem'}
          >
            SOL Balance
          </Title>
          <Title
            maxFont={'2.1rem'}
            fontSize="2.4rem"
            fontFamily={'Avenir Next Demi'}
          >
            {formatNumberToUSFormat(
              stripDigitPlaces(amount / Math.pow(10, decimals), 8),
            )}{' '}
            SOL
          </Title>
        </BalanceCard>
        <InstructionsBlock theme={theme} />
      </Balances>
    </AccountInfoContainer>
  );
};

export default React.memo(AccountInfo, (prev, next) => {
  return (
    JSON.stringify([...prev.allTokensData.values()]) ===
      JSON.stringify([...next.allTokensData.values()]) &&
    JSON.stringify([...prev.tokensData.values()]) ===
      JSON.stringify([...next.tokensData.values()])
  );
});
