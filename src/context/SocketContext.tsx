import { createContext, useRef, ReactNode, useContext, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface MessageContextChatUpdatePayload {
  id: string;
  message: string;
  name: string;
  type: 'user' | 'assistant' | 'system';
  createdAt: number;
}

interface SocketContextType {
  startContextChat: (contextId: string, socketServerUrl: string) => void;
  stopContextChat: () => void;
  whoIsTyping:
    | { type: 'user' | 'assistant' | 'system'; name: string }
    | undefined;
  contextMessages: MessageContextChatUpdatePayload[];
}

interface SocketProviderProps {
  children: ReactNode;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: SocketProviderProps) {
  const socketPublicRef = useRef<Socket | null>(null);

  const [whoIsTyping, setWhoIsTyping] = useState<
    { type: 'user' | 'assistant' | 'system'; name: string } | undefined
  >(undefined);
  const [contextMessages, setContextMessages] = useState<
    MessageContextChatUpdatePayload[]
  >([]);

  const handleStartTypingChatUpdate = (data: {
    type: 'user' | 'assistant' | 'system';
    name: string;
  }) => {
    setWhoIsTyping(data);
  };

  const handleStopTypingChatUpdate = () => {
    setWhoIsTyping(undefined);
  };

  const handleMessageContextChatUpdate = (
    data: MessageContextChatUpdatePayload
  ) => {
    setContextMessages((prev) => [...prev, { ...data, createdAt: Date.now() }]);
    setWhoIsTyping(undefined);
  };

  const startContextChat = (contextId: string, socketServerUrl: string) => {
    stopContextChat();
    socketPublicRef.current = io(socketServerUrl, {
      auth: { contextId },
      transports: ['websocket'],
    });

    socketPublicRef.current.on(
      'startTypingChatUpdate',
      handleStartTypingChatUpdate
    );
    socketPublicRef.current.on(
      'stopTypingChatUpdate',
      handleStopTypingChatUpdate
    );
    socketPublicRef.current.on(
      'messageContextChatUpdate',
      handleMessageContextChatUpdate
    );
  };

  const stopContextChat = () => {
    if (socketPublicRef.current) {
      socketPublicRef.current.off(
        'startTypingChatUpdate',
        handleStartTypingChatUpdate
      );
      socketPublicRef.current.off(
        'stopTypingChatUpdate',
        handleStopTypingChatUpdate
      );
      socketPublicRef.current.off(
        'messageContextChatUpdate',
        handleMessageContextChatUpdate
      );

      socketPublicRef.current.disconnect();
      socketPublicRef.current = null;

      setWhoIsTyping(undefined);
      setContextMessages([]);
    }
  };

  const contextValue: SocketContextType = {
    startContextChat,
    stopContextChat,
    whoIsTyping,
    contextMessages,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
