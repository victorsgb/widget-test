import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';

// Cria dinamicamente o contêiner onde o widget será montado
const mountId = 'my-widget-container';
let mountNode = document.getElementById(mountId);

if (!mountNode) {
  mountNode = document.createElement('div');
  mountNode.id = mountId;
  document.body.appendChild(mountNode);
}

ReactDOM.createRoot(mountNode).render(
  <StrictMode>
    <App />
  </StrictMode>
);
