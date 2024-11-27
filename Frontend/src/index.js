import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

window.addEventListener('error', (event) => {
  // Log the error to your error reporting service
  console.error('Uncaught Error:', event.error);
});

