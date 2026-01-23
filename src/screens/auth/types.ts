import type { CartItem } from '../../data/cart';
import type { Address, Order } from '../../models/types';

type OrderSummary = {
  subtotal: number;
  itemCount: number;
  fees: {
    tax: number;
    delivery: number;
    smallOrder: number;
  };
  discount: number;
  rewardsDiscount: number;
  rewardsPoints: number;
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
  deliveryAddress?: Address;
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
  Addresses: undefined;
  Notifications: undefined;
};
