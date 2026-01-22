import React, { useMemo } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { loadMenu } from '../../data/seedLoader';
import type { MenuItem } from '../../models/types';

const formatCategoryName = (categoryId: string) => {
  const cleaned = categoryId.replace(/^c_/, '');
  return cleaned
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

const getFeaturedItems = (items: MenuItem[]) =>
  items.filter((item) => Boolean(item.badge) || item.tags.includes('classic'));

const formatPrice = (price: number) => `RM ${price.toFixed(2)}`;

export default function HomeScreen() {
  const menu = useMemo(() => loadMenu(), []);
  const featuredItems = useMemo(() => getFeaturedItems(menu), [menu]);
  const categories = useMemo(() => {
    const ids = Array.from(new Set(menu.map((item) => item.categoryId)));
    return ids.map((id) => ({
      id,
      name: formatCategoryName(id),
      count: menu.filter((item) => item.categoryId === id).length,
    }));
  }, [menu]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <View style={styles.bannerBadge}>
            <Text style={styles.bannerBadgeText}>Welcome back</Text>
          </View>
          <Text style={styles.bannerTitle}>Grab your next cup</Text>
          <Text style={styles.bannerSubtitle}>
            Discover seasonal specials and your daily favorites.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured</Text>
            <Text style={styles.sectionSubtitle}>Fresh picks from the baristas</Text>
          </View>
          <FlatList
            data={featuredItems}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No featured items yet</Text>
                <Text style={styles.emptySubtitle}>
                  Check back soon for new coffee highlights.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.featuredCard}>
                {item.imageUrls[0] ? (
                  <Image source={{ uri: item.imageUrls[0] }} style={styles.featuredImage} />
                ) : (
                  <View style={styles.imagePlaceholder} />
                )}
                <View style={styles.featuredMeta}>
                  <Text style={styles.featuredName}>{item.name}</Text>
                  <Text style={styles.featuredPrice}>{formatPrice(item.basePrice)}</Text>
                </View>
              </View>
            )}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <Text style={styles.sectionSubtitle}>Browse by flavor profile</Text>
          </View>
          <View style={styles.categoryList}>
            {categories.map((category) => (
              <View key={category.id} style={styles.categoryCard}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryCount}>{category.count} items</Text>
              </View>
            ))}
          </View>
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
    paddingBottom: 32,
  },
  banner: {
    margin: 20,
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#2f2014',
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0c070',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 12,
  },
  bannerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: '#2f2014',
    textTransform: 'uppercase',
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff8f1',
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#e8dcd0',
    lineHeight: 20,
  },
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2b1f14',
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#8b7c6f',
  },
  featuredList: {
    paddingHorizontal: 20,
    paddingBottom: 4,
    gap: 16,
  },
  featuredCard: {
    width: 200,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  featuredImage: {
    width: '100%',
    height: 120,
    borderRadius: 14,
    backgroundColor: '#f3ece5',
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: 14,
    backgroundColor: '#efe2d6',
  },
  featuredMeta: {
    marginTop: 12,
  },
  featuredName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2b1f14',
  },
  featuredPrice: {
    marginTop: 4,
    fontSize: 13,
    color: '#8b7c6f',
  },
  emptyState: {
    width: 260,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#fff6ea',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5a4231',
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 12,
    color: '#8b7c6f',
    lineHeight: 18,
  },
  categoryList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee3d7',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2b1f14',
  },
  categoryCount: {
    marginTop: 4,
    fontSize: 12,
    color: '#8b7c6f',
  },
});
