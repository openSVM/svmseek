import React from 'react';
import styled from 'styled-components';

import { Row, RowContainer } from '../pages/commonStyles';
import { BtnCustom } from '../components/BtnCustom';
import DialogForm from '../pages/Wallet/components/DialogForm';
import { useTheme, Paper } from '@mui/material';
import SunLogo from '../images/SunLogo.svg';

export const StyledPaper = styled(({ ...props }) => <Paper {...props} />)`
  height: auto;
  padding: var(--spacing-lg) var(--spacing-xxl);
  width: 65rem;
  box-shadow: var(--shadow-xl);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
`;

const BoldHeader = styled.h1`
  font-family: var(--font-display);
  font-size: var(--font-size-xxl);
  letter-spacing: -1.04615px;
  color: var(--text-primary);
`;

type TextProps = {
  fontSize?: string;
  paddingBottom?: string;
  fontFamily?: string;
  color?: string;
};

const Text = styled.span<TextProps>`
  font-size: ${(props) => props.fontSize || 'var(--font-size-md)'};
  padding-bottom: ${(props) => props.paddingBottom || ''};
  text-transform: none;
  font-family: ${(props) => props.fontFamily || 'var(--font-primary)'};
  color: ${(props) => props.color || 'var(--text-primary)'};
`;

type BlueButtonProps = {
  isUserConfident?: boolean;
  showLoader?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
};

const BlueButton = styled(
  ({ isUserConfident, showLoader, children, onClick, ...props }: BlueButtonProps) => (
    <BtnCustom
      btnWidth="100%"
      height="4.5rem"
      fontSize="1.4rem"
      textTransform="capitalize"
      backgroundColor="#651CE4"
      borderRadius="1rem"
      borderColor="none"
      btnColor="#fbf2f2"
      border="none"
      hoverBackground="#651CE4"
      onClick={onClick}
      {...props}
    >
      {children}
    </BtnCustom>
  ),
)<BlueButtonProps>`
  font-size: 1.4rem;
  height: 4.5rem;
  text-transform: capitalize;
  background-color: #651CE4;
  border-radius: 1rem;
  border-color: none;
  cursor: pointer;
  color: #fbf2f2;
  border: none;
  &:hover {
    background-color: #651CE4;
  }
`;

export const MigrationToNewUrlPopup = ({
  open,
  close,
}: {
  open: boolean;
  close: () => void;
}) => {
  const theme = useTheme();

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
      <Row justify={'space-between'} width={'100%'}>
        <BoldHeader>CCAI Wallet is SunWallet now!</BoldHeader>
        <img
          alt="Warning."

          src={SunLogo}
        />
      </Row>
      <RowContainer margin={'3rem 0'} align={'start'} direction={'column'}>
        <Text >
          Our wallet has changed its name and moved to a new domain:
          SunWallet.io
        </Text>
        <Text >
          For old users almost nothing will change, your accounts and seed
          phrases will remain the same. The old domain will redirect to the new
          domain.
        </Text>
        <Text >
          Stay tuned for more updates! Let’s build the best DeFi experience
          together!
        </Text>
      </RowContainer>
      <RowContainer justify="flex-start" margin={'3rem 0 2rem 0'}>
        {' '}
        <BlueButton
          isUserConfident={true}
          theme={theme}
          onClick={() => {
            close();
            localStorage.setItem('isMigrationToNewUrlPopupDone', 'true');
          }}
        >
          {' '}
          Got it!
        </BlueButton>
      </RowContainer>
    </DialogForm>
  );
};
