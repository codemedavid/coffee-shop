import React, { createContext, useContext, useMemo, useState } from 'react';
import { loadMenu } from './seedLoader';
import type { MenuItem, Order, OrderItem } from '../models/types';

type OrderHistoryContextValue = {
  orders: Order[];
  addOrder: (order: Order) => void;
};

const OrderHistoryContext = createContext<OrderHistoryContextValue | undefined>(
  undefined,
);

const buildOrderItem = (
  item: MenuItem,
  detail: {
    qty: number;
    unitPrice: number;
    customizations: OrderItem['customizations'];
    notes?: string;
  },
): OrderItem => ({
  id: `${item.id}_${detail.customizations.sizeLabel}_${detail.qty}`.toLowerCase(),
  itemId: item.id,
  name: item.name,
  qty: detail.qty,
  unitPrice: detail.unitPrice,
  customizations: detail.customizations,
  notes: detail.notes,
});

const buildSeedOrders = (menu: MenuItem[]): Order[] => {
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    9,
    15,
  );
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const espresso = menu.find((item) => item.id === 'm_espresso_001');
  const latte = menu.find((item) => item.id === 'm_latte_001');

  const seedOrders: Order[] = [];

  if (espresso) {
    seedOrders.push({
      id: 'ord_seed_1001',
      userId: 'u_001',
      storeId: 's_001',
      items: [
        buildOrderItem(espresso, {
          qty: 1,
          unitPrice: espresso.basePrice + 1.5,
          customizations: {
            sizeLabel: 'Large',
            sugarLabel: '50% sweet',
            addOnLabels: ['Extra shot'],
          },
        }),
      ],
      status: 'completed',
      total: espresso.basePrice + 1.5 + 5,
      etaMinutes: 0,
      fulfillmentType: 'pickup',
      placedAt: today.toISOString(),
      scheduledAt: '09:30',
    });
  }

  if (latte) {
    seedOrders.push({
      id: 'ord_seed_1002',
      userId: 'u_001',
      storeId: 's_001',
      items: [
        buildOrderItem(latte, {
          qty: 2,
          unitPrice: latte.basePrice + 2.0,
          customizations: {
            sizeLabel: 'Mega',
            sugarLabel: 'Regular sweet',
            addOnLabels: ['Extra shot', 'Caramel drizzle'],
          },
          notes: 'Less ice',
        }),
      ],
      status: 'ready',
      total: (latte.basePrice + 2.0) * 2 + 5,
      etaMinutes: 8,
      fulfillmentType: 'delivery',
      placedAt: yesterday.toISOString(),
    });
  }

  seedOrders.push({
    id: 'ord_seed_1003',
    userId: 'u_001',
    storeId: 's_001',
    items: [
      {
        id: 'm_discontinued_001_1',
        itemId: 'm_discontinued_001',
        name: 'Rose Latte',
        qty: 1,
        unitPrice: 12.5,
        customizations: {
          sizeLabel: 'Regular',
          sugarLabel: 'No sugar',
          addOnLabels: ['Oat milk'],
        },
      },
    ],
    status: 'completed',
    total: 17.5,
    etaMinutes: 0,
    fulfillmentType: 'pickup',
    placedAt: yesterday.toISOString(),
    scheduledAt: '13:45',
  });

  return seedOrders.sort(
    (first, second) =>
      new Date(second.placedAt).getTime() -
      new Date(first.placedAt).getTime(),
  );
};

export function OrderHistoryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const menu = useMemo(() => loadMenu(), []);
  const [orders, setOrders] = useState<Order[]>(() => buildSeedOrders(menu));

  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
  };

  const value = useMemo(
    () => ({
      orders,
      addOrder,
    }),
    [orders],
  );

  return (
    <OrderHistoryContext.Provider value={value}>
      {children}
    </OrderHistoryContext.Provider>
  );
}

export const useOrderHistory = () => {
  const context = useContext(OrderHistoryContext);
  if (!context) {
    throw new Error('useOrderHistory must be used within OrderHistoryProvider');
  }
  return context;
};
