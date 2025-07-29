import * as React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Wallet from '../pages/Wallet';
import { useWallet } from '../utils/wallet';
import { useHasLockedMnemonicAndSeed } from '../utils/wallet-seed';

export default function LoginRoutes() {
  const wallet = useWallet();
  const [hasLockedMnemonicAndSeed] = useHasLockedMnemonicAndSeed();

  return (
    <Routes>
      {!wallet ? (
        hasLockedMnemonicAndSeed ? (
          <Route path="/*" element={<Navigate to="/welcome_back" replace />} />
        ) : (
          <Route path="/*" element={<Navigate to="/welcome" replace />} />
        )
      ) : null}
      <Route path="/*" element={<Wallet />} />
    </Routes>
  );
}
