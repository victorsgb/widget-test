import AppPageLayout from './components/AppPageLayout';
import { SocketProvider } from './context/SocketContext';
import ChatPanel from './pages/ChatPanel';

interface AppProps {
  id?: string;
  token?: string;
}

export default function App({
  id,
  token
}: AppProps) {
  return (
    <SocketProvider>
      <AppPageLayout>
        <ChatPanel
          id={id}
          token={token}
        />
      </AppPageLayout>
    </SocketProvider>
  );
}
