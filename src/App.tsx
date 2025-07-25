import AppPageLayout from './components/AppPageLayout';
import { SocketProvider } from './context/SocketContext';
import ChatPanel from './pages/ChatPanel';

export default function App() {
  return (
    <SocketProvider>
      <AppPageLayout>
        <ChatPanel />
      </AppPageLayout>
    </SocketProvider>
  );
}
