import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { loadPaymentMethods, loadStores } from '../../data/seedLoader';
import { useCart } from '../../data/cart';
import type { PaymentMethod, Store } from '../../models/types';

type FulfillmentType = 'pickup' | 'delivery';

type Address = {
  id: string;
  label: string;
  line1: string;
  city: string;
  postalCode: string;
  note?: string;
};

const addresses: Address[] = [
  {
    id: 'addr_001',
    label: 'Home',
    line1: '18 Jalan SS 2/24',
    city: 'Petaling Jaya',
    postalCode: '47300',
    note: 'Leave at guardhouse',
  },
  {
    id: 'addr_002',
    label: 'Office',
    line1: 'Level 12, Menara Spring',
    city: 'Kuala Lumpur',
    postalCode: '50450',
  },
];

const SLOT_INTERVAL_MINUTES = 15;
const PICKUP_LEAD_MINUTES = 20;

const formatHours = (hours: Store['hours']) => `${hours.open} - ${hours.close}`;

const minutesFromTime = (time: string) => {
  const [hours, minutes] = time.split(':').map((value) => Number(value));
  return hours * 60 + minutes;
};

const formatMinutes = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor(totalMinutes % 60)
    .toString()
    .padStart(2, '0');
  return `${hours}:${minutes}`;
};

const roundUpToInterval = (minutes: number, interval: number) =>
  Math.ceil(minutes / interval) * interval;

const buildPickupSlots = (store: Store) => {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = minutesFromTime(store.hours.open);
  const closeMinutes = minutesFromTime(store.hours.close);
  const earliestMinutes = Math.max(
    openMinutes,
    nowMinutes + PICKUP_LEAD_MINUTES,
  );
  const startMinutes = roundUpToInterval(
    earliestMinutes,
    SLOT_INTERVAL_MINUTES,
  );

  if (startMinutes > closeMinutes) {
    return [];
  }

  const slots: string[] = [];
  for (
    let minutes = startMinutes;
    minutes <= closeMinutes;
    minutes += SLOT_INTERVAL_MINUTES
  ) {
    slots.push(formatMinutes(minutes));
  }
  return slots;
};

const formatPaymentMethodLabel = (method: PaymentMethod) => {
  if (method.type === 'card') {
    return `Card •••• ${method.last4}`;
  }
  if (method.type === 'wallet') {
    return 'Wallet';
  }
  return 'Cash';
};

