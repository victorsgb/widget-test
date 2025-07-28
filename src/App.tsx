import AppPageLayout from './components/AppPageLayout';
import { SocketProvider } from './context/SocketContext';
import ChatPanel from './pages/ChatPanel';

interface AppProps {
  agentId?: string;
  workspaceId?: string;
}

export default function App({ agentId, workspaceId }: AppProps) {
  return (
    <SocketProvider>
      <AppPageLayout>
        <ChatPanel agentId={agentId} workspaceId={workspaceId} />
      </AppPageLayout>
    </SocketProvider>
  );
}
