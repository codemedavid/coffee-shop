import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { loadMenu, loadStores } from '../../data/seedLoader';
import { useOrderHistory } from '../../data/orderHistory';
import { useCart } from '../../data/cart';
import type { MenuItem } from '../../models/types';
import type { RootStackParamList } from '../auth/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

const formatPrice = (price: number) => `RM ${price.toFixed(2)}`;

const formatDateTime = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown time';
  }
  return date.toLocaleString('en-MY', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
};

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

const isItemUnavailable = (menuItem?: MenuItem) =>
  !menuItem || menuItem.availability === 'sold_out';

export default function OrderDetailScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { orders } = useOrderHistory();
  const { clear, addItem } = useCart();
  const [reorderError, setReorderError] = useState<string | null>(null);
  const order = useMemo(
    () => orders.find((entry) => entry.id === orderId),
    [orderId, orders],
  );
  const menu = useMemo(() => loadMenu(), []);
  const stores = useMemo(() => loadStores(), []);
  const menuLookup = useMemo(() => {
    const map = new Map<string, MenuItem>();
    menu.forEach((item) => map.set(item.id, item));
    return map;
  }, [menu]);

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Order not found</Text>
          <Text style={styles.notFoundSubtitle}>
            This order might have been removed from your history.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const storeName =
    stores.find((store) => store.id === order.storeId)?.name ??
    'Selected store';

  const unavailableItems = order.items.filter((item) =>
    isItemUnavailable(menuLookup.get(item.itemId)),
  );
  const hasUnavailable = unavailableItems.length > 0;

  const handleReorder = () => {
    if (hasUnavailable) {
      const unavailableNames = unavailableItems.map((item) => item.name);
      const message = `These items are unavailable: ${unavailableNames.join(
        ', ',
      )}.`;
      setReorderError(message);
      Alert.alert('Reorder unavailable', message);
      return;
    }

    clear();
    order.items.forEach((item) => {
      addItem({
        itemId: item.itemId,
        name: item.name,
        unitPrice: item.unitPrice,
        qty: item.qty,
        customizations: {
          sizeLabel: item.customizations.sizeLabel,
          sugarLabel: item.customizations.sugarLabel,
          addOnLabels: [...item.customizations.addOnLabels],
        },
        notes: item.notes,
      });
    });
    setReorderError(null);
    navigation.navigate('Cart');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Order details</Text>
          <Text style={styles.subtitle}>Order {order.id}</Text>
        </View>
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>Status</Text>
            <Text style={styles.summaryValue}>
              {order.status.toUpperCase()}
            </Text>
          </View>
          <View style={styles.summaryMeta}>
            <Text style={styles.summaryMetaText}>{storeName}</Text>
            <Text style={styles.summaryMetaText}>
              {formatDateTime(order.placedAt)}
            </Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items.map((item) => {
            const menuItem = menuLookup.get(item.itemId);
            const unavailable = isItemUnavailable(menuItem);
            return (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemMeta}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDetails}>
                    {describeCustomizations(item.customizations)}
                  </Text>
                  {item.notes ? (
                    <Text style={styles.itemNote}>Note: {item.notes}</Text>
                  ) : null}
                  {unavailable ? (
                    <Text style={styles.itemUnavailable}>Unavailable</Text>
                  ) : null}
                </View>
                <View style={styles.itemPriceBlock}>
                  <Text style={styles.itemQty}>x{item.qty}</Text>
                  <Text style={styles.itemPrice}>
                    {formatPrice(item.unitPrice * item.qty)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
        <View style={styles.card}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryValue}>{formatPrice(order.total)}</Text>
          </View>
        </View>
        {reorderError ? (
          <Text style={styles.helperText}>{reorderError}</Text>
        ) : null}
        <Pressable
          onPress={handleReorder}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>Reorder these items</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('OrderStatus', { order })}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.secondaryButtonPressed,
          ]}
        >
          <Text style={styles.secondaryButtonText}>Track order</Text>
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
  summaryCard: {
    marginTop: 12,
    backgroundColor: '#fff7ee',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3e2cf',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#8b7c6f',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  summaryValue: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '700',
    color: '#2b1f14',
  },
  summaryMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  summaryMetaText: {
    fontSize: 12,
    color: '#8b7c6f',
  },
  card: {
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#efe2d6',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2b1f14',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  itemMeta: {
    flex: 1,
    paddingRight: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2b1f14',
  },
  itemDetails: {
    marginTop: 4,
    fontSize: 12,
    color: '#8b7c6f',
  },
  itemNote: {
    marginTop: 4,
    fontSize: 11,
    color: '#8b7c6f',
  },
  itemUnavailable: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '600',
    color: '#b63c2a',
  },
  itemPriceBlock: {
    alignItems: 'flex-end',
  },
  itemQty: {
    fontSize: 12,
    color: '#8b7c6f',
  },
  itemPrice: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
    color: '#2b1f14',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helperText: {
    marginTop: 12,
    fontSize: 12,
    color: '#b63c2a',
  },
  primaryButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: '#2f2014',
    alignItems: 'center',
  },
  primaryButtonPressed: {
    opacity: 0.85,
  },
  primaryButtonText: {
    color: '#fff6ed',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e7d7c7',
    alignItems: 'center',
  },
  secondaryButtonPressed: {
    backgroundColor: '#fff7ee',
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6c3f1d',
  },
  notFound: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2b1f14',
  },
  notFoundSubtitle: {
    marginTop: 8,
    fontSize: 12,
    color: '#8b7c6f',
    textAlign: 'center',
  },
});
