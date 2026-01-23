import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { loadOrderStatusUpdates } from '../../data/seedLoader';
import { useOrderRatings } from '../../data/orderRatings';
import type { Order, OrderStatus, OrderStatusUpdate } from '../../models/types';

const STATUS_STEPS: {
  status: OrderStatus;
  title: string;
  subtitle: string;
}[] = [
  {
    status: 'received',
    title: 'Received',
    subtitle: 'Order confirmed and queued.',
  },
  {
    status: 'preparing',
    title: 'Preparing',
    subtitle: 'Baristas are crafting your drinks.',
  },
  {
    status: 'ready',
    title: 'Ready',
    subtitle: 'Order is ready for pickup or handoff.',
  },
  {
    status: 'completed',
    title: 'Completed',
    subtitle: 'Order fulfilled. Enjoy your coffee!',
  },
];

const seededOrder: Order = {
  id: 'ord_seed_001',
  userId: 'u_001',
  storeId: 's_001',
  items: [],
  status: 'ready',
  total: 18.5,
  etaMinutes: 5,
  fulfillmentType: 'pickup',
  placedAt: new Date().toISOString(),
};

const formatPrice = (price: number) => `RM ${price.toFixed(2)}`;

const formatTime = (timestamp?: string) => {
  if (!timestamp) {
    return null;
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleTimeString('en-MY', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const sortUpdates = (updates: OrderStatusUpdate[]) =>
  [...updates].sort(
    (first, second) =>
      new Date(first.timestamp).getTime() -
      new Date(second.timestamp).getTime(),
  );

type Props = {
  order?: Order;
};

export default function OrderStatusScreen({ order }: Props) {
  const { ratings, saveRating } = useOrderRatings();
  const activeOrder = order ?? seededOrder;
  const statusUpdates = useMemo(
    () =>
      sortUpdates(
        loadOrderStatusUpdates().filter(
          (update) => update.orderId === activeOrder.id,
        ),
      ),
    [activeOrder.id],
  );

  const updatesByStatus = useMemo(() => {
    const map = new Map<OrderStatus, string>();
    statusUpdates.forEach((update) => map.set(update.status, update.timestamp));
    return map;
  }, [statusUpdates]);

  const latestStatus = useMemo(() => {
    const lastUpdate = statusUpdates[statusUpdates.length - 1];
    return lastUpdate?.status ?? activeOrder.status;
  }, [activeOrder.status, statusUpdates]);

  const statusIndex = STATUS_STEPS.findIndex(
    (step) => step.status === latestStatus,
  );
  const hasStatus = statusIndex >= 0;
  const showFallback = statusUpdates.length === 0;
  const isCompleted = latestStatus === 'completed';
  const storedRating = ratings[activeOrder.id];
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (storedRating) {
      setSelectedRating(storedRating.rating);
      setFeedback(storedRating.feedback ?? '');
    } else {
      setSelectedRating(null);
      setFeedback('');
    }
    setSubmitError(null);
    setIsSubmitting(false);
  }, [activeOrder.id, storedRating]);

  const handleSubmit = async () => {
    if (selectedRating === null) {
      setSubmitError('Select a rating before submitting.');
      return;
    }
    setIsSubmitting(true);
    const result = await saveRating({
      orderId: activeOrder.id,
      rating: selectedRating,
      feedback,
      status: latestStatus,
    });
    if (!result.ok) {
      setSubmitError(result.message);
      setIsSubmitting(false);
      return;
    }
    setSubmitError(null);
    setIsSubmitting(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Order status</Text>
          <Text style={styles.subtitle}>Tracking {activeOrder.id}</Text>
        </View>
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(activeOrder.total)}
            </Text>
          </View>
          <View style={styles.summaryMeta}>
            <Text style={styles.summaryMetaText}>
              {activeOrder.fulfillmentType === 'pickup' ? 'Pickup' : 'Delivery'}
            </Text>
            <Text style={styles.summaryMetaText}>
              {activeOrder.etaMinutes} min ETA
            </Text>
          </View>
        </View>
        {showFallback ? (
          <View style={styles.fallbackCard}>
            <Text style={styles.fallbackTitle}>Status updates unavailable</Text>
            <Text style={styles.fallbackSubtitle}>
              We will show live progress once the cafe syncs your order.
            </Text>
          </View>
        ) : null}
        <View style={styles.timelineCard}>
          {STATUS_STEPS.map((step, index) => {
            const isComplete = hasStatus && index <= statusIndex;
            const isActive = hasStatus && index === statusIndex;
            const timestamp = updatesByStatus.get(step.status);
            const timeLabel = formatTime(timestamp);

            return (
              <View key={step.status} style={styles.timelineRow}>
                <View style={styles.markerColumn}>
                  <View
                    style={[
                      styles.marker,
                      isComplete && styles.markerComplete,
                      isActive && styles.markerActive,
                    ]}
                  />
                  {index < STATUS_STEPS.length - 1 ? (
                    <View
                      style={[
                        styles.connector,
                        isComplete && styles.connectorComplete,
                      ]}
                    />
                  ) : null}
                </View>
                <View style={styles.timelineContent}>
                  <Text
                    style={[
                      styles.timelineTitle,
                      isComplete && styles.timelineTitleComplete,
                    ]}
                  >
                    {step.title}
                  </Text>
                  <Text style={styles.timelineSubtitle}>{step.subtitle}</Text>
                  {timeLabel ? (
                    <Text style={styles.timelineTime}>{timeLabel}</Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
        {isCompleted ? (
          <View style={styles.ratingCard}>
            <Text style={styles.ratingTitle}>
              {storedRating ? 'Thanks for rating' : 'Rate this order'}
            </Text>
            <Text style={styles.ratingSubtitle}>
              {storedRating
                ? 'Your feedback helps our baristas improve.'
                : 'How was your order experience?'}
            </Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((value) => {
                const isSelected = (selectedRating ?? 0) >= value;
                return (
                  <Pressable
                    key={`rating-${value}`}
                    onPress={() => {
                      if (storedRating) {
                        return;
                      }
                      setSelectedRating(value);
                      setSubmitError(null);
                    }}
                    disabled={!!storedRating}
                    style={({ pressed }) => [
                      styles.ratingStar,
                      isSelected && styles.ratingStarSelected,
                      pressed && !storedRating && styles.ratingStarPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.ratingStarText,
                        isSelected && styles.ratingStarTextSelected,
                      ]}
                    >
                      {value}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              value={feedback}
              onChangeText={(text) => {
                if (storedRating) {
                  return;
                }
                setFeedback(text);
              }}
              editable={!storedRating}
              placeholder="Share additional feedback (optional)"
              style={styles.feedbackInput}
              multiline
              textAlignVertical="top"
            />
            {submitError ? (
              <Text style={styles.errorText}>{submitError}</Text>
            ) : null}
            {storedRating ? (
              <View style={styles.ratingSaved}>
                <Text style={styles.ratingSavedText}>
                  Saved on {formatTime(storedRating.createdAt) ?? 'just now'}
                </Text>
              </View>
            ) : (
              <Pressable
                onPress={handleSubmit}
                disabled={isSubmitting}
                style={({ pressed }) => [
                  styles.ratingButton,
                  (pressed || isSubmitting) && styles.ratingButtonPressed,
                ]}
              >
                <Text style={styles.ratingButtonText}>
                  {isSubmitting ? 'Saving...' : 'Submit rating'}
                </Text>
              </Pressable>
            )}
          </View>
        ) : null}
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
    fontSize: 18,
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
  fallbackCard: {
    marginTop: 16,
    backgroundColor: '#fcefe7',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f0d4c4',
  },
  fallbackTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7a3a1e',
  },
  fallbackSubtitle: {
    marginTop: 6,
    fontSize: 12,
    color: '#8b7c6f',
    lineHeight: 18,
  },
  timelineCard: {
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#efe2d6',
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
  },
  markerColumn: {
    alignItems: 'center',
    width: 18,
  },
  marker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d8c8b6',
    backgroundColor: '#ffffff',
  },
  markerComplete: {
    borderColor: '#6c3f1d',
    backgroundColor: '#6c3f1d',
  },
  markerActive: {
    borderColor: '#d5863d',
    backgroundColor: '#ffd8b2',
  },
  connector: {
    flex: 1,
    width: 2,
    marginTop: 6,
    backgroundColor: '#e6d6c5',
  },
  connectorComplete: {
    backgroundColor: '#6c3f1d',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2b1f14',
  },
  timelineTitleComplete: {
    color: '#6c3f1d',
  },
  timelineSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#8b7c6f',
  },
  timelineTime: {
    marginTop: 6,
    fontSize: 11,
    color: '#a08f83',
  },
  ratingCard: {
    marginTop: 18,
    backgroundColor: '#fff7ee',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3e2cf',
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2b1f14',
  },
  ratingSubtitle: {
    marginTop: 6,
    fontSize: 12,
    color: '#8b7c6f',
  },
  ratingRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  ratingStar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d8c8b6',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  ratingStarSelected: {
    borderColor: '#6c3f1d',
    backgroundColor: '#f0d9c2',
  },
  ratingStarPressed: {
    opacity: 0.8,
  },
  ratingStarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8b7c6f',
  },
  ratingStarTextSelected: {
    color: '#6c3f1d',
  },
  feedbackInput: {
    marginTop: 12,
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#e6d6c5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    fontSize: 12,
    color: '#2b1f14',
  },
  errorText: {
    marginTop: 8,
    fontSize: 11,
    color: '#b63c2a',
  },
  ratingButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: '#2f2014',
  },
  ratingButtonPressed: {
    opacity: 0.85,
  },
  ratingButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff6ed',
  },
  ratingSaved: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#f6eadb',
    alignItems: 'center',
  },
  ratingSavedText: {
    fontSize: 11,
    color: '#6c3f1d',
    fontWeight: '600',
  },
});
