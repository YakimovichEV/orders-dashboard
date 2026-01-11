import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import type { SelectChangeEvent } from '@mui/material/Select';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import type { PageSize } from '@/types/common';
import { PAGINATION_OPTIONS } from '@/types/common';
import type { OrderStatus } from '@/types/order';
import { ORDER_STATUSES } from '@/types/order';

interface OrdersTableToolbarProps {
  searchQuery: string;
  statusFilter: OrderStatus | '';
  pageSize: PageSize;
  totalCount: number;
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (status: OrderStatus | '') => void;
  onPageSizeChange: (pageSize: PageSize) => void;
}

export function OrdersTableToolbar({
  searchQuery,
  statusFilter,
  pageSize,
  totalCount,
  onSearchChange,
  onStatusFilterChange,
  onPageSizeChange,
}: OrdersTableToolbarProps) {
  const handleStatusChange = (event: SelectChangeEvent<OrderStatus | ''>) => {
    onStatusFilterChange(event.target.value as OrderStatus | '');
  };

  const handlePageSizeChange = (event: SelectChangeEvent<PageSize>) => {
    onPageSizeChange(event.target.value as PageSize);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        mb: 3,
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, flex: 1, flexWrap: 'wrap' }}>
        <TextField
          label="Search orders..."
          placeholder="Search by ID, customer name, or email"
          size="small"
          sx={{ minWidth: 250, flex: 1 }}
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={statusFilter}
            onChange={handleStatusChange}
          >
            <MenuItem value="">All</MenuItem>
            {ORDER_STATUSES.map(status => (
              <MenuItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Per page</InputLabel>
          <Select
            label="Per page"
            value={pageSize}
            onChange={handlePageSizeChange}
          >
            {PAGINATION_OPTIONS.map(option => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Typography
        color="text.secondary"
        sx={{ whiteSpace: 'nowrap' }}
        variant="body2"
      >
        {totalCount} {totalCount === 1 ? 'order' : 'orders'} found
      </Typography>
    </Box>
  );
}
