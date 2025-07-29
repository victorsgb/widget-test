import AppPageLayout from './components/AppPageLayout';
import { SocketProvider } from './context/SocketContext';
import ChatPanel from './pages/ChatPanel';

interface AppProps {
  token?: string;
  agentId?: string;
  workspaceId?: string;
  agentSecret?: string;
  outlineColorDark?: string;
  outlineColorLight?: string;
}

export default function App({
  token,
  agentId,
  workspaceId,
  agentSecret,
  outlineColorDark,
  outlineColorLight
}: AppProps) {
  return (
    <SocketProvider>
      <AppPageLayout>
        <ChatPanel
          token={token}
          agentId={agentId}
          workspaceId={workspaceId}
          agentSecret={agentSecret}
          outlineColorDark={outlineColorDark}
          outlineColorLight={outlineColorLight}
        />
      </AppPageLayout>
    </SocketProvider>
  );
}
