export type OrderStatus = 'received' | 'preparing' | 'ready' | 'completed';
export type FulfillmentType = 'pickup' | 'delivery';

export interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  basePrice: number;
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
  qty: number;
  unitPrice: number;
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
  scheduledAt?: string;
}
