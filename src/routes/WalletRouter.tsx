import * as React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Wallet from '../pages/Wallet';
import { useWallet } from '../utils/wallet';

export default function LoginRoutes() {
  const wallet = useWallet();

  return (
    <Routes>
      {!wallet ? (
        <Route path="/*" element={<Navigate to="/welcome" replace />} />
      ) : null}
      <Route path="/*" element={<Wallet />} />
    </Routes>
  );
}
