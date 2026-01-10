import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import { AuthProvider } from './Context/AuthContext';

import { Toaster } from 'sonner';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>

    <AuthProvider>
      <App />
    </AuthProvider>
    
    <Toaster position="bottom-right" richColors duration={4500}/>

  </React.StrictMode>
);
