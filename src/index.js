import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

// Global error handlers to suppress AbortErrors
const isAbortError = (error) => {
  return error?.name === 'AbortError' ||
         error?.message?.includes('signal is aborted') ||
         error?.message?.includes('aborted without reason') ||
         String(error).includes('AbortError') ||
         String(error).includes('aborted');
};

// Handle unhandled promise rejections - MUST be first
window.addEventListener('unhandledrejection', (event) => {
  if (isAbortError(event.reason)) {
    console.log('[Suppressed] AbortError in promise:', event.reason?.message || event.reason);
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}, true); // Use capture phase

// Handle global errors - MUST be first
window.addEventListener('error', (event) => {
  if (isAbortError(event.error) || isAbortError({ message: event.message })) {
    console.log('[Suppressed] AbortError:', event.message || event.error);
    event.preventDefault();
    event.stopImmediatePropagation();
    return true;
  }
}, true); // Use capture phase

// Override console.error to suppress AbortError logs
const originalConsoleError = console.error;
console.error = function(...args) {
  const message = args.join(' ');
  if (message.includes('AbortError') || message.includes('signal is aborted')) {
    console.log('[Suppressed console.error] AbortError:', message);
    return;
  }
  originalConsoleError.apply(console, args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
