import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import WelcomeBackPage from '../pages/WelcomeBack';

export default function LoginRoutes() {
  return (
    <Routes>
      <Route path="/*" element={<WelcomeBackPage />} />
    </Routes>
  );
}
