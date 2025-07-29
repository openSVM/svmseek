import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@mui/material';

import {
  Card,
  VioletButton,
  BoldTitle,
  RowContainer,
  WhiteButton,
} from '../../commonStyles';

import { InputWithEye } from '../../../components/Input';
import BottomLink from '../../../components/BottomLink';
import FakeInputs from '../../../components/FakeInputs';

const CreatePassword = ({
  password,
  setPassword,
  setCurrentStep,
}: {
  password: string;
  setPassword: (password: string) => void;
  setCurrentStep: (currentStep: number) => void;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const theme = useTheme();
  const isDisabled = password === '';
  const submit = () => setCurrentStep(2);

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter' && !isDisabled) {
      submit();
    }
  };

  return (
    <>
      <FakeInputs />
      <Card minHeight={'50rem'} justify={'space-evenly'}>
        <RowContainer direction={'column'}>
          <BoldTitle >
            Create a password or type your
          </BoldTitle>
          <BoldTitle>password if you have created it already:</BoldTitle>
        </RowContainer>
        <RowContainer >
          <InputWithEye
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            placeholder={'Password'}
            onKeyDown={handleKeyDown}
            showPassword={showPassword}
            onEyeClick={() => setShowPassword(!showPassword)}
          />
        </RowContainer>
        <RowContainer justify="space-between" width="90%">
          <Link  to="/">
            <WhiteButton theme={theme} width={'100%'}>
              Back
            </WhiteButton>
          </Link>
          <VioletButton
            width={'calc(50% - .5rem)'}
            theme={theme}
            disabled={isDisabled}
            onClick={() => submit()}
          >
            Continue
          </VioletButton>
        </RowContainer>
      </Card>
      <BottomLink />
    </>
  );
};

export default CreatePassword;
