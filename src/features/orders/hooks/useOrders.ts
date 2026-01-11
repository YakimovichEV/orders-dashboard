import { useQuery } from '@tanstack/react-query';

import { getOrders } from '@/services/ordersApi';
import type { PaginationParams, SortConfig } from '@/types/common';
import type { OrderFilters, OrderSortField, orderKeys } from '@/types/order';

export function useOrders(
  filters: OrderFilters,
  sort: SortConfig<OrderSortField>,
  pagination: PaginationParams
) {
  return useQuery({
    queryKey: ['orders', 'list', { filters, sort, pagination }] as ReturnType<
      typeof orderKeys.list
    >,
    queryFn: () => getOrders(filters, sort, pagination),
  });
}
