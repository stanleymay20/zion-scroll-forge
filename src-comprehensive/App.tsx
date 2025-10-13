import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '../frontend/src/router/AppRouter';
import './App.css';

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;