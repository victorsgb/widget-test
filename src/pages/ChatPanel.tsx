import { useEffect, useState } from 'react';

import {
  Box,
  Typography,
  LinearProgress,
  Stack,
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
    <Box sx={{ paddingLeft: 2, paddingRight: 2 }}>
      <Stack spacing={1} sx={{ mb: 3, maxHeight: '200px', overflowY: 'auto' }}>
        {contextMessages.map((message) => {
          const isUser = message.type === 'user';
          const isSystem = message.type === 'system';
          const { time } = formatDateTime(message.createdAt);

          return (
            <Box key={message.createdAt}>
              { !isSystem && (
                <Box sx={{ display: 'flex', flexDirection: isUser ? 'row' : 'row-reverse', gap: 1 }}>
                  <Avatar>{isUser ? <PersonIcon /> : <BotIcon />}</Avatar>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ bgcolor: isUser ? '#fbc' : '#222', p: 1.5, borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ color: isUser ? '#222' : '#fff' }}>{message.message}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Typography variant="caption" sx={{ color: '#aaa' }}>{message.name}</Typography>
                      <Typography variant="caption" sx={{ color: '#aaa' }}>{time}</Typography>
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
      <Paper sx={{ borderTop: 1, borderColor: '#333', p: 2, bgcolor: 'transparent' }}>
        {sending && (
          <LinearProgress
            sx={{
              backgroundColor: '#e0e0e0', // cor da trilha (fundo)
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#fbc', // cor da barra em movimento
              },
            }}
          />
        )}
        {error && <Typography color='warning'>{error}</Typography>}
        <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          label="Type a message"
          variant="standard"
          fullWidth
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(newMessage);
            }
          }}
          multiline
          maxRows={3}
          disabled={sending}
          sx={{
            mb: 2,
            backgroundColor: 'transparent',
            '& .MuiInputBase-input': {
              color: '#dddddd', // texto digitado
              '::placeholder': {
                color: '#999999', // placeholder (se houver)
                opacity: 1,
              },
            },
            '& .MuiInputLabel-root': {
              color: '#aaaaaa', // label quando não focado
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#ffffff', // label quando focado
            },
            '& .MuiInput-underline:before': {
              borderBottom: '1px solid #444444', // underline normal
            },
            '& .MuiInput-underline:hover:before': {
              borderBottom: '1px solid #888888', // underline no hover
            },
            '& .MuiInput-underline:after': {
              borderBottom: '2px solid #fbc', // underline quando focado
            },
            '& .Mui-disabled': {
              color: '#777777', // texto quando desabilitado
            },
            '& .MuiInput-underline.Mui-disabled:before': {
              borderBottom: '1px dotted #555555', // underline quando desabilitado
            },
          }}
        />
          <IconButton
            onClick={() => handleSendMessage(newMessage)}
            disabled={!newMessage.trim() || sending}
            sx={{
              backgroundColor: '#333',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#000',
              },
              '&.Mui-disabled': {
                backgroundColor: '#111',
                color: '#666',
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );

  return (
    <>
      <Box
        onClick={() => setChatOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          zIndex: 9999,
          width: 40,
          height: 40,
          bgcolor: '#fbc',
          color: '#fff',
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <TawkeeLogo />
      </Box>

      {chatOpen && (
        <ClickAwayListener onClickAway={() => setChatOpen(false)}>
          <Box
            sx={{
              position: 'fixed',
              bottom: 90,
              right: 20,
              zIndex: 1300,
              display: 'block'
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
                backgroundColor: '#111',
                color: '#eee',                               
              }}
            >
              <Box sx={{ p: 2, borderBottom: 1, borderColor: '#333' }}>
                <Typography variant="h6">Chat with one of our Agents!</Typography>
              </Box>

              <Box sx={{ p: 2, flexGrow: 1, overflowY: 'hidden' }}>
                {!submitted ? (
                  <>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      To start, please fill in the information below:
                    </Typography>
                    <TextField
                      label="Name"
                      variant="standard"
                      value={userInfo.name}
                      onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                      fullWidth
                      placeholder="Enter your name"
                      sx={{
                        mb: 2,
                        backgroundColor: 'transparent',
                        '& .MuiInputBase-input': {
                          color: '#dddddd', // texto digitado
                          '::placeholder': {
                            color: '#999999', // placeholder (se houver)
                            opacity: 1,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#aaaaaa', // label quando não focado
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#ffffff', // label quando focado
                        },
                        '& .MuiInput-underline:before': {
                          borderBottom: '1px solid #444444', // underline normal
                        },
                        '& .MuiInput-underline:hover:before': {
                          borderBottom: '1px solid #888888', // underline no hover
                        },
                        '& .MuiInput-underline:after': {
                          borderBottom: '2px solid #fbc', // underline quando focado
                        },
                        '& .Mui-disabled': {
                          color: '#777777', // texto quando desabilitado
                        },
                        '& .MuiInput-underline.Mui-disabled:before': {
                          borderBottom: '1px dotted #555555', // underline quando desabilitado
                        },
                      }}
                    />
                    <TextField
                      label="Contact info"
                      variant='standard'
                      value={userInfo.email}
                      onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                      fullWidth
                      placeholder="Enter your email or phone number"
                      sx={{
                        mb: 2,
                        backgroundColor: 'transparent',
                        '& .MuiInputBase-input': {
                          color: '#dddddd', // texto digitado
                          '::placeholder': {
                            color: '#999999', // placeholder (se houver)
                            opacity: 1,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#aaaaaa', // label quando não focado
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#ffffff', // label quando focado
                        },
                        '& .MuiInput-underline:before': {
                          borderBottom: '1px solid #444444', // underline normal
                        },
                        '& .MuiInput-underline:hover:before': {
                          borderBottom: '1px solid #888888', // underline no hover
                        },
                        '& .MuiInput-underline:after': {
                          borderBottom: '2px solid #fbc', // underline quando focado
                        },
                        '& .Mui-disabled': {
                          color: '#777777', // texto quando desabilitado
                        },
                        '& .MuiInput-underline.Mui-disabled:before': {
                          borderBottom: '1px dotted #555555', // underline quando desabilitado
                        },
                      }}                    
                    />
                  </>
                ) : (
                  chatBox
                )}
              </Box>

              <Box sx={{ p: 2, borderTop: 1, borderColor: '#333', display: 'flex', justifyContent: 'flex-end' }}>
                {!submitted ? (
                  <Button
                    variant="contained"
                    onClick={() => {
                      if (userInfo.name && userInfo.email) setSubmitted(true);
                    }}
                    disabled={!userInfo.name || !userInfo.email}
                    sx={{
                      color: '#ddd',
                      backgroundColor: '#444',
                      '&.Mui-disabled': {
                        color: '#888',
                        backgroundColor: '#222',
                      },
                    }}
                  >
                    Start Chat
                  </Button>
                ) : (
                  <Button
                    variant='text'
                    onClick={() => setChatOpen(false)}
                    sx={{
                      color: '#ddd',
                      backgroundColor: '#444',
                    }}                    
                  >
                    Close
                  </Button>
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