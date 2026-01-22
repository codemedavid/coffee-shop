import React, { useMemo } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOrderHistory } from '../../data/orderHistory';
import type { Order } from '../../models/types';
import type { RootStackParamList } from '../auth/types';

type OrderGroup = {
  key: string;
  label: string;
  orders: Order[];
};

const formatPrice = (price: number) => `RM ${price.toFixed(2)}`;

const formatDateLabel = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }
  return date.toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatTimeLabel = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleTimeString('en-MY', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const buildGroups = (orders: Order[]): OrderGroup[] => {
  const groups = new Map<string, OrderGroup>();
  orders.forEach((order) => {
    const dateKey = order.placedAt.split('T')[0] ?? order.placedAt;
    const label = formatDateLabel(order.placedAt);
    const existing = groups.get(dateKey);
    if (existing) {
      existing.orders.push(order);
    } else {
      groups.set(dateKey, { key: dateKey, label, orders: [order] });
    }
  });
  return Array.from(groups.values()).sort((first, second) =>
    second.key.localeCompare(first.key),
  );
};

const summarizeItems = (order: Order) => {
  if (order.items.length === 0) {
    return 'No items';
  }
  return order.items
    .map((item) => `${item.name} x${item.qty}`)
    .slice(0, 2)
    .join(' • ');
};

export default function OrdersScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { orders } = useOrderHistory();
  const groupedOrders = useMemo(() => buildGroups(orders), [orders]);

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySubtitle}>
            Start a new order and it will appear here.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Order history</Text>
          <Text style={styles.subtitle}>
            Review past orders and reorder favorites.
          </Text>
        </View>
        {groupedOrders.map((group) => (
          <View key={group.key} style={styles.groupSection}>
            <Text style={styles.groupLabel}>{group.label}</Text>
            <View style={styles.groupList}>
              {group.orders.map((order) => {
                const timeLabel = formatTimeLabel(order.placedAt);
                return (
                  <Pressable
                    key={order.id}
                    onPress={() =>
                      navigation.navigate('OrderDetail', { orderId: order.id })
                    }
                    style={({ pressed }) => [
                      styles.orderCard,
                      pressed && styles.orderCardPressed,
                    ]}
                  >
                    <View style={styles.orderMeta}>
                      <Text style={styles.orderId}>Order {order.id}</Text>
                      <Text style={styles.orderStatus}>
                        {order.status.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.orderItems}>
                      {summarizeItems(order)}
                    </Text>
                    <View style={styles.orderFooter}>
                      <Text style={styles.orderTime}>{timeLabel}</Text>
                      <Text style={styles.orderTotal}>
                        {formatPrice(order.total)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailText}>View details</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
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
    paddingBottom: 40,
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
  emptyState: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2b1f14',
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 12,
    color: '#8b7c6f',
    textAlign: 'center',
  },
  groupSection: {
    marginTop: 16,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7c6755',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  groupList: {
    marginTop: 12,
    gap: 12,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#efe2d6',
  },
  orderCardPressed: {
    opacity: 0.85,
  },
  orderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2b1f14',
  },
  orderStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6c3f1d',
  },
  orderItems: {
    marginTop: 8,
    fontSize: 12,
    color: '#8b7c6f',
  },
  orderFooter: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderTime: {
    fontSize: 12,
    color: '#8b7c6f',
  },
  orderTotal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2b1f14',
  },
  detailRow: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  detailText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c3f1d',
  },
});
