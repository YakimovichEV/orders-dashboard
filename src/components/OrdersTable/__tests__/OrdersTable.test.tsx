import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { OrdersTable } from '../OrdersTable';

import * as useOrdersHook from '@/features/orders/hooks/useOrders';
import type { Order } from '@/types/order';

vi.mock('@mui/x-data-grid', () => ({
  DataGrid: vi.fn(({ loading, rows, slots }) => {
    // Render custom overlay if provided
    const NoRowsOverlay = slots?.noRowsOverlay;

    return (
      <div data-testid="datagrid">
        {loading && <div role="progressbar">Loading...</div>}
        {!loading && rows.length === 0 && NoRowsOverlay && <NoRowsOverlay />}
        {!loading && rows.length === 0 && !NoRowsOverlay && (
          <div>No orders found</div>
        )}
        {!loading &&
          rows.length > 0 &&
          rows.map((row: Order) => (
            <div key={row.id}>
              <div>{row.id}</div>
              <div>{row.customerName}</div>
            </div>
          ))}
      </div>
    );
  }),
}));

const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    status: 'pending',
    items: [
      {
        id: 'item-1',
        productName: 'Laptop',
        quantity: 1,
        price: 999.99,
      },
    ],
    totalAmount: 999.99,
    currency: 'USD',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      country: 'USA',
      postalCode: '10001',
    },
  },
  {
    id: 'ORD-002',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    status: 'delivered',
    items: [
      {
        id: 'item-2',
        productName: 'Phone',
        quantity: 2,
        price: 599.99,
      },
    ],
    totalAmount: 1199.98,
    currency: 'USD',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
    shippingAddress: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      country: 'USA',
      postalCode: '90001',
    },
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
};

describe('OrdersTable', () => {
  it('renders table with mock data', async () => {
    vi.spyOn(useOrdersHook, 'useOrders').mockReturnValue({
      data: {
        data: mockOrders,
        total: 2,
        page: 0,
        pageSize: 10,
        totalPages: 1,
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      isSuccess: true,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isPlaceholderData: false,
      isPaused: false,
      isRefetching: false,
      isStale: false,
      isFetched: true,
      isFetchedAfterMount: true,
      isInitialLoading: false,
      isEnabled: true,
      status: 'success',
      fetchStatus: 'idle',
      error: null,
      refetch: vi.fn(),
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      errorUpdatedAt: 0,
      dataUpdatedAt: Date.now(),
      promise: Promise.resolve({
        data: mockOrders,
        total: 2,
        page: 0,
        pageSize: 10,
        totalPages: 1,
      }),
    } as ReturnType<typeof useOrdersHook.useOrders>);

    const mockOnOrderClick = vi.fn();

    render(<OrdersTable onOrderClick={mockOnOrderClick} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText('ORD-001')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('ORD-002')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('displays loading state', () => {
    vi.spyOn(useOrdersHook, 'useOrders').mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      isFetching: true,
      isSuccess: false,
      isPending: true,
      isLoadingError: false,
      isRefetchError: false,
      isPlaceholderData: false,
      isPaused: false,
      isRefetching: false,
      isStale: false,
      isFetched: false,
      isFetchedAfterMount: false,
      isInitialLoading: true,
      isEnabled: true,
      status: 'pending',
      fetchStatus: 'fetching',
      error: null,
      refetch: vi.fn(),
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      errorUpdatedAt: 0,
      dataUpdatedAt: 0,
      promise: new Promise(() => {}),
    } as ReturnType<typeof useOrdersHook.useOrders>);

    const mockOnOrderClick = vi.fn();

    render(<OrdersTable onOrderClick={mockOnOrderClick} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles empty state', async () => {
    vi.spyOn(useOrdersHook, 'useOrders').mockReturnValue({
      data: {
        data: [],
        total: 0,
        page: 0,
        pageSize: 10,
        totalPages: 0,
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      isSuccess: true,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isPlaceholderData: false,
      isPaused: false,
      isRefetching: false,
      isStale: false,
      isFetched: true,
      isFetchedAfterMount: true,
      isInitialLoading: false,
      isEnabled: true,
      status: 'success',
      fetchStatus: 'idle',
      error: null,
      refetch: vi.fn(),
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      errorUpdatedAt: 0,
      dataUpdatedAt: Date.now(),
      promise: Promise.resolve({
        data: [],
        total: 0,
        page: 0,
        pageSize: 10,
        totalPages: 0,
      }),
    } as ReturnType<typeof useOrdersHook.useOrders>);

    const mockOnOrderClick = vi.fn();

    render(<OrdersTable onOrderClick={mockOnOrderClick} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText('No orders found')).toBeInTheDocument();
    });
  });

  it('displays error state', () => {
    const errorPromise = Promise.reject(new Error('Failed to load orders'));
    // Prevent unhandled rejection warning
    errorPromise.catch(() => {});

    vi.spyOn(useOrdersHook, 'useOrders').mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      isFetching: false,
      isSuccess: false,
      isPending: false,
      isLoadingError: true,
      isRefetchError: false,
      isPlaceholderData: false,
      isPaused: false,
      isRefetching: false,
      isStale: false,
      isFetched: true,
      isFetchedAfterMount: true,
      isInitialLoading: false,
      isEnabled: true,
      status: 'error',
      fetchStatus: 'idle',
      error: new Error('Failed to load orders'),
      refetch: vi.fn(),
      failureCount: 1,
      failureReason: new Error('Failed to load orders'),
      errorUpdateCount: 1,
      errorUpdatedAt: Date.now(),
      dataUpdatedAt: 0,
      promise: errorPromise,
    } as ReturnType<typeof useOrdersHook.useOrders>);

    const mockOnOrderClick = vi.fn();

    render(<OrdersTable onOrderClick={mockOnOrderClick} />, {
      wrapper: createWrapper(),
    });

    expect(
      screen.getByText('Failed to load orders. Please try again.')
    ).toBeInTheDocument();
  });
});
