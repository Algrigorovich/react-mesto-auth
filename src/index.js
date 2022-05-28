import {React, StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // импортируем BrowserRouter
import App from './components/App';
import './index.css';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  // <StrictMode> со строгим режимом не работает почему то
    <BrowserRouter>
      <App />
    </BrowserRouter>
  // </StrictMode>
);

