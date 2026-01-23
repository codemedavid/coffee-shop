import React, { useMemo } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { loadNotifications } from '../../data/seedLoader';
import { useOrderHistory } from '../../data/orderHistory';
import type { Notification } from '../../models/types';
import type { RootStackParamList } from '../auth/types';

type ParsedLink = {
  type: 'order';
  orderId: string;
};

const toTimestamp = (value: string) => {
  const date = new Date(value);
  const time = date.getTime();
  return Number.isNaN(time) ? 0 : time;
};

const sortNotifications = (items: Notification[]) =>
  [...items].sort(
    (first, second) => toTimestamp(second.createdAt) - toTimestamp(first.createdAt),
  );

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }
  return date.toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'short',
  });
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleTimeString('en-MY', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const getQueryParam = (query: string, key: string) => {
  const pairs = query.split('&');
  for (const pair of pairs) {
    const [entryKey, entryValue] = pair.split('=');
    if (entryKey === key) {
      return entryValue ?? '';
    }
  }
  return '';
};

const parseDeepLink = (deepLink?: string): ParsedLink | null => {
  if (!deepLink) {
    return null;
  }
  const trimmed = deepLink.trim();
  if (!trimmed) {
    return null;
  }
  const cleaned = trimmed.replace(/^\w+:\/\//, '');
  const [pathPart, queryPart] = cleaned.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  const resource = segments[0];
  const directId = segments[1];
  if (resource !== 'order' && resource !== 'orderStatus' && resource !== 'orders') {
    return null;
  }
  const queryId = queryPart ? getQueryParam(queryPart, 'orderId') : '';
  const orderId = directId || queryId;
  if (!orderId) {
    return null;
  }
  return { type: 'order', orderId };
};

export default function NotificationsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { orders } = useOrderHistory();
  const notifications = useMemo(
    () => sortNotifications(loadNotifications()),
    [],
  );
  const orderLookup = useMemo(() => {
    const map = new Map<string, typeof orders[number]>();
    orders.forEach((order) => map.set(order.id, order));
    return map;
  }, [orders]);

  if (notifications.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No notifications</Text>
          <Text style={styles.emptySubtitle}>
            Order updates and promos will appear here.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handlePress = (notification: Notification) => {
    const link = parseDeepLink(notification.deepLink);
    if (!link) {
      Alert.alert(
        'Link unavailable',
        'This notification does not have a valid destination.',
      );
      return;
    }

    const order = orderLookup.get(link.orderId);
    if (!order) {
      Alert.alert(
        'Order not found',
        'We could not find the order linked to this notification.',
      );
      return;
    }

    navigation.navigate('OrderStatus', { order });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>Stay on top of your orders.</Text>
        </View>
        <View style={styles.list}>
          {notifications.map((notification) => {
            const timeLabel = formatTime(notification.createdAt);
            const dateLabel = formatDate(notification.createdAt);
            const link = parseDeepLink(notification.deepLink);
            return (
              <Pressable
                key={notification.id}
                onPress={() => handlePress(notification)}
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.cardPressed,
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{notification.title}</Text>
                  <Text style={styles.cardTime}>
                    {dateLabel}
                    {timeLabel ? ` • ${timeLabel}` : ''}
                  </Text>
                </View>
                <Text style={styles.cardBody}>{notification.body}</Text>
                <View style={styles.cardFooter}>
                  <Text
                    style={link ? styles.cardAction : styles.cardActionDisabled}
                  >
                    {link ? 'View order status' : 'Link unavailable'}
                  </Text>
                </View>
              </Pressable>
            );
          })}
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
  list: {
    marginTop: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#efe2d6',
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#2b1f14',
  },
  cardTime: {
    fontSize: 11,
    color: '#8b7c6f',
  },
  cardBody: {
    marginTop: 8,
    fontSize: 12,
    color: '#6f5f52',
  },
  cardFooter: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  cardAction: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c3f1d',
  },
  cardActionDisabled: {
    fontSize: 12,
    fontWeight: '600',
    color: '#b0a398',
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
});
