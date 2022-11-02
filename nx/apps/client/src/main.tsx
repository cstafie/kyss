import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './main.css';

import App from './app/app';
import XWord from './components/xword/index';

// const router = createBrowserRouter([
//   {
//     path: '/',
//     element: <App />,
//     children: [
//       {
//         path: 'xword',
//         element: <XWord />,
//       },
//     ],
//   },
// ]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/xword" element={<XWord />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
