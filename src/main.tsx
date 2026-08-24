import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { JourneyProvider } from './context/JourneyContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <JourneyProvider>
      <App />
    </JourneyProvider>
  </React.StrictMode>
);
