import type { CartItem } from './cart';
import type { FulfillmentType, Order } from '../models/types';

type CreateOrderInput = {
  userId: string;
  storeId: string;
  fulfillmentType: FulfillmentType;
  scheduledAt?: string;
  items: CartItem[];
  total: number;
};

type CreateOrderResult =
  | { ok: true; order: Order }
  | { ok: false; message: string };

const generateOrderId = () =>
  `ord_${Date.now().toString(36)}_${Math.floor(Math.random() * 9999).toString(36)}`;

const estimateEtaMinutes = (fulfillmentType: FulfillmentType, itemCount: number) => {
  const base = fulfillmentType === 'delivery' ? 35 : 20;
  const incremental = Math.min(12, Math.max(0, itemCount - 1) * 2);
  return base + incremental;
};

export const createMockOrder = async (
  input: CreateOrderInput,
): Promise<CreateOrderResult> => {
  if (input.items.length === 0) {
    return { ok: false, message: 'Add at least one item to place your order.' };
  }

  const orderItems = input.items.map((item) => ({
    id: item.id,
    itemId: item.itemId,
    name: item.name,
    qty: item.qty,
    unitPrice: item.unitPrice,
    customizations: {
      sizeLabel: item.customizations.sizeLabel,
      sugarLabel: item.customizations.sugarLabel,
      addOnLabels: [...item.customizations.addOnLabels],
    },
    notes: item.notes,
  }));

  const order: Order = {
    id: generateOrderId(),
    userId: input.userId,
    storeId: input.storeId,
    items: orderItems,
    status: 'received',
    total: input.total,
    etaMinutes: estimateEtaMinutes(input.fulfillmentType, input.items.length),
    fulfillmentType: input.fulfillmentType,
    placedAt: new Date().toISOString(),
    scheduledAt: input.scheduledAt,
  };

  return { ok: true, order };
};
