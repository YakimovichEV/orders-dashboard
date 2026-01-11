# Orders Dashboard

A modern, real-time e-commerce Orders Dashboard built with React, TypeScript, and Material UI. Features live WebSocket updates, advanced filtering, sorting, and pagination capabilities.

## Features

- **Real-time Updates**: WebSocket integration with automatic reconnection
- **Advanced Table**: Sortable columns, filtering by status, and search functionality
- **Pagination**: Customizable page sizes (10, 25, 50 items per page)
- **Order Management**: View detailed order information and update order status
- **Connection Status**: Visual indicator showing WebSocket connection state
- **Responsive Design**: Works seamlessly on desktop and tablet devices
- **Type Safety**: Full TypeScript strict mode with no `any` types
- **Test Coverage**: 19 comprehensive tests covering components, utilities, and hooks

## Tech Stack

### Core

- **React** 19.2.0
- **TypeScript** 5.9.3 - Type-safe JavaScript
- **Vite** 7.2.4 - Build tool and dev server
- **Material UI** 7.3.7 - Component library

### State & Data Management

- **TanStack Query** 5.x - Server state management
- **React Hook Form** 7.x - Form handling
- **Zod** 4.x - Schema validation

### Development & Testing

- **Vitest** 2.x - Unit testing framework
- **React Testing Library** 16.x - Component testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

### Mock Data

- **@faker-js/faker** 10.x - Realistic mock data generation

## Project Structure

```
src/
├── components/
│   ├── OrdersTable/
│   ├── OrderDetailsModal/
│   ├── ConnectionStatus/
│   └── ui/
├── features/
│   └── orders/
│       └── hooks/
├── services/
│   ├── ordersApi.ts
│   ├── mockData.ts
│   └── mockWebSocket.ts
├── types/
│   ├── order.ts
│   ├── websocket.ts
│   ├── common.ts
│   └── address.ts
├── constants/
├── hooks/
├── utils/
├── theme/
└── __tests__/
```

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server (http://localhost:3000)
npm run dev

# or
npm start
```

### Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Run all checks
npm run check-all

# Fix all issues
npm run fix-all
```

## Key Implementation Details

### WebSocket Simulation

The application uses a mock WebSocket class that simulates real-time order updates:

- **Connection Management**: Automatic connection with reconnection logic
- **Exponential Backoff**: Reconnects with increasing delays (1s, 2s, 4s, 8s, max 30s)
- **Event Types**: New order creation (20%) and order status updates (80%)
- **Connection Drops**: Random disconnections to test reconnection logic

### State Management

- **TanStack Query**: Handles server state with caching and automatic refetching
- **Optimistic Updates**: UI updates immediately before server confirmation
- **Cache Invalidation**: Smart cache updates on WebSocket events

### Mock API

The mock API simulates realistic network delays (100-300ms) and provides:

- Filtered and sorted order lists
- Pagination support
- Individual order fetching
- Order status updates

## Testing

The project includes 19 comprehensive tests:

### Component Tests (4 tests)

- OrdersTable rendering with data
- Loading state display
- Empty state handling
- Error state display

### Utility Tests (12 tests)

- Currency formatting (USD, zero values, large numbers)
- Date formatting (short and long formats)
- Relative time formatting (minutes, hours, days ago)

### Hook Tests (3 tests)

- useDebounce initial value
- Debounced value changes
- Different value types

## Performance Optimizations

- **Debounced Search**: 300ms delay prevents excessive API calls
- **Query Caching**: TanStack Query caches responses for 30 seconds
- **Optimistic Updates**: Immediate UI feedback for better UX
- **Code Splitting**: Ready for dynamic imports when needed

## License

MIT
