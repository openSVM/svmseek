import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import PopupPage from '../pages/ConnectPopup/PopupPage';

export default function LoginRoutes() {
  return (
    <Routes>
      <Route path="/*" element={<PopupPage />} />
    </Routes>
  );
}
