import { faker } from '@faker-js/faker';

import { API_CONFIG } from '@/constants/api';
import { DEFAULT_CURRENCY } from '@/constants/app';
import type { Address } from '@/types/address';
import type { Order, OrderItem, OrderStatus } from '@/types/order';
import { ORDER_STATUSES } from '@/types/order';

const PRODUCTS = [
  'Wireless Headphones',
  'Smart Watch',
  'Laptop Stand',
  'Mechanical Keyboard',
  'USB-C Cable',
  'Phone Case',
  'Portable Charger',
  'Webcam',
  'Desk Lamp',
  'Mouse Pad',
  'External SSD',
  'Monitor',
  'Office Chair',
  'Standing Desk',
  'Bluetooth Speaker',
  'Tablet',
  'Microphone',
  'Docking Station',
  'Cable Organizer',
  'Ergonomic Mouse',
];

function generateAddress(): Address {
  return {
    street: faker.location.streetAddress(),
    city: faker.location.city(),
    country: faker.location.country(),
    postalCode: faker.location.zipCode(),
  };
}

function generateOrderItems(): OrderItem[] {
  const itemCount = faker.number.int({ min: 1, max: 5 });
  const items: OrderItem[] = [];

  for (let i = 0; i < itemCount; i++) {
    const product = faker.helpers.arrayElement(PRODUCTS);
    const quantity = faker.number.int({ min: 1, max: 3 });
    const price = faker.number.float({
      min: 9.99,
      max: 999.99,
      multipleOf: 0.01,
    });

    items.push({
      id: faker.string.uuid(),
      productName: product,
      quantity,
      price,
    });
  }

  return items;
}

function calculateTotalAmount(items: OrderItem[]): number {
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  return Math.round(total * 100) / 100;
}

export function generateOrder(overrides?: Partial<Order>): Order {
  const items = generateOrderItems();
  const createdAt = faker.date.past({ years: 1 });
  const updatedAt = faker.date.between({
    from: createdAt,
    to: new Date(),
  });

  return {
    id: faker.string.uuid(),
    customerName: faker.person.fullName(),
    customerEmail: faker.internet.email(),
    status: faker.helpers.arrayElement(ORDER_STATUSES),
    items,
    totalAmount: calculateTotalAmount(items),
    currency: DEFAULT_CURRENCY,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    shippingAddress: generateAddress(),
    ...overrides,
  };
}

export function generateOrders(
  count: number = API_CONFIG.MOCK_ORDERS_COUNT
): Order[] {
  const orders: Order[] = [];

  for (let i = 0; i < count; i++) {
    orders.push(generateOrder());
  }

  return orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function generateRandomStatus(excludeStatus?: OrderStatus): OrderStatus {
  const availableStatuses = excludeStatus
    ? ORDER_STATUSES.filter(status => status !== excludeStatus)
    : ORDER_STATUSES;

  return faker.helpers.arrayElement(availableStatuses);
}

let mockOrdersDatabase: Order[] = [];

export function initializeMockDatabase(): Order[] {
  mockOrdersDatabase = generateOrders();
  return mockOrdersDatabase;
}

export function getMockDatabase(): Order[] {
  if (mockOrdersDatabase.length === 0) {
    initializeMockDatabase();
  }
  return mockOrdersDatabase;
}

export function updateOrderInDatabase(
  orderId: string,
  updates: Partial<Order>
): Order | null {
  const index = mockOrdersDatabase.findIndex(order => order.id === orderId);
  if (index === -1) return null;

  mockOrdersDatabase[index] = {
    ...mockOrdersDatabase[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return mockOrdersDatabase[index];
}

export function addOrderToDatabase(order: Order): void {
  mockOrdersDatabase.unshift(order);
}

export function getOrderFromDatabase(orderId: string): Order | undefined {
  return mockOrdersDatabase.find(order => order.id === orderId);
}
