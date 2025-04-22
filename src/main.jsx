import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import './index.css';
import { initializeCSRF } from './api';

const root = ReactDOM.createRoot(document.getElementById('root'));
initializeCSRF().then(() => {
root.render(
  <Router>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Router>
);
});
