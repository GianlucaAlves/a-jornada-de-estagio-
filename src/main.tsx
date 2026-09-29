/**
 * Bootstrap. React 18, sem router, sem provider: a store é um módulo.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';

const raiz = document.getElementById('root');

if (raiz === null) {
  throw new Error('Elemento #root não encontrado em index.html');
}

createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
