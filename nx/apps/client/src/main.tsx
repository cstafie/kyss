// import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import { AuthContextProvider } from './contexts/auth';
import { SocketContextProvider } from './contexts/socket';
import './main.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  // <StrictMode> // TODO: test with strict mode

  <AuthContextProvider>
    <SocketContextProvider>
      <App />
    </SocketContextProvider>
  </AuthContextProvider>
  // </StrictMode>
);
