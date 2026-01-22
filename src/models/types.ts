export type OrderStatus = 'received' | 'preparing' | 'ready' | 'completed';
export type FulfillmentType = 'pickup' | 'delivery';

export interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  basePrice: number;
  description?: string;
  allergens?: string[];
  tags: string[];
  badge?: string;
  availability: 'available' | 'sold_out';
  imageUrls: string[];
}

export interface Store {
  id: string;
  name: string;
  address: string;
  hours: {
    open: string;
    close: string;
  };
  distanceKm: number;
  isPickupEnabled: boolean;
  isDeliveryEnabled: boolean;
}

export interface OrderItem {
  id: string;
  itemId: string;
  name: string;
  qty: number;
  unitPrice: number;
  customizations: {
    sizeLabel: string;
    sugarLabel: string;
    addOnLabels: string[];
  };
  notes?: string;
}

export interface Order {
  id: string;
  userId: string;
  storeId: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  etaMinutes: number;
  fulfillmentType: FulfillmentType;
  placedAt: string;
  scheduledAt?: string;
}

export interface OrderStatusUpdate {
  orderId: string;
  status: OrderStatus;
  timestamp: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet' | 'cash';
  token: string;
  last4: string;
  isDefault: boolean;
}

export interface RewardRule {
  id: string;
  pointsPerCurrency: number;
  multiplier: number;
  validFrom: string;
  validTo: string;
}

export interface RewardTransaction {
  id: string;
  type: 'earn' | 'redeem';
  date: string;
  orderId?: string;
  amount?: number;
  points?: number;
}
