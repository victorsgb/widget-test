import AppPageLayout from './components/AppPageLayout';
import { SocketProvider } from './context/SocketContext';
import ChatPanel from './pages/ChatPanel';

interface AppProps {
  id?: string;
  token?: string;
  outlineColorDark?: string;
  outlineColorLight?: string;
}

export default function App({
  id,
  token,
  outlineColorDark,
  outlineColorLight,
}: AppProps) {
  return (
    <SocketProvider>
      <AppPageLayout>
        <ChatPanel
          id={id}
          token={token}
          outlineColorDark={outlineColorDark}
          outlineColorLight={outlineColorLight}
        />
      </AppPageLayout>
    </SocketProvider>
  );
}
