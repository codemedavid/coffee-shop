import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  loadRewardRules,
  loadRewardTransactions,
  loadUsers,
} from '../../data/seedLoader';
import type { RewardRule, RewardTransaction } from '../../models/types';

type Tier = {
  id: string;
  label: string;
  minPoints: number;
};

const TIERS: Tier[] = [
  { id: 'bronze', label: 'Bronze', minPoints: 0 },
  { id: 'silver', label: 'Silver', minPoints: 50 },
  { id: 'gold', label: 'Gold', minPoints: 150 },
  { id: 'platinum', label: 'Platinum', minPoints: 300 },
];

const formatPoints = (points: number) => `${points} pts`;

const formatCurrency = (amount: number) => `RM ${amount.toFixed(2)}`;

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('en-MY', {
    month: 'short',
    day: 'numeric',
  });
};

const parseDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const sortRulesByStart = (rules: RewardRule[]) =>
  [...rules].sort(
    (first, second) =>
      new Date(first.validFrom).getTime() -
      new Date(second.validFrom).getTime(),
  );

const findRuleForDate = (rules: RewardRule[], date: Date | null) => {
  if (!date || rules.length === 0) {
    return null;
  }
  const match = rules.find((rule) => {
    const start = parseDate(rule.validFrom);
    const end = parseDate(rule.validTo);
    if (!start || !end) {
      return false;
    }
    return date >= start && date <= end;
  });
  return match ?? rules[rules.length - 1] ?? null;
};

const getTierForPoints = (points: number) => {
  const tiers = [...TIERS].sort((a, b) => a.minPoints - b.minPoints);
  const current = tiers.reduce<Tier | null>((acc, tier) => {
    if (points >= tier.minPoints) {
      return tier;
    }
    return acc;
  }, null);
  const index = current ? tiers.findIndex((tier) => tier.id === current.id) : 0;
  const next = tiers[index + 1] ?? null;
  return { current: current ?? tiers[0], next };
};

const computePointsForTransaction = (
  transaction: RewardTransaction,
  rule: RewardRule | null,
) => {
  if (transaction.type === 'redeem') {
    return -Math.abs(transaction.points ?? 0);
  }
  const amount = transaction.amount ?? 0;
  if (!rule) {
    return Math.round(amount);
  }
  return Math.round(amount * rule.pointsPerCurrency * rule.multiplier);
};

