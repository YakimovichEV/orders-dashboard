import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import type {
  GridColDef,
  GridPaginationModel,
  GridSortModel,
} from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import { useMemo, useState } from 'react';

import { OrdersTableToolbar } from './OrdersTableToolbar';

import { PAGINATION_CONFIG } from '@/constants/pagination';
import { useOrders } from '@/features/orders/hooks/useOrders';
import { useDebounce } from '@/hooks/useDebounce';
import type { PageSize, SortDirection } from '@/types/common';
import type { Order, OrderSortField, OrderStatus } from '@/types/order';
import { ORDER_STATUS_COLORS } from '@/types/order';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface OrdersTableProps {
  onOrderClick: (order: Order) => void;
}

export function OrdersTable({ onOrderClick }: OrdersTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'createdAt', sort: 'desc' },
  ]);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const sortField = (sortModel[0]?.field || 'createdAt') as OrderSortField;
  const sortDirection = (sortModel[0]?.sort || 'desc') as SortDirection;

  const { data, isLoading, isError } = useOrders(
    {
      status: statusFilter || undefined,
      searchQuery: debouncedSearchQuery,
    },
    { field: sortField, direction: sortDirection },
    {
      page: paginationModel.page,
      pageSize: paginationModel.pageSize as PageSize,
    }
  );

  const columns: GridColDef<Order>[] = useMemo(
    () => [
      { field: 'id', headerName: 'Order ID', flex: 1, minWidth: 260 },
      {
        field: 'customerName',
        headerName: 'Customer Name',
        flex: 1,
        minWidth: 200,
      },
      {
        field: 'status',
        headerName: 'Status',
        flex: 1,
        minWidth: 140,
        renderCell: params => (
          <Chip
            aria-label={`Order status: ${params.value}`}
            label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
            size="small"
            sx={{
              backgroundColor: ORDER_STATUS_COLORS[params.value as OrderStatus],
              color: 'white',
              fontWeight: 500,
            }}
          />
        ),
      },
      {
        field: 'totalAmount',
        headerName: 'Total Amount',
        flex: 1,
        minWidth: 160,
        valueFormatter: (value, row) => formatCurrency(value, row.currency),
      },
      {
        field: 'createdAt',
        headerName: 'Created date',
        flex: 1,
        minWidth: 160,
        valueFormatter: value => formatDate(value),
      },
    ],
    []
  );

  const handlePageSizeChange = (newPageSize: PageSize) => {
    setPaginationModel(prev => ({ ...prev, pageSize: newPageSize, page: 0 }));
  };

  const ErrorOverlay = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      <Typography color="error" fontWeight={500} variant="h6">
        Failed to load orders. Please try again.
      </Typography>
    </Box>
  );

  const NoRowsOverlay = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      <Typography color="text.secondary" variant="body1">
        No orders found
      </Typography>
    </Box>
  );

  return (
    <div>
      <OrdersTableToolbar
        pageSize={paginationModel.pageSize as PageSize}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        totalCount={data?.total || 0}
        onPageSizeChange={handlePageSizeChange}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
      />

      <DataGrid
        autoHeight
        disableColumnResize
        disableRowSelectionOnClick
        aria-label="Orders table"
        checkboxSelection={false}
        columns={columns}
        loading={isLoading}
        pageSizeOptions={[10, 25, 50]}
        paginationMode="server"
        paginationModel={paginationModel}
        rowCount={data?.total || 0}
        rowSelection={false}
        rows={isError ? [] : data?.data || []}
        slots={{
          noRowsOverlay: isError ? ErrorOverlay : NoRowsOverlay,
        }}
        sortModel={sortModel}
        sortingMode="server"
        sx={{
          '& .MuiDataGrid-row': { cursor: 'pointer' },
          '& .MuiDataGrid-cell:focus': { outline: 'none' },
          '& .MuiDataGrid-row:hover': { backgroundColor: 'action.hover' },
        }}
        onPaginationModelChange={setPaginationModel}
        onRowClick={params => onOrderClick(params.row)}
        onSortModelChange={setSortModel}
      />
    </div>
  );
}
