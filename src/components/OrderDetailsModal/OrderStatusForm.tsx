import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import type { OrderStatus } from '@/types/order';
import { ORDER_STATUSES } from '@/types/order';

const orderStatusSchema = z.object({
  status: z.enum([
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ]),
});

type OrderStatusFormData = z.infer<typeof orderStatusSchema>;

interface OrderStatusFormProps {
  currentStatus: OrderStatus;
  onSubmit: (status: OrderStatus) => void;
  onCancel: VoidFunction;
  isLoading: boolean;
}

export function OrderStatusForm({
  currentStatus,
  onSubmit,
  onCancel,
  isLoading,
}: OrderStatusFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<OrderStatusFormData>({
    resolver: zodResolver(orderStatusSchema),
    defaultValues: {
      status: currentStatus,
    },
  });

  const onFormSubmit = (data: OrderStatusFormData) => {
    onSubmit(data.status);
  };

  return (
    <Box component="form" sx={{ mt: 3 }} onSubmit={handleSubmit(onFormSubmit)}>
      <Controller
        control={control}
        name="status"
        render={({ field }) => (
          <FormControl fullWidth error={!!errors.status}>
            <InputLabel>Order Status</InputLabel>
            <Select {...field} label="Order Status">
              {ORDER_STATUSES.map(status => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </MenuItem>
              ))}
            </Select>
            {errors.status && (
              <FormHelperText>{errors.status.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />

      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button disabled={isLoading} onClick={onCancel}>
          Cancel
        </Button>
        <Button
          disabled={!isDirty || isLoading}
          type="submit"
          variant="contained"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>
    </Box>
  );
}
