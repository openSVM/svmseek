import React from 'react';
import styled from 'styled-components';

import { Row, RowContainer } from '../../pages/commonStyles';
import Warning from '../../images/newWarning.svg';
import { BtnCustom } from '../BtnCustom';
import DialogForm from '../../pages/Wallet/components/DialogForm';
import { useTheme, Paper } from '@mui/material';

export const StyledPaper = styled(({ ...props }) => <Paper {...props} />)`
  height: auto;
  padding: 2rem 4rem;
  width: 55rem;
  box-shadow: 0px 0px 0.8rem 0px rgba(0, 0, 0, 0.45);
  background: #222429;
  border-radius: 0.8rem;
`;

const BoldHeader = styled.h1`
  font-family: Avenir Next Bold;
  font-size: 2.5rem;
  letter-spacing: -1.04615px;
  color: #f5f5fb;
`;

export type TextProps = {
  fontSize?: string;
  paddingBottom?: string;
  fontFamily?: string;
  color?: string;
};

export const Text = styled.span<TextProps>`
  font-size: ${(props) => props.fontSize || '1.5rem'};
  padding-bottom: ${(props) => props.paddingBottom || ''};
  text-transform: none;
  font-family: ${(props) => props.fontFamily || 'Avenir Next Medium'};
  color: ${(props) => props.color || '#ecf0f3'};
`;

export type BlueButtonProps = {
  isUserConfident?: boolean;
  showLoader?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  theme?: any;
};

const BlueButton = styled(
  ({ isUserConfident, showLoader, children, onClick, style, theme, ...props }: BlueButtonProps) => (
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
      style={style}
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

export const DevUrlPopup = ({
  open,
  close,
}: {
  open: boolean;
  close: () => void;
}) => {
  const theme = useTheme();

  document.addEventListener('keydown', function (event) {
    if (event.code === 'KeyB' && (event.ctrlKey || event.metaKey)) {
      close();
    }
  });

  return (
    <DialogForm
      theme={theme}
      PaperComponent={StyledPaper}
      fullScreen={false}
      onClose={() => {}}
      maxWidth={'md'}
      open={open}
      aria-labelledby="responsive-dialog-title"
    >
      <Row justify={'space-between'} width={'100%'}>
        <BoldHeader>Warning!</BoldHeader>
        <img
          alt="Warning."
          
          src={Warning}
          onClick={close}
        />
      </Row>
      <RowContainer margin={'3rem 0'} align={'start'} direction={'column'}>
        <BoldHeader >
          Hello, this page is for developers only.
        </BoldHeader>
        <Text>
          To avoid loss of funds or confusing situations, please leave it. You
          probably wanted to get to
          <a
            style={{
              padding: '0 0 0 0.5rem',
              color: '#53DF11',
              textDecoration: 'none',
            }}
            target="_blank"
            rel="noopener noreferrer"
            href={'https://svmseek.com'}
          >
            svmseek.com{' '}
          </a>
          .
        </Text>
      </RowContainer>
      <RowContainer justify="space-between" margin={'3rem 0 2rem 0'}>
        <a
          
          target="_blank"
          rel="noopener noreferrer"
          href={'https://svmseek.com'}
        >
          {' '}
          <BlueButton
            isUserConfident={true}
            theme={theme}
            onClick={() => {}}
          >
            Go to svmseek.com
          </BlueButton>
        </a>
      </RowContainer>
    </DialogForm>
  );
};
