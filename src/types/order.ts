import type { Address } from './address';
import type { PaginationParams, SortConfig } from './common';

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#FFA726',
  processing: '#29B6F6',
  shipped: '#AB47BC',
  delivered: '#66BB6A',
  cancelled: '#EF5350',
};

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  shippingAddress: Address;
}

export interface OrderFilters {
  status?: OrderStatus;
  searchQuery?: string;
}

export type OrderSortField =
  | 'id'
  | 'customerName'
  | 'status'
  | 'totalAmount'
  | 'createdAt';

export interface UpdateOrderStatusForm {
  status: OrderStatus;
}

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (
    filters: OrderFilters,
    sort: SortConfig<OrderSortField>,
    pagination: PaginationParams
  ) => [...orderKeys.lists(), { filters, sort, pagination }] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};
