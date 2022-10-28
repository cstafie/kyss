import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import 'reset-css';
import './main.css';

import App from './app/app';
import XWord from './components/xword';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/xword',
    element: <XWord />,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