export default function RewardsScreen() {
  const user = useMemo(() => loadUsers()[0], []);
  const rules = useMemo(() => sortRulesByStart(loadRewardRules()), []);
  const transactions = useMemo(() => loadRewardTransactions(), []);
  const activity = useMemo(() => {
    const mapped = transactions.map((transaction) => {
      const date = parseDate(transaction.date);
      const rule = findRuleForDate(rules, date);
      const computedPoints = computePointsForTransaction(transaction, rule);
      const ruleLabel = rule
        ? `${rule.pointsPerCurrency}x · ${rule.multiplier}x`
        : 'Standard rate';
      return { ...transaction, computedPoints, ruleLabel };
    });
    return mapped.sort(
      (first, second) =>
        new Date(second.date).getTime() - new Date(first.date).getTime(),
    );
  }, [rules, transactions]);

  const totalPoints = useMemo(
    () => activity.reduce((sum, entry) => sum + entry.computedPoints, 0),
    [activity],
  );

  const summaryPoints = activity.length > 0 ? totalPoints : user?.points ?? 0;

  const { current: currentTier, next: nextTier } = useMemo(
    () => getTierForPoints(summaryPoints),
    [summaryPoints],
  );

  const progress = useMemo(() => {
    if (!nextTier) {
      return 1;
    }
    const range = nextTier.minPoints - currentTier.minPoints;
    if (range <= 0) {
      return 1;
    }
    return Math.min(
      1,
      Math.max(0, (summaryPoints - currentTier.minPoints) / range),
    );
  }, [currentTier.minPoints, nextTier, summaryPoints]);

  const pointsToNext = nextTier
    ? Math.max(nextTier.minPoints - summaryPoints, 0)
    : 0;

  const activeRule = useMemo(() => findRuleForDate(rules, new Date()), [rules]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Rewards</Text>
          <Text style={styles.subtitle}>
            {user ? `Hi ${user.name}, keep sipping to level up.` : 'Track your points here.'}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>Current points</Text>
            <Text style={styles.summaryPoints}>{formatPoints(summaryPoints)}</Text>
          </View>
          <View style={styles.tierBadge}>
            <Text style={styles.tierText}>{currentTier.label}</Text>
          </View>
        </View>

        <View style={styles.rateCard}>
          <View>
            <Text style={styles.rateTitle}>Earning rate</Text>
            <Text style={styles.rateValue}>
              {activeRule
                ? `${activeRule.pointsPerCurrency} pt / RM · ${activeRule.multiplier}x`
                : 'Rate unavailable'}
            </Text>
          </View>
          <Text style={styles.rateNote}>Applied automatically at checkout.</Text>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Tier progress</Text>
            <Text style={styles.progressValue}>{currentTier.label}</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.round(progress * 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressMeta}>
            {nextTier
              ? `${formatPoints(pointsToNext)} to reach ${nextTier.label}`
              : 'Top tier unlocked'}
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          <Text style={styles.sectionSubtitle}>
            {activity.length > 0
              ? `${activity.length} rewards entries`
              : 'No reward activity yet'}
          </Text>
        </View>

        {activity.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Start earning points</Text>
            <Text style={styles.emptySubtitle}>
              Place your first order to see points show up here.
            </Text>
          </View>
        ) : (
          <View style={styles.activityCard}>
            {activity.map((entry) => (
              <View key={entry.id} style={styles.activityRow}>
                <View>
                  <Text style={styles.activityTitle}>
                    {entry.type === 'earn' ? 'Order reward' : 'Redeemed'}
                  </Text>
                  <Text style={styles.activityMeta}>
                    {formatDate(entry.date)} · {entry.ruleLabel}
                  </Text>
                  {entry.amount ? (
                    <Text style={styles.activityMeta}>
                      Spend {formatCurrency(entry.amount)}
                    </Text>
                  ) : null}
                </View>
                <Text
                  style={[
                    styles.activityPoints,
                    entry.computedPoints < 0 && styles.activityPointsNegative,
                  ]}
                >
                  {entry.computedPoints >= 0 ? '+' : ''}
                  {entry.computedPoints}
                </Text>
              </View>
            ))}
          </View>
        )}
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
    padding: 20,
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
    fontSize: 14,
    color: '#5a4a3f',
  },
  summaryCard: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#8b6f5d',
  },
  summaryPoints: {
    marginTop: 8,
    fontSize: 26,
    fontWeight: '700',
    color: '#2b1f14',
  },
  tierBadge: {
    backgroundColor: '#f0e2d3',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  tierText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7a4b29',
  },
  rateCard: {
    marginTop: 16,
    backgroundColor: '#2b1f14',
    borderRadius: 16,
    padding: 16,
  },
  rateTitle: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#e6d3c2',
  },
  rateValue: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  rateNote: {
    marginTop: 8,
    fontSize: 12,
    color: '#d8c0aa',
  },
  progressCard: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2b1f14',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7a4b29',
  },
  progressBar: {
    marginTop: 12,
    height: 10,
    backgroundColor: '#f0e2d3',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#d49f63',
  },
  progressMeta: {
    marginTop: 10,
    fontSize: 12,
    color: '#7a5f4d',
  },
  sectionHeader: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2b1f14',
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#7a5f4d',
  },
  activityCard: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  activityRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1e5d8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2b1f14',
  },
  activityMeta: {
    marginTop: 4,
    fontSize: 12,
    color: '#7a5f4d',
  },
  activityPoints: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2b1f14',
  },
  activityPointsNegative: {
    color: '#b5523b',
  },
  emptyCard: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2b1f14',
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#7a5f4d',
    textAlign: 'center',
  },
});
