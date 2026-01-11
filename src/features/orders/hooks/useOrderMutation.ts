import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  applyOptimisticStatusUpdate,
  reconcileServerUpdate,
} from '../domain/orderOperations';

import { updateOrderStatus } from '@/services/ordersApi';
import type { PaginatedResponse } from '@/types/common';
import type { Order, OrderStatus } from '@/types/order';

interface UpdateOrderStatusVariables {
  orderId: string;
  status: OrderStatus;
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: UpdateOrderStatusVariables) =>
      updateOrderStatus(orderId, status),

    // Phase 1: Optimistic update
    onMutate: async ({ orderId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['orders', 'list'] });

      const previousQueries = queryClient.getQueriesData<
        PaginatedResponse<Order>
      >({
        queryKey: ['orders', 'list'],
      });

      const timestamp = new Date().toISOString();

      queryClient.setQueriesData<PaginatedResponse<Order>>(
        { queryKey: ['orders', 'list'] },
        old => {
          if (!old?.data) return old;
          return applyOptimisticStatusUpdate(old, orderId, status, timestamp);
        }
      );

      return { previousQueries };
    },

    // Phase 2: Reconcile with server (success)
    onSuccess: (updatedOrder, { orderId }) => {
      if (!updatedOrder) {
        // Order not found on server - invalidate to refetch
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        return;
      }

      // Reconcile all list queries with server response (source of truth)
      queryClient.setQueriesData<PaginatedResponse<Order>>(
        { queryKey: ['orders', 'list'] },
        old => {
          if (!old?.data) return old;
          return reconcileServerUpdate(old, updatedOrder);
        }
      );

      // Update detail view if exists
      queryClient.setQueryData<Order>(
        ['orders', 'detail', orderId],
        updatedOrder
      );
    },

    // Phase 3: Rollback on error
    onError: (_error, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      // Invalidate to ensure fresh data after error
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
