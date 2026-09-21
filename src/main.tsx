import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {AppErrorBoundary} from './components/common/AppErrorBoundary.tsx';
import {RemoteAuthGate} from './components/common/RemoteAuthGate.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <RemoteAuthGate><App /></RemoteAuthGate>
    </AppErrorBoundary>
  </StrictMode>,
);
