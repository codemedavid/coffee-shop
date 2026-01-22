import React, { createContext, useContext, useMemo, useState } from 'react';

type CartCustomizations = {
  sizeLabel: string;
  sugarLabel: string;
  addOnLabels: string[];
};

type CartFees = {
  tax: number;
  delivery: number;
  smallOrder: number;
  total: number;
};

export type CartItem = {
  id: string;
  itemId: string;
  name: string;
  unitPrice: number;
  qty: number;
  customizations: CartCustomizations;
  notes?: string;
};

type CartTotals = {
  subtotal: number;
  itemCount: number;
  fees: CartFees;
  total: number;
};

type CartContextValue = {
  items: CartItem[];
  totals: CartTotals;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  updateItemQuantity: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const feeRules = {
  taxRate: 0.06,
  deliveryFee: 5,
  smallOrderMin: 20,
  smallOrderFee: 2,
};

const emptyFees: CartFees = { tax: 0, delivery: 0, smallOrder: 0, total: 0 };

const calculateFees = (subtotal: number): CartFees => {
  if (subtotal <= 0) {
    return emptyFees;
  }
  const delivery = feeRules.deliveryFee;
  const smallOrder = subtotal < feeRules.smallOrderMin ? feeRules.smallOrderFee : 0;
  const tax = subtotal * feeRules.taxRate;
  const total = tax + delivery + smallOrder;
  return { tax, delivery, smallOrder, total };
};

const normalizeKeyPart = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, ' ');

const buildItemKey = (item: Omit<CartItem, 'id'>) => {
  const addOnKey = item.customizations.addOnLabels
    .map((label) => normalizeKeyPart(label))
    .sort()
    .join('|');
  const noteKey = item.notes ? normalizeKeyPart(item.notes) : '';
  return [
    item.itemId,
    normalizeKeyPart(item.customizations.sizeLabel),
    normalizeKeyPart(item.customizations.sugarLabel),
    addOnKey,
    noteKey,
  ].join(':');
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const totals = useMemo(
    () => {
      const baseTotals = items.reduce<CartTotals>(
        (acc, item) => {
          acc.itemCount += item.qty;
          acc.subtotal += item.unitPrice * item.qty;
          return acc;
        },
        { subtotal: 0, itemCount: 0, fees: emptyFees, total: 0 },
      );
      const fees = calculateFees(baseTotals.subtotal);
      return { ...baseTotals, fees, total: baseTotals.subtotal + fees.total };
    },
    [items],
  );

  const addItem = (item: Omit<CartItem, 'id'>) => {
    const id = buildItemKey(item);
    setItems((prev) => {
      const existing = prev.find((entry) => entry.id === id);
      if (existing) {
        return prev.map((entry) =>
          entry.id === id ? { ...entry, qty: entry.qty + item.qty } : entry,
        );
      }
      return [...prev, { ...item, id }];
    });
  };

  const updateItemQuantity = (id: string, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) {
        return prev.filter((entry) => entry.id !== id);
      }
      return prev.map((entry) =>
        entry.id === id ? { ...entry, qty } : entry,
      );
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((entry) => entry.id !== id));
  };

  const clear = () => setItems([]);

  const value = useMemo(
    () => ({ items, totals, addItem, updateItemQuantity, removeItem, clear }),
    [items, totals],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
