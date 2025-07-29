import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { RestorePage } from '../pages/RestoreWallet/index';

export default function RestoreWalletRoute() {
  return (
    <Routes>
      <Route
        path="/*"
        element={<RestorePage />}
      />
    </Routes>
  );
}
