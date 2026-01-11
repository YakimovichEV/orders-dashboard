import {
  getMockDatabase,
  getOrderFromDatabase,
  updateOrderInDatabase,
} from './mockData';

import { API_CONFIG } from '@/constants/api';
import type {
  PaginatedResponse,
  PaginationParams,
  SortConfig,
} from '@/types/common';
import type { Order, OrderFilters, OrderSortField } from '@/types/order';

function simulateDelay(): Promise<void> {
  const delay =
    Math.random() * (API_CONFIG.MAX_DELAY - API_CONFIG.MIN_DELAY) +
    API_CONFIG.MIN_DELAY;
  return new Promise(resolve => setTimeout(resolve, delay));
}

function filterOrders(orders: Order[], filters: OrderFilters): Order[] {
  let filtered = [...orders];

  if (filters.status) {
    filtered = filtered.filter(order => order.status === filters.status);
  }

  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      order =>
        order.id.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query)
    );
  }

  return filtered;
}

function sortOrders(
  orders: Order[],
  sort: SortConfig<OrderSortField>
): Order[] {
  const sorted = [...orders];

  sorted.sort((a, b) => {
    let aValue: string | number = a[sort.field];
    let bValue: string | number = b[sort.field];

    if (sort.field === 'createdAt') {
      aValue = new Date(a.createdAt).getTime();
      bValue = new Date(b.createdAt).getTime();
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sort.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sort.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  return sorted;
}

function paginateOrders(
  orders: Order[],
  pagination: PaginationParams
): Order[] {
  const start = pagination.page * pagination.pageSize;
  const end = start + pagination.pageSize;
  return orders.slice(start, end);
}

export async function getOrders(
  filters: OrderFilters,
  sort: SortConfig<OrderSortField>,
  pagination: PaginationParams
): Promise<PaginatedResponse<Order>> {
  await simulateDelay();

  const allOrders = getMockDatabase();
  const filtered = filterOrders(allOrders, filters);
  const sorted = sortOrders(filtered, sort);
  const paginated = paginateOrders(sorted, pagination);

  const totalPages = Math.ceil(filtered.length / pagination.pageSize);

  return {
    data: paginated,
    total: filtered.length,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages,
  };
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  await simulateDelay();

  const order = getOrderFromDatabase(orderId);
  return order || null;
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status']
): Promise<Order | null> {
  await simulateDelay();

  const updatedOrder = updateOrderInDatabase(orderId, { status });
  return updatedOrder;
}
