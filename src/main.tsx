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
const token = currentScript?.dataset.token;
const agentId = currentScript?.dataset.agentId;
const workspaceId = currentScript?.dataset.workspaceId;
const agentSecret = currentScript?.dataset.agentSecret;
const outlineColorDark = currentScript?.dataset.outlineColorDark;
const outlineColorLight = currentScript?.dataset.outlineColorLight;

ReactDOM.createRoot(mountNode).render(
  <StrictMode>
    <App
      token={token}
      agentId={agentId}
      workspaceId={workspaceId}
      agentSecret={agentSecret}
      outlineColorDark={outlineColorDark}
      outlineColorLight={outlineColorLight}
    />
  </StrictMode>
);
