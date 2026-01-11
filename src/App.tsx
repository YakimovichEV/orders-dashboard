import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { ConnectionStatus } from '@/components/ConnectionStatus/ConnectionStatus';
import { OrderDetailsModal } from '@/components/OrderDetailsModal/OrderDetailsModal';
import { OrdersTable } from '@/components/OrdersTable/OrdersTable';
import { useWebSocket } from '@/features/orders/hooks/useWebSocket';
import type { Order } from '@/types/order';

function App() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { status } = useWebSocket();

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        elevation={0}
        position="static"
        sx={{
          bgcolor: 'white',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Box
            sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography fontWeight={700} sx={{ color: 'white' }} variant="h6">
                O
              </Typography>
            </Box>
            <Box>
              <Typography
                fontWeight={600}
                sx={{ color: 'text.primary' }}
                variant="h6"
              >
                Orders Dashboard
              </Typography>
              <Typography color="text.secondary" variant="caption">
                Real-time order management
              </Typography>
            </Box>
          </Box>
          <ConnectionStatus status={status} />
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ my: 4, flex: 1 }}>
        <Typography gutterBottom variant="h4">
          Orders Management
        </Typography>
        <Typography gutterBottom color="text.secondary" variant="body1">
          View and manage all customer orders in real-time
        </Typography>

        <Box sx={{ mt: 4 }}>
          <OrdersTable onOrderClick={handleOrderClick} />
        </Box>
      </Container>

      {modalOpen && selectedOrder && (
        <OrderDetailsModal
          open={modalOpen}
          order={selectedOrder}
          onClose={handleCloseModal}
        />
      )}
    </Box>
  );
}

export default App;
