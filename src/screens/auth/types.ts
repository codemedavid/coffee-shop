import type { CartItem } from '../../data/cart';
import type { Order } from '../../models/types';

type OrderSummary = {
  subtotal: number;
  itemCount: number;
  fees: {
    tax: number;
    delivery: number;
    smallOrder: number;
  };
  discount: number;
  total: number;
};

type OrderConfirmationParams = {
  order: Order;
  items: CartItem[];
  summary: OrderSummary;
  store?: {
    name: string;
    address: string;
  };
  deliveryAddress?: {
    label: string;
    line1: string;
    city: string;
    postalCode: string;
    note?: string;
  };
};

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Forgot: undefined;
  OTP:
    | {
        contact?: string;
        otpToken?: string;
        expiresAt?: number;
      }
    | undefined;
  MainTabs: undefined;
  Cart: undefined;
  Checkout: undefined;
  OrderConfirmation: OrderConfirmationParams;
  OrderStatus:
    | {
        order?: Order;
      }
    | undefined;
  OrderDetail: {
    orderId: string;
  };
  ProductDetail:
    | {
        itemId?: string;
      }
    | undefined;
};
