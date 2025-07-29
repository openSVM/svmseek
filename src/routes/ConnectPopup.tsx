import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import ConnectPopup from '../pages/ConnectPopup/PopupPage';

export default function ConnectPopupRoute() {
  return (
    <Routes>
      <Route
        path="/*"
        element={<ConnectPopup />}
      />
    </Routes>
  );
}
