import type {
  MenuItem,
  OrderStatusUpdate,
  PaymentMethod,
  Store,
} from '../models/types';

declare const require: (path: string) => unknown;

type SeedUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  tier: string;
  points: number;
};

type SeedPromo = {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  amount: number;
  minSpend: number;
  expiry: string;
  eligibility: string;
};

const safeLoad = <T>(loader: () => T[]): T[] => {
  try {
    const data = loader();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const loadUsers = (): SeedUser[] =>
  safeLoad(() => require('../../seeds/users.json') as SeedUser[]);

export const loadStores = (): Store[] =>
  safeLoad(() => require('../../seeds/stores.json') as Store[]);

export const loadMenu = (): MenuItem[] =>
  safeLoad(() => require('../../seeds/menu.json') as MenuItem[]);

export const loadPromos = (): SeedPromo[] =>
  safeLoad(() => require('../../seeds/promos.json') as SeedPromo[]);

export const loadPaymentMethods = (): PaymentMethod[] =>
  safeLoad(
    () => require('../../seeds/payment_methods.json') as PaymentMethod[],
  );

export const loadOrderStatusUpdates = (): OrderStatusUpdate[] =>
  safeLoad(
    () =>
      require('../../seeds/order_status_updates.json') as OrderStatusUpdate[],
  );

export const loadSeedData = () => ({
  users: loadUsers(),
  stores: loadStores(),
  menu: loadMenu(),
  promos: loadPromos(),
  paymentMethods: loadPaymentMethods(),
  orderStatusUpdates: loadOrderStatusUpdates(),
});
