import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import Chip from '@mui/material/Chip';
import { keyframes } from '@mui/material/styles';

import type { WebSocketStatus } from '@/types/websocket';

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

interface ConnectionStatusProps {
  status: WebSocketStatus;
}

const statusConfig: Record<
  WebSocketStatus,
  { label: string; color: 'success' | 'error' | 'warning' }
> = {
  connected: {
    label: 'Connected',
    color: 'success',
  },
  disconnected: {
    label: 'Disconnected',
    color: 'error',
  },
  reconnecting: {
    label: 'Reconnecting',
    color: 'warning',
  },
};

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  const config = statusConfig[status];

  return (
    <Chip
      aria-live="polite"
      color={config.color}
      icon={<FiberManualRecordIcon />}
      label={config.label}
      size="small"
      sx={{
        ...(status === 'reconnecting' && {
          animation: `${pulse} 1.5s ease-in-out infinite`,
        }),
      }}
    />
  );
}
