import { useEffect, useRef, useState } from 'react';

import {
  Box,
  Typography,
  LinearProgress,
  Stack,
  Avatar,
  IconButton,
  Paper,
  TextField,
  Button,
  Divider,
  useTheme,
  useColorScheme,
} from '@mui/material';

import { Person as PersonIcon, SmartToy as BotIcon } from '@mui/icons-material';

import ClickAwayListener from '@mui/material/ClickAwayListener';
import SendIcon from '@mui/icons-material/Send';

import { useSocket } from '../context/SocketContext';
import { formatDateTime } from '../utils/formatDateTime';
import TypingIndicator from '../components/TypingIndicator';
import env from '../config/env';
import TawkeeLogo from '../components/TawkeeLogo';
import ColorModeIconDropdown from '../components/shared-theme/ColorModeIconDropdown';

interface User {
  name: string;
  email: string;
}

interface ChatPanelProps {
  id?: string;
  token?: string;
}

function ChatPanel({ id, token }: ChatPanelProps) {
  const theme = useTheme();
  const { mode, systemMode } = useColorScheme();
  const resolvedMode = (systemMode || mode) as 'light' | 'dark';

  const [workspaceId, setWorkspaceId] = useState<string | undefined>(undefined);
  const [agentId, setAgentId] = useState<string | undefined>(undefined);
  const [agentSecret, setAgentSecret] = useState<string | undefined>(undefined);
  const [outlineColorDark, setOutlineColorDark] = useState<string | undefined>(
    theme.palette.primary.main
  );
  const [outlineColorLight, setOutlineColorLight] = useState<
    string | undefined
  >(theme.palette.primary.light);

  const [workspaceAvatarUrl, setWorkspaceAvatarUrl] = useState<
    string | undefined
  >(undefined);

  const { startContextChat, stopContextChat, contextMessages, whoIsTyping } =
    useSocket();

  const inputRef = useRef<HTMLInputElement>(null);

  const [isValidSecret, setIsValidSecret] = useState<boolean>(true);

  const [contextId, setContextId] = useState<string>('');
  const [chatOpen, setChatOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  const [submitted, setSubmitted] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      const url = agentId
        ? `${env.API_URL}/agent/${agentId}/conversation`
        : `${env.API_URL}/agent/conversation`;

      const response = await fetch(url, {
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

      // Focus the text input after the next render cycle
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const handleStartChat = async () => {
    if (!userInfo.name || !userInfo.email) return;

    try {
      const response = await fetch(`${env.API_URL}/chats/new-context-id`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'admin-api-key': env.ADMIN_API_KEY,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to get context ID: ${response.status} ${errorText}`
        );
      }

      const newContextId = await response.text();
      setContextId(newContextId);
      setSubmitted(true);
      startContextChat(newContextId);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  useEffect(() => {
    return () => stopContextChat();
  }, []);

  useEffect(() => {
    async function decryptAgentRef() {
      if (!id) return;

      try {
        const response = await fetch(
          `${env.API_URL}/workspaces/decrypt-agent-ref`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'admin-api-key': env.ADMIN_API_KEY,
            },
            body: JSON.stringify({ encrypted: id }),
          }
        );

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Failed to decrypt: ${response.status} ${text}`);
        }

        const data = await response.json();
        setWorkspaceId(data.data.workspaceId);
        setAgentId(data.data.agentId);
        setAgentSecret(data.data.agentSecret);
      } catch (err) {
        console.error('Decryption failed:', err);
      }
    }

    decryptAgentRef();
  }, [id]);

  useEffect(() => {
    async function validateSecret() {
      if (!agentId || !agentSecret) {
        setIsValidSecret(false);
        return;
      }

      try {
        const response = await fetch(
          `${env.API_URL}/workspaces/${workspaceId}/agents/${agentId}/check-secret`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'admin-api-key': env.ADMIN_API_KEY,
            },
            body: JSON.stringify({ secret: agentSecret }),
          }
        );

        if (!response.ok) {
          setIsValidSecret(false);
          return;
        }

        const result = await response.json();
        setIsValidSecret(result.data);
      } catch (error) {
        setIsValidSecret(false);
      }
    }

    if (workspaceId) validateSecret();
  }, [workspaceId, agentId, agentSecret]);

  useEffect(() => {
    async function fetchWorkspaceAvatar(workspaceId: string) {
      try {
        const response = await fetch(
          `${env.API_URL}/workspaces/${workspaceId}/avatar`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'admin-api-key': env.ADMIN_API_KEY,
            },
          }
        );

        if (!response.ok) {
          const text = await response.text();
          console.error('Non-OK avatar response:', text);
          throw new Error(`Failed to fetch avatar: ${response.status}`);
        }

        const data = await response.json();
        setWorkspaceAvatarUrl(data.data.avatar);
      } catch (error) {
        console.error('Error fetching workspace avatar:', error);
      }
    }

    if (workspaceId) {
      fetchWorkspaceAvatar(workspaceId);
    }
  }, [workspaceId]);

  useEffect(() => {
    async function fetchWidgetOutlineColors() {
      if (!agentId) return;

      try {
        const response = await fetch(
          `${env.API_URL}/agent/${agentId}/widget-outline-colors`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'admin-api-key': env.ADMIN_API_KEY,
            },
          }
        );

        if (!response.ok) {
          const text = await response.text();
          throw new Error(
            `Failed to fetch outline colors: ${response.status} ${text}`
          );
        }

        const data = await response.json();

        if (data.data.outlineColorDark)
          setOutlineColorDark(data.data.outlineColorDark);
        if (data.data.outlineColorLight)
          setOutlineColorLight(data.data.outlineColorLight);
      } catch (error) {
        console.error('Error fetching widget outline colors:', error);
      }
    }

    fetchWidgetOutlineColors();
  }, [agentId]);

  useEffect(() => {
    async function fetchUserProfile(token: string) {
      try {
        const response = await fetch(`${env.API_URL}/auth/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        const userData: User = data.data;

        setUserInfo((prev) => ({
          ...prev,
          name: userData.name || '',
          email: userData.email || '',
        }));
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    }

    if (token) {
      fetchUserProfile(token);
    }
  }, [token]);

  const chatBox = (
    <Box sx={{ paddingLeft: 2, paddingRight: 2 }}>
      <Stack spacing={1} sx={{ mb: 3, maxHeight: '200px', overflowY: 'auto' }}>
        {contextMessages.map((message) => {
          const isUser = message.type === 'user';
          const isSystem = message.type === 'system';
          const { time } = formatDateTime(message.createdAt);

          return (
            <Box key={message.createdAt}>
              {!isSystem && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: isUser ? 'row' : 'row-reverse',
                    gap: 1,
                  }}
                >
                  <Avatar>{isUser ? <PersonIcon /> : <BotIcon />}</Avatar>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box
                      sx={{
                        backgroundColor: isUser
                          ? theme.palette.primary.main
                          : theme.palette.grey[100],
                        color: isUser ? '#fff' : theme.palette.text.primary,
                        padding: 1.5,
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="body2">{message.message}</Typography>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: isUser ? 'row' : 'row-reverse',
                        gap: 1,
                      }}
                    >
                      <Typography variant="caption" color="textPrimary">
                        {message.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {time}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          );
        })}
        {whoIsTyping && (
          <Box
            sx={{
              display: 'flex',
              flexDirection:
                whoIsTyping.type === 'user' ? 'row' : 'row-reverse',
              gap: 1,
            }}
          >
            <Avatar>
              {whoIsTyping.type === 'user' ? <PersonIcon /> : <BotIcon />}
            </Avatar>
            <Box>
              <TypingIndicator
                type={whoIsTyping.type}
                name={whoIsTyping.name}
              />
            </Box>
          </Box>
        )}
      </Stack>
      <Paper variant="highlighted">
        {sending && <LinearProgress color="secondary" />}
        {error && <Typography color="warning">{error}</Typography>}
        <Box sx={{ display: 'flex', gap: 1, p: 1, alignItems: 'center' }}>
          <TextField
            inputRef={inputRef}
            label="Type a message"
            variant="standard"
            fullWidth
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
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
            onClick={() => handleSendMessage(newMessage)}
            disabled={!newMessage.trim() || sending}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );

  if (isValidSecret === false) return;

  return (
    <>
      <Box
        onClick={() => setChatOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            setChatOpen(true);
          }
        }}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 9999,
          width: 40,
          height: 40,
          bgcolor:
            resolvedMode === 'dark'
              ? outlineColorDark || theme.palette.primary.main
              : outlineColorLight || theme.palette.primary.light,
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          caretColor: 'transparent',
          outline: 'none',
          transition: 'box-shadow 0.2s ease-in-out',

          '&:hover': {
            boxShadow: 6,
          },
          '&:focus': {
            boxShadow: 6,
          },
        }}
      >
        {workspaceId && workspaceAvatarUrl ? (
          <Box
            component="img"
            src={workspaceAvatarUrl}
            alt="Workspace Logo"
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
            }}
            tabIndex={0}
          />
        ) : (
          <TawkeeLogo />
        )}
      </Box>

      {chatOpen && (
        <ClickAwayListener onClickAway={() => setChatOpen(false)}>
          <Box
            sx={{
              position: 'fixed',
              bottom: 90,
              right: 20,
              zIndex: 1300,
              display: 'block',
            }}
          >
            <Paper
              variant="outlined"
              sx={{
                width: 360,
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="h6">
                  {agentId ? 'Chat with us!' : 'Chat with our agents!'}
                </Typography>
                <ColorModeIconDropdown />
              </Box>

              <Divider />

              <Box sx={{ p: 2, flexGrow: 1, overflowY: 'hidden' }}>
                {!submitted ? (
                  <>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {token
                        ? 'You will be identified as follows:'
                        : 'To start, please fill in the information below:'}
                    </Typography>
                    <TextField
                      label="Name"
                      variant="standard"
                      value={userInfo.name}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, name: e.target.value })
                      }
                      fullWidth
                      placeholder="Enter your name"
                      disabled={!!token}
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      label="Contact info"
                      variant="standard"
                      value={userInfo.email}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, email: e.target.value })
                      }
                      fullWidth
                      placeholder="Enter your email or phone number"
                      disabled={!!token}
                    />
                  </>
                ) : (
                  chatBox
                )}
              </Box>

              <Divider />

              <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                {!submitted ? (
                  <Button
                    variant="outlined"
                    onClick={handleStartChat}
                    disabled={!userInfo.name || !userInfo.email}
                  >
                    Start Chat
                  </Button>
                ) : (
                  <Button variant="text" onClick={() => setChatOpen(false)}>
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
