import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';

import { OrderStatusForm } from './OrderStatusForm';

import { useUpdateOrderStatus } from '@/features/orders/hooks/useOrderMutation';
import type { Order, OrderStatus } from '@/types/order';
import { ORDER_STATUS_COLORS } from '@/types/order';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface OrderDetailsModalProps {
  order: Order | null;
  open: boolean;
  onClose: VoidFunction;
}

const InfoField = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <Box>
    <Typography color="text.secondary" variant="body2">
      {label}
    </Typography>
    <Typography sx={{ mt: 0.5 }} variant="body1">
      {value}
    </Typography>
  </Box>
);

export function OrderDetailsModal({
  order,
  open,
  onClose,
}: OrderDetailsModalProps) {
  const updateOrderStatus = useUpdateOrderStatus();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!order) {
    return null;
  }

  const handleStatusUpdate = (status: OrderStatus) => {
    updateOrderStatus.mutate(
      { orderId: order.id, status },
      {
        onSuccess: () => {
          onClose();
        },
        onError: error => {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Failed to update order status. Please try again.'
          );
        },
      }
    );
  };

  const handleCloseError = () => {
    setErrorMessage(null);
  };

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6">Order Details</Typography>
          <IconButton
            aria-label="Close order details"
            edge="end"
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 3,
            }}
          >
            <InfoField label="Order ID" value={order.id} />
            <Box>
              <Typography color="text.secondary" variant="body2">
                Status
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={
                    order.status.charAt(0).toUpperCase() + order.status.slice(1)
                  }
                  size="small"
                  sx={{
                    backgroundColor: ORDER_STATUS_COLORS[order.status],
                    color: 'white',
                    fontWeight: 500,
                  }}
                />
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 3,
            }}
          >
            <InfoField label="Customer Name" value={order.customerName} />
            <InfoField label="Customer Email" value={order.customerEmail} />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 3,
            }}
          >
            <InfoField
              label="Created"
              value={formatDate(order.createdAt, 'long')}
            />
            <InfoField
              label="Last Updated"
              value={formatDate(order.updatedAt, 'long')}
            />
          </Box>

          <Divider />

          <Box>
            <Typography gutterBottom variant="h6">
              Shipping Address
            </Typography>
            <Typography variant="body2">
              {order.shippingAddress.street}
            </Typography>
            <Typography variant="body2">
              {order.shippingAddress.city}, {order.shippingAddress.postalCode}
            </Typography>
            <Typography variant="body2">
              {order.shippingAddress.country}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography gutterBottom variant="h6">
              Order Items
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(item.price, order.currency)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(
                          item.price * item.quantity,
                          order.currency
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography fontWeight={600} variant="body2">
                        Total
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600} variant="body2">
                        {formatCurrency(order.totalAmount, order.currency)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Divider />

          <Box>
            <Typography gutterBottom variant="h6">
              Update Status
            </Typography>
            <OrderStatusForm
              currentStatus={order.status}
              isLoading={updateOrderStatus.isPending}
              onCancel={onClose}
              onSubmit={handleStatusUpdate}
            />
          </Box>
        </Box>
      </DialogContent>

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={6000}
        open={!!errorMessage}
        onClose={handleCloseError}
      >
        <Alert
          severity="error"
          sx={{ width: '100%' }}
          onClose={handleCloseError}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
