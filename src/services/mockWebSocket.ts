import {
  generateOrder,
  generateRandomStatus,
  getMockDatabase,
} from './mockData';

import { WEBSOCKET_CONFIG } from '@/constants/websocket';
import type {
  NewOrderEvent,
  OrderUpdateEvent,
  OrderWebSocketEvent,
  WebSocketStatus,
} from '@/types/websocket';

type WebSocketEventHandler = (event: OrderWebSocketEvent) => void;
type StatusChangeHandler = (status: WebSocketStatus) => void;

export class MockWebSocket {
  private status: WebSocketStatus = 'disconnected';
  private eventHandlers: Set<WebSocketEventHandler> = new Set();
  private statusHandlers: Set<StatusChangeHandler> = new Set();
  private eventInterval: ReturnType<typeof setTimeout> | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private isManualDisconnect = false;

  constructor() {
    this.connect();
  }

  public connect(): void {
    if (this.status === 'connected') {
      return;
    }

    this.isManualDisconnect = false;
    this.updateStatus('connected');
    this.reconnectAttempt = 0;
    this.startEventLoop();

    console.log('[MockWebSocket] Connected');
  }

  public disconnect(): void {
    this.isManualDisconnect = true;
    this.cleanup();
    this.updateStatus('disconnected');
    console.log('[MockWebSocket] Disconnected');
  }

  private simulateConnectionDrop(): void {
    if (this.isManualDisconnect) return;

    this.cleanup();
    this.updateStatus('disconnected');
    console.log('[MockWebSocket] Connection dropped');

    this.attemptReconnect();
  }

  private attemptReconnect(): void {
    if (this.isManualDisconnect) return;

    this.updateStatus('reconnecting');

    const delay = Math.min(
      WEBSOCKET_CONFIG.INITIAL_RECONNECT_DELAY *
        Math.pow(WEBSOCKET_CONFIG.RECONNECT_MULTIPLIER, this.reconnectAttempt),
      WEBSOCKET_CONFIG.MAX_RECONNECT_DELAY
    );

    this.reconnectAttempt++;

    console.log(
      `[MockWebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempt})...`
    );

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startEventLoop(): void {
    const emitRandomEvent = () => {
      const interval =
        Math.random() *
          (WEBSOCKET_CONFIG.EVENT_INTERVAL_MAX -
            WEBSOCKET_CONFIG.EVENT_INTERVAL_MIN) +
        WEBSOCKET_CONFIG.EVENT_INTERVAL_MIN;

      this.eventInterval = setTimeout(() => {
        if (this.status === 'connected') {
          this.emitRandomEvent();

          if (Math.random() < 0.05) {
            this.simulateConnectionDrop();
            return;
          }

          emitRandomEvent();
        }
      }, interval);
    };

    emitRandomEvent();
  }

  private emitRandomEvent(): void {
    const isNewOrder = Math.random() < WEBSOCKET_CONFIG.NEW_ORDER_PROBABILITY;

    if (isNewOrder) {
      this.emitNewOrder();
    } else {
      this.emitOrderUpdate();
    }
  }

  private emitNewOrder(): void {
    const newOrder = generateOrder();

    const event: NewOrderEvent = {
      type: 'new_order',
      data: newOrder,
      timestamp: new Date().toISOString(),
    };

    console.log('[MockWebSocket] New order:', newOrder.id);
    this.notifyHandlers(event);
  }

  private emitOrderUpdate(): void {
    const orders = getMockDatabase();
    if (orders.length === 0) return;

    const randomOrder = orders[Math.floor(Math.random() * orders.length)];
    const newStatus = generateRandomStatus(randomOrder.status);

    const event: OrderUpdateEvent = {
      type: 'order_update',
      data: {
        id: randomOrder.id,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    console.log(
      `[MockWebSocket] Order update: ${randomOrder.id} -> ${newStatus}`
    );
    this.notifyHandlers(event);
  }

  public on(handler: WebSocketEventHandler): () => void {
    this.eventHandlers.add(handler);

    return () => {
      this.eventHandlers.delete(handler);
    };
  }

  public onStatusChange(handler: StatusChangeHandler): () => void {
    this.statusHandlers.add(handler);

    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  public getStatus(): WebSocketStatus {
    return this.status;
  }

  private updateStatus(newStatus: WebSocketStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.statusHandlers.forEach(handler => handler(newStatus));
    }
  }

  private notifyHandlers(event: OrderWebSocketEvent): void {
    this.eventHandlers.forEach(handler => handler(event));
  }

  private cleanup(): void {
    if (this.eventInterval) {
      clearTimeout(this.eventInterval);
      this.eventInterval = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  public destroy(): void {
    this.disconnect();
    this.eventHandlers.clear();
    this.statusHandlers.clear();
    console.log('[MockWebSocket] Destroyed');
  }
}

let mockWebSocketInstance: MockWebSocket | null = null;

export function getMockWebSocket(): MockWebSocket {
  if (!mockWebSocketInstance) {
    mockWebSocketInstance = new MockWebSocket();
  }
  return mockWebSocketInstance;
}

export function destroyMockWebSocket(): void {
  if (mockWebSocketInstance) {
    mockWebSocketInstance.destroy();
    mockWebSocketInstance = null;
  }
}
