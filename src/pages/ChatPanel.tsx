import { useEffect, useState } from 'react';

import {
  Box,
  Typography,
  LinearProgress,
  Stack,
  Chip,
  Avatar,
  IconButton,
  Paper,
  TextField,
  Button
} from '@mui/material';

import {
  Person as PersonIcon,
  SmartToy as BotIcon
} from '@mui/icons-material';

import ClickAwayListener from '@mui/material/ClickAwayListener';
import SendIcon from '@mui/icons-material/Send';

import { useSocket } from '../context/SocketContext';
import { formatDateTime } from '../utils/formatDateTime';
import TypingIndicator from '../components/TypingIndicator';
import env from '../config/env';
import TawkeeLogo from '../components/TawkeeLogo';

function ChatPanel() {
  const { startContextChat, stopContextChat, contextMessages, whoIsTyping } = useSocket();

  const [contextId, setContextId] = useState<string>('');
  const [chatOpen, setChatOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  const [submitted, setSubmitted] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = crypto.randomUUID();
    setContextId(id);
    startContextChat(id);
    return () => stopContextChat();
  }, []);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    setSending(true);
    setError(null);
    try {
      const body = {
        contextId,
        prompt: message.trim(),
        respondViaAudio: false,
        chatName: userInfo.name,
        phone: userInfo.email,
      };
      const response = await fetch(`${env.API_URL}/agent/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'admin-api-key': env.ADMIN_API_KEY,
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw errorData.error || 'Failure to send message';
      }
      setNewMessage('');
    } catch (err: any) {
      setError(err);
    } finally {
      setSending(false);
    }
  };

  const chatBox = (
    <Box sx={{ p: 2, maxHeight: 500, overflow: 'auto' }}>
      <Stack spacing={1} sx={{ mb: 3 }}>
        {contextMessages.map((message, i) => {
          const isUser = message.type === 'user';
          const isSystem = message.type === 'system';
          const { date, time } = formatDateTime(message.createdAt);
          const showDateSeparator =
            i === 0 || formatDateTime(contextMessages[i - 1].createdAt).date !== date;

          return (
            <Box key={message.createdAt}>
              {showDateSeparator && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <Chip label={date} size="small" />
                </Box>
              )}
              { !isSystem && (
                <Box sx={{ display: 'flex', flexDirection: isUser ? 'row' : 'row-reverse', gap: 1 }}>
                  <Avatar>{isUser ? <PersonIcon /> : <BotIcon />}</Avatar>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ bgcolor: isUser ? 'primary.main' : 'primary.secondary', p: 1.5, borderRadius: 2 }}>
                      <Typography variant="body2">{message.message}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">{message.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{time}</Typography>
                    </Box>
                  </Box>
                </Box>               
              )}
            </Box>
          );
        })}
        {whoIsTyping && (
          <Box sx={{ display: 'flex', flexDirection: whoIsTyping.type === 'user' ? 'row' : 'row-reverse', gap: 1 }}>
            <Avatar>{whoIsTyping.type === 'user' ? <PersonIcon /> : <BotIcon />}</Avatar>
            <Box>
              <TypingIndicator type={whoIsTyping.type} name={whoIsTyping.name} />
            </Box>
          </Box>
        )}
      </Stack>
      <Paper sx={{ borderTop: 1, borderColor: 'divider', p: 2, bgcolor: 'transparent' }}>
        {sending && <LinearProgress />}
        {error && <Typography color='warning'>{error}</Typography>}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder='Type a message...'
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyPress={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(newMessage);
              }
            }}
            multiline
            maxRows={3}
            disabled={sending}
          />
          <IconButton
            color='primary'
            onClick={() => handleSendMessage(newMessage)}
            disabled={!newMessage.trim() || sending}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );

  return (
    <>
      {/* Chat Floating Button */}
      <Box
        onClick={() => setChatOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: 40,
          height: 40,
          bgcolor: 'primary.main',
          color: '#fff',
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 1300
        }}
      >
        <TawkeeLogo />
      </Box>
      {/* Chat Dialog */}
      {chatOpen && (
        <ClickAwayListener onClickAway={() => setChatOpen(false)}>
          <Box
            sx={{
              position: 'fixed',
              bottom: 90,
              right: 20,
              zIndex: 1300
            }}
          >
            <Paper
              elevation={6}
              sx={{
                width: 360,
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                overflow: 'hidden',
                backgroundColor: 'black'
              }}
            >
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">Chat with one of our Agents!</Typography>
              </Box>

              <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
                {!submitted ? (
                  <>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      To start, please fill in the information below:
                    </Typography>
                    <TextField
                      label="Name"
                      value={userInfo.name}
                      onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                      fullWidth
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      label="E-mail or phone number"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                      fullWidth
                    />
                  </>
                ) : (
                  chatBox
                )}
              </Box>

              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
                {!submitted ? (
                  <Button
                    onClick={() => {
                      if (userInfo.name && userInfo.email) setSubmitted(true);
                    }}
                    disabled={!userInfo.name || !userInfo.email}
                  >
                    Start Chat
                  </Button>
                ) : (
                  <Button onClick={() => setChatOpen(false)}>Close</Button>
                )}
              </Box>
            </Paper>
          </Box>
        </ClickAwayListener>
      )}


    </>
  );
}

export default ChatPanel;
