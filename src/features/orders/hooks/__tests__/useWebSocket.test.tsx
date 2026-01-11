import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useWebSocket } from '../useWebSocket';

import * as mockData from '@/services/mockData';
import type { MockWebSocket } from '@/services/mockWebSocket';
import * as mockWebSocketModule from '@/services/mockWebSocket';
import type {
  NewOrderEvent,
  OrderUpdateEvent,
  OrderWebSocketEvent,
  WebSocketStatus,
} from '@/types/websocket';

// Mock the services
vi.mock('@/services/mockData', () => ({
  addOrderToDatabase: vi.fn(),
  updateOrderInDatabase: vi.fn(),
  getMockDatabase: vi.fn(() => []),
}));

describe('useWebSocket', () => {
  let queryClient: QueryClient;
  let mockWs: {
    on: ReturnType<typeof vi.fn>;
    onStatusChange: ReturnType<typeof vi.fn>;
    getStatus: ReturnType<typeof vi.fn>;
  };
  let eventHandler: ((event: OrderWebSocketEvent) => void) | null = null;
  let statusHandler: ((status: WebSocketStatus) => void) | null = null;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Create mock WebSocket
    mockWs = {
      on: vi.fn((handler: (event: OrderWebSocketEvent) => void) => {
        eventHandler = handler;
        return vi.fn(); // unsubscribe function
      }),
      onStatusChange: vi.fn((handler: (status: WebSocketStatus) => void) => {
        statusHandler = handler;
        return vi.fn(); // unsubscribe function
      }),
      getStatus: vi.fn(() => 'connected' as WebSocketStatus),
    };

    // Mock getMockWebSocket to return our mock
    vi.spyOn(mockWebSocketModule, 'getMockWebSocket').mockReturnValue(
      mockWs as unknown as MockWebSocket
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
    eventHandler = null;
    statusHandler = null;
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('initializes with WebSocket status', () => {
    mockWs.getStatus.mockReturnValue('connected');

    const { result } = renderHook(() => useWebSocket(), { wrapper });

    expect(result.current.status).toBe('connected');
    expect(mockWebSocketModule.getMockWebSocket).toHaveBeenCalled();
  });

  it('subscribes to WebSocket events on mount', () => {
    renderHook(() => useWebSocket(), { wrapper });

    expect(mockWs.on).toHaveBeenCalledWith(expect.any(Function));
    expect(mockWs.onStatusChange).toHaveBeenCalledWith(expect.any(Function));
  });

  it('updates status when WebSocket status changes', async () => {
    const { result } = renderHook(() => useWebSocket(), { wrapper });

    expect(result.current.status).toBe('connected');

    // Simulate status change to disconnected
    if (statusHandler) {
      statusHandler('disconnected');
    }

    await waitFor(() => {
      expect(result.current.status).toBe('disconnected');
    });

    // Simulate reconnecting
    if (statusHandler) {
      statusHandler('reconnecting');
    }

    await waitFor(() => {
      expect(result.current.status).toBe('reconnecting');
    });

    // Simulate reconnected
    if (statusHandler) {
      statusHandler('connected');
    }

    await waitFor(() => {
      expect(result.current.status).toBe('connected');
    });
  });

  it('handles new order events', async () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useWebSocket(), { wrapper });

    const newOrderEvent: NewOrderEvent = {
      type: 'new_order',
      data: {
        id: 'ORD-NEW',
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        status: 'pending',
        items: [],
        totalAmount: 100,
        currency: 'USD',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        shippingAddress: {
          street: '123 Test St',
          city: 'Test City',
          country: 'Test Country',
          postalCode: '12345',
        },
      },
      timestamp: new Date().toISOString(),
    };

    // Trigger new order event
    if (eventHandler) {
      eventHandler(newOrderEvent);
    }

    await waitFor(() => {
      expect(mockData.addOrderToDatabase).toHaveBeenCalledWith(
        newOrderEvent.data
      );
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['orders'],
      });
    });
  });

  it('handles order update events', async () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useWebSocket(), { wrapper });

    const orderUpdateEvent: OrderUpdateEvent = {
      type: 'order_update',
      data: {
        id: 'ORD-001',
        status: 'shipped',
        updatedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    // Trigger order update event
    if (eventHandler) {
      eventHandler(orderUpdateEvent);
    }

    await waitFor(() => {
      expect(mockData.updateOrderInDatabase).toHaveBeenCalledWith('ORD-001', {
        status: 'shipped',
        updatedAt: orderUpdateEvent.data.updatedAt,
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['orders'],
      });
    });
  });

  it('does not update order if status is missing', async () => {
    renderHook(() => useWebSocket(), { wrapper });

    const orderUpdateEvent: OrderWebSocketEvent = {
      type: 'order_update',
      data: {
        id: 'ORD-001',
        status: undefined as never,
        updatedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    // Trigger order update event without status
    if (eventHandler) {
      eventHandler(orderUpdateEvent);
    }

    await waitFor(() => {
      expect(mockData.updateOrderInDatabase).not.toHaveBeenCalled();
    });
  });

  it('invalidates queries for any event type', async () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useWebSocket(), { wrapper });

    const newOrderEvent: NewOrderEvent = {
      type: 'new_order',
      data: {
        id: 'ORD-NEW',
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        status: 'pending',
        items: [],
        totalAmount: 100,
        currency: 'USD',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        shippingAddress: {
          street: '123 Test St',
          city: 'Test City',
          country: 'Test Country',
          postalCode: '12345',
        },
      },
      timestamp: new Date().toISOString(),
    };

    // Clear previous calls
    invalidateQueriesSpy.mockClear();

    // Trigger event
    if (eventHandler) {
      eventHandler(newOrderEvent);
    }

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['orders'],
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('unsubscribes from events on unmount', () => {
    const unsubscribeEvents = vi.fn();
    const unsubscribeStatus = vi.fn();

    mockWs.on.mockReturnValue(unsubscribeEvents);
    mockWs.onStatusChange.mockReturnValue(unsubscribeStatus);

    const { unmount } = renderHook(() => useWebSocket(), { wrapper });

    expect(mockWs.on).toHaveBeenCalled();
    expect(mockWs.onStatusChange).toHaveBeenCalled();

    unmount();

    expect(unsubscribeEvents).toHaveBeenCalled();
    expect(unsubscribeStatus).toHaveBeenCalled();
  });
});
