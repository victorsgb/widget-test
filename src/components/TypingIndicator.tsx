import { Box, Typography, useTheme, keyframes } from '@mui/material';
import { formatDateTime } from '../utils/formatDateTime'; // adjust path as needed

// Keyframes for animated dots
const blink = keyframes`
  0% { opacity: 0.2; }
  20% { opacity: 1; }
  100% { opacity: 0.2; }
`;

// Keyframes for entry animation
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

function TypingIndicator({ type, name }: {type: 'user' | 'assistant' | 'system', name: string}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: 'fit-content',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        animation: `${fadeInUp} 300ms ease-out`,
      }}
    >
      <Box
        sx={{
          maxWidth: '350px',
          padding: theme.spacing(1, 2),
          borderRadius: theme.spacing(2),
          marginBottom: 0.5,
          backgroundColor: type === 'user'
            ? theme.palette.primary.main
            : theme.palette.grey[100],
          color: theme.palette.text.secondary,
          wordBreak: 'initial',
          textAlign: 'left',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: '4px',
            alignItems: 'center',
            justifyContent: 'center',
            height: '1em',
          }}
        >
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: theme.palette.text.secondary,
                animation: `${blink} 1.4s infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
          {name}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
          {formatDateTime(Date.now()).time}
        </Typography>
      </Box>
    </Box>
  );
}

export default TypingIndicator;
