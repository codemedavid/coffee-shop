import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { loadPromos } from './seedLoader';

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
  discount: number;
  total: number;
};

type Promo = {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  amount: number;
  minSpend: number;
  expiry: string;
  eligibility: string;
};

type CartContextValue = {
  items: CartItem[];
  totals: CartTotals;
  appliedPromo: Promo | null;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  updateItemQuantity: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  applyPromo: (code: string) => { ok: boolean; message: string };
  removePromo: () => void;
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

const normalizePromoCode = (code: string) =>
  code.trim().toUpperCase().replace(/\s+/g, '');

const isPromoExpired = (promo: Promo, now = new Date()) => {
  const expiryDate = new Date(`${promo.expiry}T23:59:59`);
  if (Number.isNaN(expiryDate.getTime())) {
    return false;
  }
  return now > expiryDate;
};

const isPromoEligible = (promo: Promo, subtotal: number) => {
  if (subtotal < promo.minSpend) {
    return false;
  }
  return !isPromoExpired(promo);
};

const calculatePromoDiscount = (promo: Promo, subtotal: number) => {
  if (!isPromoEligible(promo, subtotal)) {
    return 0;
  }
  const rawDiscount =
    promo.type === 'percent' ? subtotal * (promo.amount / 100) : promo.amount;
  return Math.min(rawDiscount, subtotal);
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
  const [appliedPromo, setAppliedPromo] = useState<Promo | null>(null);
  const promos = useMemo(() => loadPromos(), []);

  const totals = useMemo(
    () => {
      const baseTotals = items.reduce<CartTotals>(
        (acc, item) => {
          acc.itemCount += item.qty;
          acc.subtotal += item.unitPrice * item.qty;
          return acc;
        },
        { subtotal: 0, itemCount: 0, fees: emptyFees, discount: 0, total: 0 },
      );
      const fees = calculateFees(baseTotals.subtotal);
      const discount = appliedPromo
        ? calculatePromoDiscount(appliedPromo, baseTotals.subtotal)
        : 0;
      const total = Math.max(0, baseTotals.subtotal + fees.total - discount);
      return { ...baseTotals, fees, discount, total };
    },
    [appliedPromo, items],
  );

  useEffect(() => {
    if (!appliedPromo) {
      return;
    }
    if (!isPromoEligible(appliedPromo, totals.subtotal)) {
      setAppliedPromo(null);
    }
  }, [appliedPromo, totals.subtotal]);

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

  const applyPromo = useCallback(
    (code: string) => {
      const normalized = normalizePromoCode(code);
      if (!normalized) {
        return { ok: false, message: 'Enter a promo or voucher code.' };
      }
      const match = promos.find(
        (promo) => normalizePromoCode(promo.code) === normalized,
      );
      if (!match) {
        return { ok: false, message: 'Code not recognized.' };
      }
      if (isPromoExpired(match)) {
        return { ok: false, message: 'This code has expired.' };
      }
      if (totals.subtotal < match.minSpend) {
        return {
          ok: false,
          message: `Minimum spend is RM ${match.minSpend.toFixed(2)}.`,
        };
      }
      setAppliedPromo(match);
      return { ok: true, message: `${match.code} applied.` };
    },
    [promos, totals.subtotal],
  );

  const removePromo = useCallback(() => {
    setAppliedPromo(null);
  }, []);

  const clear = () => setItems([]);

  const value = useMemo(
    () => ({
      items,
      totals,
      appliedPromo,
      addItem,
      updateItemQuantity,
      removeItem,
      applyPromo,
      removePromo,
      clear,
    }),
    [appliedPromo, applyPromo, items, removePromo, totals],
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
