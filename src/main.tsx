import React from 'react';
import ReactDOM from 'react-dom/client';
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { App } from './App';
import './styles/index.css';

// Configure Monaco to bundle locally & run offline without CDN requests
loader.config({ monaco });

if (typeof window !== 'undefined') {
  (window as any).MonacoEnvironment = {
    getWorker: function () {
      return null;
    },
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

