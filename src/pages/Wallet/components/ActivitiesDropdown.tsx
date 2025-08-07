import React from 'react';
import styled from 'styled-components';
// import { BtnCustom } from '../../../components/BtnCustom';
import {
  RowContainer,
  Card,
  VioletButton,
  //   Title,
  //   StyledRadio,
  //   Row,
  //   Legend,
} from '../../commonStyles';

import BlueExplorer from '../../../images/blueExplorer.svg';
import TradeIcon from '../../../images/trade.svg';
import Receive from '../../../images/ReceiveIcon.svg';
import Send from '../../../images/Union.svg';

const StyledCard = styled(({ isFromPopup, ...props }) => <Card {...props} />)`
  position: absolute;
  top: 100%;
  ${(props) => (props.isFromPopup ? 'right: 0' : 'left: 0')};
  width: 28rem;
  height: auto;
  display: none;
  z-index: 2;
`;

const StyledTd = styled.div`
  padding-top: 1rem;
  padding-bottom: 1rem;
`;

const ActivitiesStyledCard = styled(StyledCard)`
  width: 17rem;
  left: -12rem;
  top: 2rem;
  border: 0.1rem solid #3a475c;
  box-shadow: 0px 0px 16px rgba(125, 125, 131, 0.1);
`;

const ButtonsContainer = styled(RowContainer)`
  flex-direction: column;
  justify-content: center;
  aling-items: flex-start;
`;

const ActivitiesDropdown = ({
  theme,
  urlSuffix,
  selectToken,
  setSendDialogOpen,
  setDepositDialogOpen,
  publicKey,
  tokenSymbol,
  tokensData,
  quote,
}) => {
  return (
    <ActivitiesStyledCard>
      <RowContainer>
        <RowContainer padding="0 1.6rem" direction="column">
          <StyledTd

          >
            <ButtonsContainer>
              <VioletButton
                theme={theme}
                hoverBackground={'rgba(255, 255, 255, 0.08)'}
                backgroundColor={'transparent'}
                style={{
                  width: '100%',
                  padding: '0 0.5rem',
                  height: '5rem',
                  border: 'none',
                  color: '#f5fbfb',
                  justifyContent: 'end',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => {
                  selectToken();
                  setDepositDialogOpen(true);
                }}
              >
                <img
                  src={Receive}
                  alt="receive"

                />
                <span>Receive</span>
              </VioletButton>

              <VioletButton
                theme={theme}
                backgroundColor={'transparent'}
                hoverBackground={'rgba(255, 255, 255, 0.08)'}
                style={{
                  width: '100%',
                  height: '5rem',
                  border: 'none',
                  padding: '0 0.5rem',
                  color: '#f5fbfb',
                  justifyContent: 'end',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => {
                  selectToken();
                  setSendDialogOpen(true);
                }}
              >
                <img src={Send} alt="send"  />
                Send
              </VioletButton>

              <VioletButton
                hoverBackground={'rgba(255, 255, 255, 0.08)'}
                backgroundColor={'transparent'}
                theme={theme}
                component="a"
                target="_blank"
                rel="noopener"
                href={
                  `https://solanabeach.io/address/${publicKey.toBase58()}` +
                  urlSuffix
                }
                style={{
                  width: '100%',
                  height: '5rem',
                  padding: '0 0.5rem',
                  border: 'none',
                  color: '#f5fbfb',
                  justifyContent: 'end',
                  whiteSpace: 'nowrap',
                }}
              >
                <img
                  src={BlueExplorer}
                  alt="Explorer Icon"

                />
                View Explorer
              </VioletButton>
              <VioletButton
                hoverBackground={'rgba(255, 255, 255, 0.08)'}
                backgroundColor={'transparent'}
                theme={theme}
                component="a"
                target="_blank"
                disabled={
                  !tokensData ||
                  !tokensData.has(`${tokenSymbol?.toUpperCase()}`)
                }
                rel="noopener"
                href={`https://svmseek.com/chart/spot/${tokenSymbol?.toUpperCase()}_${quote}#connect_wallet`}
                style={{
                  width: '100%',
                  height: '5rem',
                  padding: '0 0.5rem',
                  border: 'none',
                  color: '#f5fbfb',
                  justifyContent: 'end',
                  whiteSpace: 'nowrap',
                }}
              >
                {' '}
                <img
                  src={TradeIcon}
                  alt="trade"

                />
                Trade
              </VioletButton>
            </ButtonsContainer>
          </StyledTd>
        </RowContainer>
      </RowContainer>
    </ActivitiesStyledCard>
  );
};

export default ActivitiesDropdown;
