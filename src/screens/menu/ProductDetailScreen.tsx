import React, { useMemo } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { loadMenu } from '../../data/seedLoader';
import type { RootStackParamList } from '../auth/types';

const formatPrice = (price: number) => `RM ${price.toFixed(2)}`;

export default function ProductDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ProductDetail'>>();
  const itemId = route.params?.itemId;
  const menu = useMemo(() => loadMenu(), []);
  const item = useMemo(
    () => menu.find((menuItem) => menuItem.id === itemId),
    [menu, itemId],
  );

  if (!item) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundTitle}>Item not found</Text>
          <Text style={styles.notFoundSubtitle}>
            We couldn't find the drink details. Try selecting another item.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const allergens = item.allergens ?? [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imageStrip}
        >
          {item.imageUrls.map((url, index) => (
            <Image
              key={`${url}-${index}`}
              source={{ uri: url }}
              style={styles.heroImage}
            />
          ))}
        </ScrollView>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.price}>{formatPrice(item.basePrice)}</Text>
          </View>
          <View style={styles.badgeWrapper}>
            <Text style={styles.badgeLabel}>{item.availability === 'sold_out' ? 'Sold out' : 'Available'}</Text>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionBody}>
            {item.description ?? 'No description provided yet.'}
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Allergens</Text>
          {allergens.length > 0 ? (
            <View style={styles.allergenRow}>
              {allergens.map((allergen) => (
                <View key={allergen} style={styles.allergenPill}>
                  <Text style={styles.allergenText}>{allergen}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.sectionBody}>No listed allergens.</Text>
          )}
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
    paddingBottom: 24,
  },
  imageStrip: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  heroImage: {
    width: 240,
    height: 160,
    borderRadius: 18,
    backgroundColor: '#efe2d6',
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2b1f14',
  },
  price: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '700',
    color: '#d5863d',
  },
  badgeWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#fff1d6',
    borderWidth: 1,
    borderColor: '#f2d3a3',
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6a4a2f',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2b1f14',
    marginBottom: 6,
  },
  sectionBody: {
    fontSize: 13,
    color: '#8b7c6f',
    lineHeight: 20,
  },
  allergenRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergenPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#fff4e6',
  },
  allergenText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6a4a2f',
    textTransform: 'capitalize',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2b1f14',
  },
  notFoundSubtitle: {
    marginTop: 8,
    fontSize: 13,
    color: '#8b7c6f',
    textAlign: 'center',
    lineHeight: 20,
  },
});
