import React, { useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { loadFaqs } from '../../data/seedLoader';

export default function FaqScreen() {
  const { items, hasError } = useMemo(() => loadFaqs(), []);

  if (hasError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorState}>
          <Text style={styles.errorTitle}>FAQs unavailable</Text>
          <Text style={styles.errorSubtitle}>
            We could not load the FAQ content right now.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Frequently asked questions</Text>
          <Text style={styles.subtitle}>
            Quick answers to the most common questions.
          </Text>
        </View>
        <View style={styles.list}>
          {items.map((faq, index) => (
            <View key={faq.id} style={styles.card}>
              <Text style={styles.cardIndex}>{String(index + 1).padStart(2, '0')}</Text>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{faq.question}</Text>
                <Text style={styles.cardBody}>{faq.answer}</Text>
              </View>
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
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#efe2d6',
  },
  cardIndex: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b06b3c',
  },
  cardContent: {
    flex: 1,
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
