import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import Wallet from '../pages/Wallet';
// Removed wallet check redirect - auto-generation handles wallet creation

export default function LoginRoutes() {
  return (
    <Routes>
      <Route path="/*" element={<Wallet />} />
    </Routes>
  );
}
