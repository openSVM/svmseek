import React, { useState } from 'react';
import DialogForm from './DialogForm';
import { useWallet } from '../../../utils/wallet';
import { checkIsCorrectPassword } from '../../../utils/wallet-seed';
import { Row, RowContainer, Title, VioletButton } from '../../commonStyles';
import { InputWithEye, TextareaWithCopy } from '../../../components/Input';
import { useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useCallAsync } from '../../../utils/notifications';
import { BtnCustom } from '../../../components/BtnCustom';

export default function ExportAccountDialog({ open, onClose }) {
  const wallet = useWallet();
  const theme = useTheme();
  const callAsync = useCallAsync();

  const [isHidden, setIsHidden] = useState(true);
  const [password, setPassword] = useState('');
  const [keyOutput, setKeyOutput] = useState('');

  const submit = () => {
    callAsync(checkIsCorrectPassword(password), {
      progressMessage: undefined,
      successMessage: undefined,
      onSuccess: () => {
        setKeyOutput(`[${Array.from(wallet.provider.account.secretKey)}]`);
      },
      onError: () => {},
    });
  };

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      submit();
    }
  };

  return (
    <DialogForm
      open={open}
      onClose={onClose}
      height="auto"
      padding="2rem 0"
      onEnter={() => {
        setPassword('');
        setKeyOutput('');
      }}
    >
      <BtnCustom
        borderRadius="50%"
        borderWidth="0"
        style={{
          position: 'absolute',
          width: '3rem',
          height: '3rem',
          right: '2rem',
          top: '2rem',
          color: var(--error-main),
        }}
        onClick={onClose}
      >
        <CloseIcon  />
      </BtnCustom>
      <RowContainer width="90%" justify="flex-start" margin="2rem 0">
        <Title>
          Enter your password to unlock the private key for this account
        </Title>
      </RowContainer>

      <RowContainer width="90%" justify={'space-between'} margin="0 0 2rem 0">
        <Row width="calc(70% -.5rem)">
          <InputWithEye
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={'Password'}
            onEyeClick={() => setIsHidden(!isHidden)}
            type={isHidden ? 'password' : 'text'}
            showPassword={!isHidden}
            onKeyDown={handleKeyDown}
            containerStyle={{ width: '100%' }}
          />
        </Row>
        <VioletButton
          theme={theme}
          width={'calc(30% - .5rem)'}
          onClick={() => submit()}
        >
          Confirm
        </VioletButton>
      </RowContainer>

      <RowContainer width="90%">
        <TextareaWithCopy
          value={keyOutput}
          height={'17.2rem'}
          placeholder={'***'}
          
        />
      </RowContainer>
    </DialogForm>
  );
}

export function ExportMnemonicDialog({ open, onClose }) {
  // for export no need for password
  const [isHidden, setIsHidden] = useState(true);
  const [password, setPassword] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const theme = useTheme();
  const callAsync = useCallAsync();

  const submit = () => {
    callAsync(checkIsCorrectPassword(password), {
      onSuccess: (res) => {
        const { mnemonic } = res as { mnemonic: string; seed: string; derivationPath: string };
        setMnemonic(mnemonic);
      },
      onError: () => {},
      progressMessage: undefined,
      successMessage: undefined,
    });
  };

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      submit();
    }
  };

  return (
    <DialogForm
      open={open}
      onClose={onClose}
      height="auto"
      padding="2rem 0"
      onEnter={() => {
        setMnemonic('');
        setPassword('');
      }}
    >
      <BtnCustom
        borderRadius="50%"
        borderWidth="0"
        style={{
          position: 'absolute',
          width: '3rem',
          height: '3rem',
          right: '2rem',
          top: '2rem',
          color: var(--error-main),
        }}
        onClick={onClose}
      >
        <CloseIcon  />
      </BtnCustom>
      <RowContainer width="90%" justify="flex-start" margin="2rem 0">
        <Title>
          Enter your password to unlock the seed phrase for this wallet
        </Title>
      </RowContainer>

      <RowContainer width="90%" justify={'space-between'} margin="0 0 2rem 0">
        <Row width="calc(70% -.5rem)">
          <InputWithEye
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={'Password'}
            onEyeClick={() => setIsHidden(!isHidden)}
            onKeyDown={handleKeyDown}
            type={isHidden ? 'password' : 'text'}
            showPassword={!isHidden}
            containerStyle={{ width: '100%' }}
          />
        </Row>
        <VioletButton
          theme={theme}
          width={'calc(30% - .5rem)'}
          onClick={() => submit()}
        >
          Confirm
        </VioletButton>
      </RowContainer>

      <RowContainer width="90%">
        <TextareaWithCopy
          value={mnemonic}
          height={'11.4rem'}
          placeholder={'***'}
          
        />
      </RowContainer>
    </DialogForm>
  );
}
