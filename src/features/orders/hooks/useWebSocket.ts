import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { addOrderToDatabase, updateOrderInDatabase } from '@/services/mockData';
import { getMockWebSocket } from '@/services/mockWebSocket';
import type { OrderWebSocketEvent, WebSocketStatus } from '@/types/websocket';

export function useWebSocket() {
  const queryClient = useQueryClient();

  // Lazy initializer to get initial status without triggering effect warning
  const [status, setStatus] = useState<WebSocketStatus>(() =>
    getMockWebSocket().getStatus()
  );

  useEffect(() => {
    const ws = getMockWebSocket();

    const unsubscribeStatus = ws.onStatusChange(
      (newStatus: WebSocketStatus) => {
        setStatus(newStatus);
      }
    );

    const unsubscribeEvents = ws.on((event: OrderWebSocketEvent) => {
      if (event.type === 'new_order') {
        addOrderToDatabase(event.data);
      } else if (event.type === 'order_update') {
        const { id, status, updatedAt } = event.data;

        if (status) {
          updateOrderInDatabase(id, { status, updatedAt });
        }
      }

      queryClient.invalidateQueries({ queryKey: ['orders'] });
    });

    return () => {
      unsubscribeStatus();
      unsubscribeEvents();
    };
  }, [queryClient]);

  return { status };
}
