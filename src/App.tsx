import AppPageLayout from './components/AppPageLayout';
import { SocketProvider } from './context/SocketContext';
import ChatPanel from './pages/ChatPanel';

interface AppProps {
  agentId?: string;
  workspaceId?: string;
  agentSecret?: string;
  outlineColor?: string;
}

export default function App({
  agentId,
  workspaceId,
  agentSecret,
  outlineColor,
}: AppProps) {
  return (
    <SocketProvider>
      <AppPageLayout>
        <ChatPanel
          agentId={agentId}
          workspaceId={workspaceId}
          agentSecret={agentSecret}
          outlineColor={outlineColor}
        />
      </AppPageLayout>
    </SocketProvider>
  );
}
