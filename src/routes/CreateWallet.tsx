import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { CreateWalletPage } from '../pages/CreateWallet/index';

export default function CreateWalletRoute() {
  return (
    <Routes>
      <Route path="/*" element={<CreateWalletPage />} />
    </Routes>
  );
}
