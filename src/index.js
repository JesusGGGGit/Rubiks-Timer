import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './components/Context/AuthContext';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Register service worker for PWA (basic, served from public/service-worker.js)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${process.env.PUBLIC_URL || ''}/service-worker.js`;
    navigator.serviceWorker.register(swUrl)
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((err) => {
        console.warn('Service Worker registration failed:', err);
      });
  });
}
