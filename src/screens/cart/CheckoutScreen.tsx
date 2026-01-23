import React, { useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { loadPaymentMethods, loadStores, loadUsers } from '../../data/seedLoader';
import { useCart } from '../../data/cart';
import { createMockOrder } from '../../data/orders';
import { useOrderHistory } from '../../data/orderHistory';
import type { PaymentMethod, Store } from '../../models/types';
import type { RootStackParamList } from '../auth/types';

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
const REWARD_POINT_VALUE = 0.1;
const REWARD_STEP_POINTS = 10;
const MAX_REDEEM_RATE = 0.5;

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

const formatPoints = (points: number) => `${points} pts`;

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

export default function CheckoutScreen() {
  const stores = useMemo(() => loadStores(), []);
  const paymentMethods = useMemo(() => loadPaymentMethods(), []);
  const user = useMemo(() => loadUsers()[0], []);
  const defaultPaymentMethodId = useMemo(
    () => paymentMethods.find((method) => method.isDefault)?.id ?? '',
    [paymentMethods],
  );
  const pickupStores = useMemo(
    () => stores.filter((store) => store.isPickupEnabled),
    [stores],
  );
  const deliveryStores = useMemo(
    () => stores.filter((store) => store.isDeliveryEnabled),
    [stores],
  );
  const { items, totals, clear } = useCart();
  const { addOrder } = useOrderHistory();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [fulfillmentType, setFulfillmentType] =
    useState<FulfillmentType>('pickup');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [selectedPickupSlot, setSelectedPickupSlot] = useState('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(
    defaultPaymentMethodId,
  );
  const [redeemedPoints, setRedeemedPoints] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const availablePoints = user?.points ?? 0;
  const subtotalAfterPromo = Math.max(0, totals.subtotal - totals.discount);
  const maxDiscountBySubtotal = roundCurrency(
    subtotalAfterPromo * MAX_REDEEM_RATE,
  );
  const maxPointsBySubtotal = Math.floor(
    maxDiscountBySubtotal / REWARD_POINT_VALUE,
  );
  const maxRedeemablePoints = Math.max(
    0,
    Math.min(availablePoints, maxPointsBySubtotal),
  );
  const maxDiscountByPoints = roundCurrency(
    maxRedeemablePoints * REWARD_POINT_VALUE,
  );
  const normalizedRedeemedPoints = Math.min(
    redeemedPoints,
    maxRedeemablePoints,
  );
  const rewardsDiscount = roundCurrency(
    Math.min(subtotalAfterPromo, normalizedRedeemedPoints * REWARD_POINT_VALUE),
  );
  const totalAfterRewards = Math.max(
    0,
    totals.subtotal + totals.fees.total - totals.discount - rewardsDiscount,
  );

  const selectedStore = useMemo(
    () => pickupStores.find((store) => store.id === selectedStoreId),
    [pickupStores, selectedStoreId],
  );
  const deliveryStore = useMemo(
    () => deliveryStores[0],
    [deliveryStores],
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

  useEffect(() => {
    if (redeemedPoints > maxRedeemablePoints) {
      setRedeemedPoints(maxRedeemablePoints);
      return;
    }
    if (totals.itemCount === 0 && redeemedPoints !== 0) {
      setRedeemedPoints(0);
    }
  }, [maxRedeemablePoints, redeemedPoints, totals.itemCount]);

  const fulfillmentMissing =
    fulfillmentType === 'pickup'
      ? !selectedStore || !selectedPickupSlot
      : !selectedAddress;
  const paymentMissing =
    paymentMethods.length === 0 || !selectedPaymentMethodId;
  const requiresSelection = fulfillmentMissing || paymentMissing;
  const canContinue = totals.itemCount > 0 && !requiresSelection;
  const canSubmit = canContinue && !isSubmitting;
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
  const canRedeem =
    totals.itemCount > 0 && availablePoints > 0 && maxRedeemablePoints > 0;

  const handleSubmit = async () => {
    if (!canContinue) {
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);

    const activeStore =
      fulfillmentType === 'pickup' ? selectedStore : deliveryStore;
    if (!activeStore) {
      setSubmitError('No store available for this order.');
      setIsSubmitting(false);
      return;
    }

    const itemsSnapshot = items.map((item) => ({
      ...item,
      customizations: {
        ...item.customizations,
        addOnLabels: [...item.customizations.addOnLabels],
      },
    }));
    const summarySnapshot = {
      subtotal: totals.subtotal,
      itemCount: totals.itemCount,
      fees: { ...totals.fees },
      discount: totals.discount,
      rewardsDiscount,
      rewardsPoints: normalizedRedeemedPoints,
      total: totalAfterRewards,
    };

    const result = await createMockOrder({
      userId: 'u_001',
      storeId: activeStore.id,
      fulfillmentType,
      scheduledAt: fulfillmentType === 'pickup' ? selectedPickupSlot : undefined,
      items: itemsSnapshot,
      total: totalAfterRewards,
    });

    if (!result.ok) {
      setSubmitError(result.message);
      setIsSubmitting(false);
      return;
    }

    addOrder(result.order);
    clear();
    setIsSubmitting(false);
    navigation.replace('OrderConfirmation', {
      order: result.order,
      items: itemsSnapshot,
      summary: summarySnapshot,
      store: {
        name: activeStore.name,
        address: activeStore.address,
      },
      deliveryAddress:
        fulfillmentType === 'delivery' ? selectedAddress : undefined,
    });
  };

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
        <View style={styles.selectorCard}>
          <View style={styles.selectorHeader}>
            <Text style={styles.sectionTitle}>Redeem points</Text>
            <Text style={styles.sectionHint}>
              {availablePoints > 0
                ? `Balance ${formatPoints(availablePoints)} · ${Math.round(
                    1 / REWARD_POINT_VALUE,
                  )} pts = RM 1`
                : 'No points available yet.'}
            </Text>
          </View>
          <View style={styles.rewardsMetaRow}>
            <View>
              <Text style={styles.rewardsMetaLabel}>Max redeemable</Text>
              <Text style={styles.rewardsMetaValue}>
                {formatPoints(maxRedeemablePoints)} · RM{' '}
                {maxDiscountByPoints.toFixed(2)}
              </Text>
            </View>
            <Pressable
              onPress={() => setRedeemedPoints(maxRedeemablePoints)}
              disabled={!canRedeem || normalizedRedeemedPoints === maxRedeemablePoints}
              style={({ pressed }) => [
                styles.rewardsMaxButton,
                (!canRedeem || normalizedRedeemedPoints === maxRedeemablePoints) &&
                  styles.rewardsMaxButtonDisabled,
                pressed &&
                  canRedeem &&
                  normalizedRedeemedPoints !== maxRedeemablePoints &&
                  styles.rewardsMaxButtonPressed,
              ]}
            >
              <Text style={styles.rewardsMaxButtonText}>Use max</Text>
            </Pressable>
          </View>
          <View style={styles.rewardsControlRow}>
            <Pressable
              onPress={() =>
                setRedeemedPoints((prev) =>
                  Math.max(0, prev - REWARD_STEP_POINTS),
                )
              }
              disabled={!canRedeem || normalizedRedeemedPoints === 0}
              style={({ pressed }) => [
                styles.rewardsStepButton,
                (!canRedeem || normalizedRedeemedPoints === 0) &&
                  styles.rewardsStepButtonDisabled,
                pressed &&
                  canRedeem &&
                  normalizedRedeemedPoints > 0 &&
                  styles.rewardsStepButtonPressed,
              ]}
            >
              <Text style={styles.rewardsStepButtonText}>- {REWARD_STEP_POINTS}</Text>
            </Pressable>
            <View style={styles.rewardsCenter}>
              <Text style={styles.rewardsPointsValue}>
                {formatPoints(normalizedRedeemedPoints)}
              </Text>
              <Text style={styles.rewardsDiscountValue}>
                -RM {rewardsDiscount.toFixed(2)}
              </Text>
            </View>
            <Pressable
              onPress={() =>
                setRedeemedPoints((prev) =>
                  Math.min(maxRedeemablePoints, prev + REWARD_STEP_POINTS),
                )
              }
              disabled={!canRedeem || normalizedRedeemedPoints === maxRedeemablePoints}
              style={({ pressed }) => [
                styles.rewardsStepButton,
                (!canRedeem || normalizedRedeemedPoints === maxRedeemablePoints) &&
                  styles.rewardsStepButtonDisabled,
                pressed &&
                  canRedeem &&
                  normalizedRedeemedPoints < maxRedeemablePoints &&
                  styles.rewardsStepButtonPressed,
              ]}
            >
              <Text style={styles.rewardsStepButtonText}>+ {REWARD_STEP_POINTS}</Text>
            </Pressable>
          </View>
          {availablePoints === 0 ? (
            <Text style={styles.rewardsHint}>
              Earn points on your next order to redeem rewards here.
            </Text>
          ) : maxRedeemablePoints === 0 ? (
            <Text style={styles.rewardsHint}>
              Add more items to unlock points redemption.
            </Text>
          ) : null}
        </View>
        {requiresSelection && helperText ? (
          <Text style={styles.helperText}>{helperText}</Text>
        ) : null}
        {submitError ? (
          <Text style={styles.helperText}>{submitError}</Text>
        ) : null}
        <View style={styles.ctaCard}>
          <View style={styles.ctaRow}>
            <View>
              <Text style={styles.ctaLabel}>Order total</Text>
              <Text style={styles.ctaValue}>
                RM {totalAfterRewards.toFixed(2)}
              </Text>
            </View>
            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              style={({ pressed }) => [
                styles.ctaButton,
                !canSubmit && styles.ctaButtonDisabled,
                pressed && canSubmit && styles.ctaButtonPressed,
              ]}
            >
              <Text style={styles.ctaButtonText}>
                {isSubmitting ? 'Placing...' : 'Place order'}
              </Text>
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
  rewardsMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  rewardsMetaLabel: {
    fontSize: 11,
    color: '#8b7c6f',
  },
  rewardsMetaValue: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '700',
    color: '#2b1f14',
  },
  rewardsMaxButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#f0d9bf',
    backgroundColor: '#fff2db',
  },
  rewardsMaxButtonDisabled: {
    backgroundColor: '#efe2d6',
    borderColor: '#e2cdb6',
  },
  rewardsMaxButtonPressed: {
    transform: [{ scale: 0.97 }],
  },
  rewardsMaxButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#a45c2b',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  rewardsControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rewardsStepButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f1e1d0',
    backgroundColor: '#fffefc',
    alignItems: 'center',
  },
  rewardsStepButtonDisabled: {
    backgroundColor: '#f2e9e0',
    borderColor: '#e6d8cc',
  },
  rewardsStepButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  rewardsStepButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6c3f1d',
  },
  rewardsCenter: {
    alignItems: 'center',
    minWidth: 110,
  },
  rewardsPointsValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2b1f14',
  },
  rewardsDiscountValue: {
    marginTop: 4,
    fontSize: 12,
    color: '#2f6e3a',
  },
  rewardsHint: {
    marginTop: 10,
    fontSize: 12,
    color: '#8b7c6f',
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
