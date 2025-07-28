import AppPageLayout from './components/AppPageLayout';
import { SocketProvider } from './context/SocketContext';
import ChatPanel from './pages/ChatPanel';

interface AppProps {
  agentId?: string;
  agentSecret?: string;
}

export default function App({ agentId, agentSecret }: AppProps) {
  return (
    <SocketProvider>
      <AppPageLayout>
        <ChatPanel agentId={agentId} agentSecret={agentSecret} />
      </AppPageLayout>
    </SocketProvider>
  );
}
