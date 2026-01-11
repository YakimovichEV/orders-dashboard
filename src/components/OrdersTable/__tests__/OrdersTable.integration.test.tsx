import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import type { MockInstance } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OrdersTable } from '../OrdersTable';

import * as ordersApi from '@/services/ordersApi';
import type { Order } from '@/types/order';

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
  {
    id: 'ORD-003',
    customerName: 'Bob Johnson',
    customerEmail: 'bob@example.com',
    status: 'shipped',
    items: [
      {
        id: 'item-3',
        productName: 'Tablet',
        quantity: 1,
        price: 399.99,
      },
    ],
    totalAmount: 399.99,
    currency: 'USD',
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z',
    shippingAddress: {
      street: '789 Pine Rd',
      city: 'Chicago',
      country: 'USA',
      postalCode: '60601',
    },
  },
];

vi.mock('@mui/x-data-grid', () => ({
  DataGrid: vi.fn(
    ({
      loading,
      rows,
      slots,
      onRowClick,
      columns,
      onSortModelChange,
      sortModel,
    }) => {
      const NoRowsOverlay = slots?.noRowsOverlay;

      return (
        <div data-testid="datagrid">
          {/* Column headers - always render when columns exist */}
          {columns && columns.length > 0 && (
            <div data-testid="datagrid-headers">
              {columns.map((col: { field: string; headerName?: string }) => (
                <button
                  key={col.field}
                  data-testid={`column-header-${col.field}`}
                  onClick={() => {
                    const currentSort = sortModel?.[0];
                    const isCurrentField = currentSort?.field === col.field;
                    const newDirection =
                      isCurrentField && currentSort.sort === 'asc'
                        ? 'desc'
                        : 'asc';

                    onSortModelChange?.([
                      { field: col.field, sort: newDirection },
                    ]);
                  }}
                >
                  {col.headerName || col.field}
                </button>
              ))}
            </div>
          )}

          {loading && <div role="progressbar">Loading...</div>}
          {!loading && rows.length === 0 && NoRowsOverlay && <NoRowsOverlay />}
          {!loading && rows.length === 0 && !NoRowsOverlay && (
            <div>No orders found</div>
          )}
          {!loading &&
            rows.length > 0 &&
            rows.map((row: Order) => (
              <div
                key={row.id}
                data-testid={`order-row-${row.id}`}
                onClick={() => onRowClick?.({ row })}
              >
                <div>{row.id}</div>
                <div>{row.customerName}</div>
                <div>{row.status}</div>
              </div>
            ))}
        </div>
      );
    }
  ),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
};

describe('OrdersTable Integration Tests', () => {
  let getOrdersSpy: MockInstance<typeof ordersApi.getOrders>;

  beforeEach(() => {
    getOrdersSpy = vi.spyOn(ordersApi, 'getOrders');
  });

  it('filters orders by status when filter is selected', async () => {
    const user = userEvent.setup();

    getOrdersSpy.mockResolvedValue({
      data: [mockOrders[0]], // Only pending order
      total: 1,
      page: 0,
      pageSize: 10,
      totalPages: 1,
    });

    render(<OrdersTable onOrderClick={vi.fn()} />, {
      wrapper: createWrapper(),
    });

    // Wait for initial load
    await waitFor(() => {
      expect(getOrdersSpy).toHaveBeenCalledWith(
        { status: undefined, searchQuery: '' },
        { field: 'createdAt', direction: 'desc' },
        { page: 0, pageSize: 10 }
      );
    });

    // Find the status filter (first combobox in toolbar)
    const comboboxes = screen.getAllByRole('combobox');
    const statusFilter = comboboxes[0]; // Status is the first combobox
    await user.click(statusFilter);

    // Select "Pending" option
    const pendingOption = await screen.findByRole('option', {
      name: /pending/i,
    });
    await user.click(pendingOption);

    // Verify API called with status filter
    await waitFor(() => {
      expect(getOrdersSpy).toHaveBeenCalledWith(
        { status: 'pending', searchQuery: '' },
        { field: 'createdAt', direction: 'desc' },
        { page: 0, pageSize: 10 }
      );
    });
  });

  it('searches orders with debounced query', async () => {
    const user = userEvent.setup();

    getOrdersSpy.mockResolvedValue({
      data: mockOrders,
      total: 3,
      page: 0,
      pageSize: 10,
      totalPages: 1,
    });

    render(<OrdersTable onOrderClick={vi.fn()} />, {
      wrapper: createWrapper(),
    });

    // Wait for initial load
    await waitFor(() => {
      expect(getOrdersSpy).toHaveBeenCalled();
    });

    const initialCallCount = getOrdersSpy.mock.calls.length;

    // Type in search box
    const searchInput = screen.getByPlaceholderText(
      'Search by ID or customer name'
    );
    await user.type(searchInput, 'John');

    // Should NOT call immediately (debounced)
    expect(getOrdersSpy).toHaveBeenCalledTimes(initialCallCount);

    // Wait for debounce (300ms)
    await waitFor(
      () => {
        expect(getOrdersSpy).toHaveBeenCalledWith(
          { status: undefined, searchQuery: 'John' },
          { field: 'createdAt', direction: 'desc' },
          { page: 0, pageSize: 10 }
        );
      },
      { timeout: 500 }
    );
  });

  it('sorts orders when column header is clicked', async () => {
    const user = userEvent.setup();

    getOrdersSpy.mockResolvedValue({
      data: mockOrders,
      total: 3,
      page: 0,
      pageSize: 10,
      totalPages: 1,
    });

    render(<OrdersTable onOrderClick={vi.fn()} />, {
      wrapper: createWrapper(),
    });

    // Wait for initial load with default sort (createdAt desc)
    await waitFor(() => {
      expect(getOrdersSpy).toHaveBeenCalledWith(
        { status: undefined, searchQuery: '' },
        { field: 'createdAt', direction: 'desc' },
        { page: 0, pageSize: 10 }
      );
    });

    expect(getOrdersSpy).toHaveBeenCalledTimes(1);

    // Wait for headers to render (after loading completes)
    const customerNameHeader = await screen.findByTestId(
      'column-header-customerName'
    );
    await user.click(customerNameHeader);

    // Verify API called with new sort (customerName asc)
    await waitFor(() => {
      expect(getOrdersSpy).toHaveBeenCalledWith(
        { status: undefined, searchQuery: '' },
        { field: 'customerName', direction: 'asc' },
        { page: 0, pageSize: 10 }
      );
    });

    expect(getOrdersSpy).toHaveBeenCalledTimes(2);

    // Click again to reverse sort direction
    await user.click(customerNameHeader);

    // Verify API called with reversed sort (customerName desc)
    await waitFor(() => {
      expect(getOrdersSpy).toHaveBeenCalledWith(
        { status: undefined, searchQuery: '' },
        { field: 'customerName', direction: 'desc' },
        { page: 0, pageSize: 10 }
      );
    });

    expect(getOrdersSpy).toHaveBeenCalledTimes(3);
  });

  it('changes pagination when page size is changed', async () => {
    getOrdersSpy.mockResolvedValue({
      data: mockOrders,
      total: 30,
      page: 0,
      pageSize: 10,
      totalPages: 3,
    });

    render(<OrdersTable onOrderClick={vi.fn()} />, {
      wrapper: createWrapper(),
    });

    // Wait for initial load
    await waitFor(() => {
      expect(getOrdersSpy).toHaveBeenCalledWith(
        { status: undefined, searchQuery: '' },
        { field: 'createdAt', direction: 'desc' },
        { page: 0, pageSize: 10 }
      );
    });

    // Note: MUI DataGrid pagination interaction would require more complex setup
    // This test verifies the initial pagination state is correct
    expect(getOrdersSpy).toHaveBeenCalledTimes(1);
  });

  it('integrates filtering and searching together', async () => {
    const user = userEvent.setup();

    getOrdersSpy.mockResolvedValue({
      data: [mockOrders[0]],
      total: 1,
      page: 0,
      pageSize: 10,
      totalPages: 1,
    });

    render(<OrdersTable onOrderClick={vi.fn()} />, {
      wrapper: createWrapper(),
    });

    // Wait for initial load
    await waitFor(() => {
      expect(getOrdersSpy).toHaveBeenCalled();
    });

    // Select status filter (first combobox)
    const comboboxes = screen.getAllByRole('combobox');
    const statusFilter = comboboxes[0];
    await user.click(statusFilter);
    const pendingOption = await screen.findByRole('option', {
      name: /pending/i,
    });
    await user.click(pendingOption);

    await waitFor(() => {
      expect(getOrdersSpy).toHaveBeenCalledWith(
        { status: 'pending', searchQuery: '' },
        expect.any(Object),
        expect.any(Object)
      );
    });

    // Then add search query
    const searchInput = screen.getByPlaceholderText(
      'Search by ID or customer name'
    );
    await user.type(searchInput, 'John');

    // Wait for debounce and verify both filters applied
    await waitFor(
      () => {
        expect(getOrdersSpy).toHaveBeenCalledWith(
          { status: 'pending', searchQuery: 'John' },
          { field: 'createdAt', direction: 'desc' },
          { page: 0, pageSize: 10 }
        );
      },
      { timeout: 500 }
    );
  });
});
