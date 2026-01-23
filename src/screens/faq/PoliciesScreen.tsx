import React, { useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { loadLegalPolicies } from '../../data/seedLoader';

export default function PoliciesScreen() {
  const { items, hasError } = useMemo(() => loadLegalPolicies(), []);

  if (hasError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorState}>
          <Text style={styles.errorTitle}>Policies unavailable</Text>
          <Text style={styles.errorSubtitle}>
            We could not load the legal content right now.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Policies</Text>
          <Text style={styles.subtitle}>
            The details that keep orders and data protected.
          </Text>
        </View>
        <View style={styles.list}>
          {items.map((policy) => (
            <View key={policy.id} style={styles.card}>
              <Text style={styles.cardTitle}>{policy.title}</Text>
              <Text style={styles.cardBody}>{policy.body}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f1ec',
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2f2017',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 12,
    color: '#7e6d61',
  },
  list: {
    marginTop: 18,
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#efe2d6',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2f2017',
  },
  cardBody: {
    marginTop: 8,
    fontSize: 12,
    color: '#6f5f52',
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2f2017',
  },
  errorSubtitle: {
    marginTop: 8,
    fontSize: 12,
    color: '#8b7c6f',
    textAlign: 'center',
  },
});
