import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../auth/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderConfirmation'>;

const formatPrice = (price: number) => `RM ${price.toFixed(2)}`;

const describeCustomizations = (customizations: {
  sizeLabel: string;
  sugarLabel: string;
  addOnLabels: string[];
}) => {
  const addOns = customizations.addOnLabels.join(', ');
  if (!addOns) {
    return `${customizations.sizeLabel} • ${customizations.sugarLabel}`;
  }
  return `${customizations.sizeLabel} • ${customizations.sugarLabel} • ${addOns}`;
};

export default function OrderConfirmationScreen({ navigation, route }: Props) {
  const { order, items, summary, store, deliveryAddress } = route.params;
  const etaLabel =
    order.fulfillmentType === 'pickup'
      ? order.scheduledAt
        ? `Pickup at ${order.scheduledAt}`
        : `Ready in ${order.etaMinutes} min`
      : `ETA ${order.etaMinutes} min`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Order confirmed</Text>
          <Text style={styles.subtitle}>Order ID {order.id}</Text>
        </View>
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>{etaLabel}</Text>
          <Text style={styles.statusSubtitle}>
            We're preparing your items now.
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Fulfillment</Text>
          {order.fulfillmentType === 'pickup' ? (
            <View style={styles.fulfillmentBlock}>
              <Text style={styles.fulfillmentTitle}>
                {store?.name ?? 'Pickup store'}
              </Text>
              {store?.address ? (
                <Text style={styles.fulfillmentSubtitle}>{store.address}</Text>
              ) : null}
              <Text style={styles.fulfillmentMeta}>
                {order.scheduledAt
                  ? `Pickup time ${order.scheduledAt}`
                  : `Ready in ${order.etaMinutes} min`}
              </Text>
            </View>
          ) : (
            <View style={styles.fulfillmentBlock}>
              <Text style={styles.fulfillmentTitle}>
                {deliveryAddress?.label ?? 'Delivery address'}
              </Text>
              {deliveryAddress ? (
                <>
                  <Text style={styles.fulfillmentSubtitle}>
                    {deliveryAddress.line1}
                  </Text>
                  <Text style={styles.fulfillmentMeta}>
                    {deliveryAddress.city} {deliveryAddress.postalCode}
                  </Text>
                  {deliveryAddress.note ? (
                    <Text style={styles.fulfillmentNote}>
                      Note: {deliveryAddress.note}
                    </Text>
                  ) : null}
                </>
              ) : null}
            </View>
          )}
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Order summary</Text>
          <View style={styles.itemList}>
            {items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemMeta}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDetails}>
                    {describeCustomizations(item.customizations)}
                  </Text>
                  {item.notes ? (
                    <Text style={styles.itemNote}>Note: {item.notes}</Text>
                  ) : null}
                </View>
                <View style={styles.itemPriceBlock}>
                  <Text style={styles.itemQty}>x{item.qty}</Text>
                  <Text style={styles.itemPrice}>
                    {formatPrice(item.unitPrice * item.qty)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Totals</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(summary.subtotal)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery fee</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(summary.fees.delivery)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Small order fee</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(summary.fees.smallOrder)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(summary.fees.tax)}
            </Text>
          </View>
          {summary.discount > 0 ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Promo discount</Text>
              <Text style={styles.summaryValue}>
                -{formatPrice(summary.discount)}
              </Text>
            </View>
          ) : null}
          {summary.rewardsDiscount > 0 ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Rewards ({summary.rewardsPoints} pts)
              </Text>
              <Text style={styles.summaryValue}>
                -{formatPrice(summary.rewardsDiscount)}
              </Text>
            </View>
          ) : null}
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>
              {formatPrice(summary.total)}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => navigation.navigate('OrderStatus', { order })}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.secondaryButtonPressed,
          ]}
        >
          <Text style={styles.secondaryButtonText}>Track order</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('MainTabs')}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>Back to home</Text>
        </Pressable>
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
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2b1f14',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 12,
    color: '#8b7c6f',
  },
  statusCard: {
    marginTop: 12,
    backgroundColor: '#fff4e6',
    borderRadius: 18,
    padding: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2b1f14',
  },
  statusSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#8b7c6f',
  },
  card: {
    marginTop: 16,
    backgroundColor: '#fff7ee',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3e2cf',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2b1f14',
    marginBottom: 10,
  },
  fulfillmentBlock: {
    gap: 4,
  },
  fulfillmentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2b1f14',
  },
  fulfillmentSubtitle: {
    fontSize: 12,
    color: '#7a6a5b',
  },
  fulfillmentMeta: {
    fontSize: 11,
    color: '#9a8776',
  },
  fulfillmentNote: {
    fontSize: 11,
    color: '#8a6b52',
  },
  itemList: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  itemMeta: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2b1f14',
  },
  itemDetails: {
    marginTop: 4,
    fontSize: 11,
    color: '#8b7c6f',
  },
  itemNote: {
    marginTop: 4,
    fontSize: 11,
    color: '#6a4a2f',
  },
  itemPriceBlock: {
    alignItems: 'flex-end',
  },
  itemQty: {
    fontSize: 11,
    color: '#8b7c6f',
  },
  itemPrice: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '700',
    color: '#2b1f14',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#8b7c6f',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2b1f14',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#f0dfcd',
    marginVertical: 8,
  },
  summaryTotalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2b1f14',
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2b1f14',
  },
  primaryButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#6c3f1d',
    alignItems: 'center',
  },
  secondaryButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#efe2d6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2cdb6',
  },
  secondaryButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff7ee',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5a3b23',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
