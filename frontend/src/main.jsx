// /home/pawankumar/Desktop/Doubtly/frontend/src/main.jsx
// Application entry point — mounts React app with Router

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { DoubtProvider } from './context/DoubtContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <DoubtProvider>
        <App />
      </DoubtProvider>
    </BrowserRouter>
  </StrictMode>
);
