import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Body, RowContainer } from '../commonStyles';
import Helmet from 'react-helmet';

// import Logo from '../../components/Logo';

import ProgressBar from './components/ProgressBar';
import SaveSeedPhrase from './components/SaveSeedPhrase';
import ConfirmSeedPhrase from './components/ConfirmSeedPhrase';
import AddTokens from './components/AddTokens';
import Warning from './components/Warning';
import { devLog } from '../../utils/logger';
import {
  generateMnemonicAndSeed,
  useHasLockedMnemonicAndSeed,
  storeMnemonicAndSeed,
} from '../../utils/wallet-seed';
import { useCallAsync } from '../../utils/notifications';
import { DERIVATION_PATH } from '../../utils/walletProvider/localStorage';


const MainRow = styled(RowContainer)`
  @media (max-width: 540px) {
    overflow-x: auto;
    height: 80%;
  }
`;

export const CreateWalletPage = () => {
  const [currentStep, setCurrentStep] = useState(1); // Start at step 1 (SaveSeedPhrase)
  const [isConfirmSeedPhrase, setIsConfirmSeedPhrase] = useState(false);

  const [mnemonicAndSeed, setMnemonicAndSeed] = useState<{
    mnemonic: string;
    seed: string;
  }>({ mnemonic: '', seed: '' });

  const [hasLockedMnemonicAndSeed] = useHasLockedMnemonicAndSeed();

  useEffect(() => {
    if (hasLockedMnemonicAndSeed) {
      setCurrentStep(0);
    }
    generateMnemonicAndSeed().then((seedAndMnemonic) => {
      setMnemonicAndSeed(seedAndMnemonic);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const callAsync = useCallAsync();

  const submit = async (onSuccess) => {
    const { mnemonic, seed } = mnemonicAndSeed;
    await callAsync(
      storeMnemonicAndSeed(
        mnemonic,
        seed,
        null, // No password required
        DERIVATION_PATH.bip44Change,
      ),
      {
        progressMessage: 'Creating wallet...',
        successMessage: 'Wallet created',
        onError: () => {},
        onSuccess,
      },
    );
  };
  devLog('currentStep', currentStep);
  return (
    <Body>
      <Helmet>
        <title>Create new SVMSeek Wallet</title>
      </Helmet>
      {/* Removed FakeInputs - no password functionality needed */}
      <RowContainer height={'100%'} direction={'column'}>
        {/* <Logo
          currentStep={
            currentStep === 0 || currentStep === 1 || currentStep === 2
          }
        /> */}
        <MainRow direction={'column'}>
          {/* margin={currentStep !== 0 ? '0 0 3rem 0' : '0 0 8rem 0'} */}
          {currentStep !== 0 && <ProgressBar currentStep={currentStep} />}

          {currentStep === 0 ? (
            <Warning onSubmit={() => setCurrentStep(1)} />
          ) : currentStep === 1 && !isConfirmSeedPhrase ? (
            <SaveSeedPhrase
              seedPhrase={mnemonicAndSeed.mnemonic}
              setIsConfirmSeedPhrase={setIsConfirmSeedPhrase}
            />
          ) : currentStep === 1 && isConfirmSeedPhrase ? (
            <ConfirmSeedPhrase
              seedPhrase={mnemonicAndSeed.mnemonic
                .split(' ')
                .slice(0, 12)
                .join(' ')}
              setCurrentStep={setCurrentStep}
              setIsConfirmSeedPhrase={setIsConfirmSeedPhrase}
              createWallet={submit}
            />
          ) : (
            <AddTokens />
          )}
        </MainRow>
      </RowContainer>
    </Body>
  );
};
