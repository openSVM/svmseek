import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import { WelcomePage } from '../pages/WelcomePage/index';

export default function LoginRoutes() {
  return (
    <Routes>
      <Route path="/*" element={<WelcomePage />} />
    </Routes>
  );
}
