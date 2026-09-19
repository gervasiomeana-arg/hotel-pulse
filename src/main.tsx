import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {RemoteAuthGate} from './components/common/RemoteAuthGate.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RemoteAuthGate><App /></RemoteAuthGate>
  </StrictMode>,
);
