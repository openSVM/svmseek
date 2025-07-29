import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ImportPage } from '../pages/ImportWallet/index';

export default function LoginRoutes() {
  return (
    <Routes>
      <Route path="/*" element={<ImportPage />} />
    </Routes>
  );
}
