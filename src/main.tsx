import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';

// Cria dinamicamente o contêiner onde o widget será montado
const mountId = 'tawkee-widget-container';
let mountNode = document.getElementById(mountId);

if (!mountNode) {
  mountNode = document.createElement('div');
  mountNode.id = mountId;
  document.body.appendChild(mountNode);
}

// Lê os atributos do script que carregou o widget
const currentScript = document.currentScript as HTMLScriptElement | null;
const agentId = currentScript?.dataset.agentId;
const workspaceId = currentScript?.dataset.workspaceId;

ReactDOM.createRoot(mountNode).render(
  <StrictMode>
    <App agentId={agentId} workspaceId={workspaceId} />
  </StrictMode>
);
