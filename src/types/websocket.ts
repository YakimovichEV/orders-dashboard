import type { Order } from './order';

export type WebSocketStatus = 'connected' | 'disconnected' | 'reconnecting';

export interface WebSocketEvent<T = unknown> {
  type: string;
  data: T;
  timestamp: string;
}

export interface NewOrderEvent extends WebSocketEvent<Order> {
  type: 'new_order';
}

export interface OrderUpdateEvent extends WebSocketEvent<
  Partial<Order> & { id: string }
> {
  type: 'order_update';
}

export type OrderWebSocketEvent = NewOrderEvent | OrderUpdateEvent;
