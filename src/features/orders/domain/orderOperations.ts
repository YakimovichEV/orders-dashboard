import type { PaginatedResponse } from '@/types/common';
import type { Order, OrderStatus } from '@/types/order';

/**
 * Apply optimistic order status update to a paginated list
 * Pure function - testable, no side effects
 */
export function applyOptimisticStatusUpdate(
  response: PaginatedResponse<Order>,
  orderId: string,
  status: OrderStatus,
  timestamp: string
): PaginatedResponse<Order> {
  return {
    ...response,
    data: response.data.map(order =>
      order.id === orderId ? { ...order, status, updatedAt: timestamp } : order
    ),
  };
}

/**
 * Reconcile server response into paginated list
 * Server is source of truth - use its data
 */
export function reconcileServerUpdate(
  response: PaginatedResponse<Order>,
  updatedOrder: Order
): PaginatedResponse<Order> {
  return {
    ...response,
    data: response.data.map(order =>
      order.id === updatedOrder.id ? updatedOrder : order
    ),
  };
}

/**
 * Check if order exists in paginated response
 */
export function orderExistsInResponse(
  response: PaginatedResponse<Order>,
  orderId: string
): boolean {
  return response.data.some(order => order.id === orderId);
}