export default function CheckoutScreen() {
  const stores = useMemo(() => loadStores(), []);
  const paymentMethods = useMemo(() => loadPaymentMethods(), []);
  const defaultPaymentMethodId = useMemo(
    () => paymentMethods.find((method) => method.isDefault)?.id ?? '',
    [paymentMethods],
  );
  const pickupStores = useMemo(
    () => stores.filter((store) => store.isPickupEnabled),
    [stores],
  );
  const { totals } = useCart();
  const [fulfillmentType, setFulfillmentType] =
    useState<FulfillmentType>('pickup');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [selectedPickupSlot, setSelectedPickupSlot] = useState('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(
    defaultPaymentMethodId,
  );

  const selectedStore = useMemo(
    () => pickupStores.find((store) => store.id === selectedStoreId),
    [pickupStores, selectedStoreId],
  );
  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId),
    [selectedAddressId],
  );

  const pickupSlots = useMemo(
    () => (selectedStore ? buildPickupSlots(selectedStore) : []),
    [selectedStore],
  );

  useEffect(() => {
    setSelectedPickupSlot('');
  }, [selectedStoreId]);

  useEffect(() => {
    if (fulfillmentType !== 'pickup') {
      setSelectedPickupSlot('');
    }
  }, [fulfillmentType]);

  useEffect(() => {
    if (!selectedPaymentMethodId && defaultPaymentMethodId) {
      setSelectedPaymentMethodId(defaultPaymentMethodId);
    }
  }, [defaultPaymentMethodId, selectedPaymentMethodId]);

  const fulfillmentMissing =
    fulfillmentType === 'pickup'
      ? !selectedStore || !selectedPickupSlot
      : !selectedAddress;
  const paymentMissing =
    paymentMethods.length === 0 || !selectedPaymentMethodId;
  const requiresSelection = fulfillmentMissing || paymentMissing;
  const canContinue = totals.itemCount > 0 && !requiresSelection;
  const helperText = fulfillmentMissing
    ? fulfillmentType === 'pickup'
      ? !selectedStore
        ? 'Select a pickup store to continue.'
        : pickupSlots.length === 0
          ? 'No pickup slots are available within store hours.'
          : 'Select a pickup time to continue.'
      : 'Select a delivery address to continue.'
    : paymentMissing
      ? paymentMethods.length === 0
        ? 'No saved payment methods available.'
        : 'Select a payment method to continue.'
      : '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Checkout</Text>
          <Text style={styles.subtitle}>
            Choose pickup or delivery for this order.
          </Text>
        </View>
        <View style={styles.toggleRow}>
          <Pressable
            onPress={() => setFulfillmentType('pickup')}
            style={({ pressed }) => [
              styles.toggleButton,
              fulfillmentType === 'pickup' && styles.toggleButtonActive,
              pressed && styles.toggleButtonPressed,
            ]}
          >
            <Text
              style={[
                styles.toggleButtonText,
                fulfillmentType === 'pickup' && styles.toggleButtonTextActive,
              ]}
            >
              Pickup
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setFulfillmentType('delivery')}
            style={({ pressed }) => [
              styles.toggleButton,
              fulfillmentType === 'delivery' && styles.toggleButtonActive,
              pressed && styles.toggleButtonPressed,
            ]}
          >
            <Text
              style={[
                styles.toggleButtonText,
                fulfillmentType === 'delivery' && styles.toggleButtonTextActive,
              ]}
            >
              Delivery
            </Text>
          </Pressable>
        </View>
        {fulfillmentType === 'pickup' ? (
          <View style={styles.selectorCard}>
            <View style={styles.selectorHeader}>
              <Text style={styles.sectionTitle}>Pickup store</Text>
              <Text style={styles.sectionHint}>
                Choose the store for this order.
              </Text>
            </View>
            <View style={styles.selectorList}>
              {pickupStores.map((store) => {
                const isSelected = store.id === selectedStoreId;
                return (
                  <Pressable
                    key={store.id}
                    onPress={() => setSelectedStoreId(store.id)}
                    style={({ pressed }) => [
                      styles.selectorItem,
                      isSelected && styles.selectorItemActive,
                      pressed && styles.selectorItemPressed,
                    ]}
                  >
                    <View style={styles.selectorTextBlock}>
                      <Text style={styles.selectorTitle}>{store.name}</Text>
                      <Text style={styles.selectorSubtitle}>
                        {store.address}
                      </Text>
                      <Text style={styles.selectorMeta}>
                        {store.distanceKm.toFixed(1)} km ·{' '}
                        {formatHours(store.hours)}
                      </Text>
                    </View>
                    {isSelected ? (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedBadgeText}>Selected</Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
            {selectedStore ? (
              <View style={styles.slotSection}>
                <View style={styles.slotHeader}>
                  <Text style={styles.sectionTitle}>Pickup time</Text>
                  <Text style={styles.sectionHint}>
                    Ready in about {PICKUP_LEAD_MINUTES} minutes.
                  </Text>
                </View>
                {pickupSlots.length === 0 ? (
                  <Text style={styles.slotEmpty}>
                    No pickup slots available today.
                  </Text>
                ) : (
                  <View style={styles.slotList}>
                    {pickupSlots.map((slot) => {
                      const isSelected = slot === selectedPickupSlot;
                      return (
                        <Pressable
                          key={slot}
                          onPress={() => setSelectedPickupSlot(slot)}
                          style={({ pressed }) => [
                            styles.slotChip,
                            isSelected && styles.slotChipActive,
                            pressed && styles.slotChipPressed,
                          ]}
                        >
                          <Text
                            style={[
                              styles.slotChipText,
                              isSelected && styles.slotChipTextActive,
                            ]}
                          >
                            {slot}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.selectorCard}>
            <View style={styles.selectorHeader}>
              <Text style={styles.sectionTitle}>Delivery address</Text>
              <Text style={styles.sectionHint}>
                Select where you want your order delivered.
              </Text>
            </View>
            <View style={styles.selectorList}>
              {addresses.map((address) => {
                const isSelected = address.id === selectedAddressId;
                return (
                  <Pressable
                    key={address.id}
                    onPress={() => setSelectedAddressId(address.id)}
                    style={({ pressed }) => [
                      styles.selectorItem,
                      isSelected && styles.selectorItemActive,
                      pressed && styles.selectorItemPressed,
                    ]}
                  >
                    <View style={styles.selectorTextBlock}>
                      <Text style={styles.selectorTitle}>{address.label}</Text>
                      <Text style={styles.selectorSubtitle}>
                        {address.line1}
                      </Text>
                      <Text style={styles.selectorMeta}>
                        {address.city} {address.postalCode}
                      </Text>
                      {address.note ? (
                        <Text style={styles.selectorNote}>{address.note}</Text>
                      ) : null}
                    </View>
                    {isSelected ? (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedBadgeText}>Selected</Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
        <View style={styles.selectorCard}>
          <View style={styles.selectorHeader}>
            <Text style={styles.sectionTitle}>Payment method</Text>
            <Text style={styles.sectionHint}>
              Choose a saved method for this order.
            </Text>
          </View>
          {paymentMethods.length === 0 ? (
            <Text style={styles.emptyText}>
              No saved payment methods yet.
            </Text>
          ) : (
            <View style={styles.selectorList}>
              {paymentMethods.map((method) => {
                const isSelected = method.id === selectedPaymentMethodId;
                return (
                  <Pressable
                    key={method.id}
                    onPress={() => setSelectedPaymentMethodId(method.id)}
                    style={({ pressed }) => [
                      styles.selectorItem,
                      isSelected && styles.selectorItemActive,
                      pressed && styles.selectorItemPressed,
                    ]}
                  >
                    <View style={styles.selectorTextBlock}>
                      <Text style={styles.selectorTitle}>
                        {formatPaymentMethodLabel(method)}
                      </Text>
                      <Text style={styles.selectorSubtitle}>
                        {method.type === 'card'
                          ? 'Debit or credit card'
                          : method.type === 'wallet'
                            ? 'Connected wallet'
                            : 'Pay at pickup'}
                      </Text>
                    </View>
                    <View style={styles.badgeColumn}>
                      {method.isDefault ? (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      ) : null}
                      {isSelected ? (
                        <View style={styles.selectedBadge}>
                          <Text style={styles.selectedBadgeText}>Selected</Text>
                        </View>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
        {requiresSelection && helperText ? (
          <Text style={styles.helperText}>{helperText}</Text>
        ) : null}
        <View style={styles.ctaCard}>
          <View style={styles.ctaRow}>
            <View>
              <Text style={styles.ctaLabel}>Order total</Text>
              <Text style={styles.ctaValue}>
                RM {totals.total.toFixed(2)}
              </Text>
            </View>
            <Pressable
              disabled={!canContinue}
              style={({ pressed }) => [
                styles.ctaButton,
                !canContinue && styles.ctaButtonDisabled,
                pressed && canContinue && styles.ctaButtonPressed,
              ]}
            >
              <Text style={styles.ctaButtonText}>Continue</Text>
            </Pressable>
          </View>
          {totals.itemCount === 0 ? (
            <Text style={styles.emptyNotice}>
              Add items to the cart before continuing.
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f3ee',
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2b1f14',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#8b7c6f',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e7d7c7',
    backgroundColor: '#fffaf4',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#6c3f1d',
    borderColor: '#6c3f1d',
  },
  toggleButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  toggleButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6c3f1d',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  toggleButtonTextActive: {
    color: '#fff7ee',
  },
  selectorCard: {
    backgroundColor: '#fff7ee',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3e2cf',
  },
  selectorHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2b1f14',
  },
  sectionHint: {
    marginTop: 4,
    fontSize: 12,
    color: '#8b7c6f',
  },
  selectorList: {
    gap: 12,
  },
  selectorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1e1d0',
    backgroundColor: '#fffefc',
  },
  selectorItemActive: {
    borderColor: '#6c3f1d',
    backgroundColor: '#fff2e6',
  },
  selectorItemPressed: {
    transform: [{ scale: 0.99 }],
  },
  selectorTextBlock: {
    flex: 1,
  },
  selectorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2b1f14',
  },
  selectorSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#7a6a5b',
  },
  selectorMeta: {
    marginTop: 4,
    fontSize: 11,
    color: '#9a8776',
  },
  selectorNote: {
    marginTop: 6,
    fontSize: 11,
    color: '#8a6b52',
  },
  badgeColumn: {
    alignItems: 'flex-end',
    gap: 6,
  },
  defaultBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#e8d2bf',
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7a4b24',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  selectedBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#f0d5b8',
  },
  selectedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7a4b24',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  helperText: {
    marginTop: 12,
    fontSize: 12,
    color: '#b23a2a',
  },
  emptyText: {
    marginTop: 4,
    fontSize: 12,
    color: '#8b7c6f',
  },
  slotSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3e2cf',
  },
  slotHeader: {
    marginBottom: 10,
  },
  slotEmpty: {
    fontSize: 12,
    color: '#b23a2a',
  },
  slotList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#f1e1d0',
    backgroundColor: '#fffaf4',
  },
  slotChipActive: {
    borderColor: '#6c3f1d',
    backgroundColor: '#fff2e6',
  },
  slotChipPressed: {
    transform: [{ scale: 0.98 }],
  },
  slotChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c3f1d',
  },
  slotChipTextActive: {
    color: '#2b1f14',
  },
  ctaCard: {
    marginTop: 20,
    backgroundColor: '#fff4e6',
    borderRadius: 18,
    padding: 16,
  },
  ctaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  ctaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8b7c6f',
  },
  ctaValue: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '700',
    color: '#2b1f14',
  },
  ctaButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#6c3f1d',
  },
  ctaButtonDisabled: {
    backgroundColor: '#c7b3a1',
  },
  ctaButtonPressed: {
    transform: [{ scale: 0.97 }],
  },
  ctaButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff7ee',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  emptyNotice: {
    marginTop: 10,
    fontSize: 12,
    color: '#8b7c6f',
  },
});
