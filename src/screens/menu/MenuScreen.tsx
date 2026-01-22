import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { loadMenu } from '../../data/seedLoader';
import { useFavorites } from '../../data/favorites';
import type { MenuItem } from '../../models/types';

const formatCategoryName = (categoryId: string) => {
  const cleaned = categoryId.replace(/^c_/, '');
  return cleaned
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

const formatPrice = (price: number) => `RM ${price.toFixed(2)}`;

const normalizeQuery = (query: string) => query.trim().toLowerCase();

const matchesQuery = (item: MenuItem, query: string) => {
  if (!query) {
    return true;
  }
  const nameMatch = item.name.toLowerCase().includes(query);
  const tagMatch = item.tags.some((tag) => tag.toLowerCase().includes(query));
  return nameMatch || tagMatch;
};

const resolveBadgeLabel = (badge?: string) => {
  if (!badge) {
    return undefined;
  }
  const normalized = badge.toLowerCase();
  if (normalized === 'new') {
    return 'New';
  }
  if (normalized === 'popular') {
    return 'Popular';
  }
  if (normalized === 'promo') {
    return 'Promo';
  }
  return undefined;
};

export default function MenuScreen() {
  const menu = useMemo(() => loadMenu(), []);
  const { favoriteIds, isFavorite, toggleFavorite } = useFavorites();
  const categories = useMemo(() => {
    const ids = Array.from(new Set(menu.map((item) => item.categoryId)));
    const sorted = ids.sort((first, second) => first.localeCompare(second));
    const categoryItems = sorted.map((id) => ({
      id,
      name: formatCategoryName(id),
      count: menu.filter((item) => item.categoryId === id).length,
    }));
    return [{ id: 'all', name: 'All', count: menu.length }, ...categoryItems];
  }, [menu]);
  const [activeCategoryId, setActiveCategoryId] = useState(
    categories[0]?.id ?? 'all',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const normalizedQuery = useMemo(() => normalizeQuery(searchQuery), [searchQuery]);
  const filteredItems = useMemo(
    () =>
      menu.filter((item) => {
        if (activeCategoryId !== 'all' && item.categoryId !== activeCategoryId) {
          return false;
        }
        return matchesQuery(item, normalizedQuery);
      }),
    [menu, activeCategoryId, normalizedQuery],
  );
  const favoriteItems = useMemo(
    () => menu.filter((item) => favoriteIds.includes(item.id)),
    [menu, favoriteIds],
  );

  const renderItem = ({ item }: { item: MenuItem }) => {
    const badgeLabel = resolveBadgeLabel(item.badge);
    const isItemFavorite = isFavorite(item.id);
    return (
      <View style={styles.menuCard}>
        <View style={styles.menuCardTopRow}>
          {badgeLabel ? (
            <View
              style={[
                styles.badgePill,
                badgeLabel === 'New' && styles.badgeNew,
                badgeLabel === 'Popular' && styles.badgePopular,
                badgeLabel === 'Promo' && styles.badgePromo,
              ]}
            >
              <Text style={styles.badgeText}>{badgeLabel}</Text>
            </View>
          ) : (
            <View />
          )}
          <Pressable
            onPress={() => toggleFavorite(item.id)}
            style={({ pressed }) => [
              styles.favoriteButton,
              isItemFavorite && styles.favoriteButtonActive,
              pressed && styles.favoriteButtonPressed,
            ]}
          >
            <Text
              style={[
                styles.favoriteButtonText,
                isItemFavorite && styles.favoriteButtonTextActive,
              ]}
            >
              {isItemFavorite ? 'Saved' : 'Fav'}
            </Text>
          </Pressable>
        </View>
        <View style={styles.menuMetaRow}>
          <View style={styles.menuMetaText}>
            <Text style={styles.menuName}>{item.name}</Text>
            <Text style={styles.menuCategory}>{formatCategoryName(item.categoryId)}</Text>
          </View>
          <Text style={styles.menuPrice}>{formatPrice(item.basePrice)}</Text>
        </View>
        <View style={styles.tagRow}>
          {item.tags.map((tag) => (
            <View key={tag} style={styles.tagPill}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        {item.availability === 'sold_out' ? (
          <Text style={styles.menuAvailability}>Sold out</Text>
        ) : null}
      </View>
    );
  };

  const renderFavoriteItem = ({ item }: { item: MenuItem }) => {
    const badgeLabel = resolveBadgeLabel(item.badge);
    return (
      <View style={styles.favoriteCard}>
        <View style={styles.favoriteCardHeader}>
          {badgeLabel ? (
            <View
              style={[
                styles.badgePillSmall,
                badgeLabel === 'New' && styles.badgeNew,
                badgeLabel === 'Popular' && styles.badgePopular,
                badgeLabel === 'Promo' && styles.badgePromo,
              ]}
            >
              <Text style={styles.badgeTextSmall}>{badgeLabel}</Text>
            </View>
          ) : null}
          <Pressable
            onPress={() => toggleFavorite(item.id)}
            style={({ pressed }) => [
              styles.favoriteButtonSmall,
              pressed && styles.favoriteButtonPressed,
            ]}
          >
            <Text style={styles.favoriteButtonTextSmall}>Remove</Text>
          </Pressable>
        </View>
        <Text style={styles.favoriteName}>{item.name}</Text>
        <Text style={styles.favoritePrice}>{formatPrice(item.basePrice)}</Text>
      </View>
    );
  };

  const activeCategoryName =
    categories.find((category) => category.id === activeCategoryId)?.name ?? 'All';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Menu</Text>
          <Text style={styles.subtitle}>Pick a category and search your favorites.</Text>
        </View>
        <View style={styles.searchWrapper}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search drinks"
            placeholderTextColor="#a39588"
            style={styles.searchInput}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabs}
        >
          {categories.map((category) => {
            const isActive = category.id === activeCategoryId;
            return (
              <Pressable
                key={category.id}
                onPress={() => setActiveCategoryId(category.id)}
                style={({ pressed }) => [
                  styles.categoryTab,
                  isActive && styles.categoryTabActive,
                  pressed && styles.categoryTabPressed,
                ]}
              >
                <Text style={[styles.categoryTabText, isActive && styles.categoryTabTextActive]}>
                  {category.name}
                </Text>
                <Text
                  style={[styles.categoryCount, isActive && styles.categoryCountActive]}
                >
                  {category.count}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={styles.favoritesSection}>
          <View style={styles.favoritesHeader}>
            <Text style={styles.favoritesTitle}>Favorites</Text>
            <Text style={styles.favoritesCount}>{favoriteItems.length} saved</Text>
          </View>
          {favoriteItems.length > 0 ? (
            <FlatList
              data={favoriteItems}
              keyExtractor={(item) => item.id}
              renderItem={renderFavoriteItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.favoritesList}
            />
          ) : (
            <View style={styles.favoritesEmpty}>
              <Text style={styles.favoritesEmptyTitle}>No favorites yet</Text>
              <Text style={styles.favoritesEmptySubtitle}>
                Tap Fav on a drink to keep it handy.
              </Text>
            </View>
          )}
        </View>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{activeCategoryName}</Text>
          <Text style={styles.listSubtitle}>{filteredItems.length} items</Text>
        </View>
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.menuList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No matches yet</Text>
              <Text style={styles.emptySubtitle}>
                Try another search or category to see more drinks.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f3ee',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2b1f14',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#8b7c6f',
  },
  searchWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#eee3d7',
    fontSize: 14,
    color: '#2b1f14',
  },
  categoryTabs: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  categoryTab: {
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#efe2d6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryTabActive: {
    backgroundColor: '#2f2014',
    borderColor: '#2f2014',
  },
  categoryTabPressed: {
    transform: [{ scale: 0.97 }],
  },
  categoryTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5a4231',
  },
  categoryTabTextActive: {
    color: '#fff5e9',
  },
  categoryCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#a08f83',
  },
  categoryCountActive: {
    color: '#f0c070',
  },
  favoritesSection: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  favoritesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  favoritesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2b1f14',
  },
  favoritesCount: {
    fontSize: 12,
    color: '#8b7c6f',
  },
  favoritesList: {
    paddingBottom: 4,
    gap: 12,
  },
  favoriteCard: {
    width: 180,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#eee3d7',
  },
  favoriteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favoriteName: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#2b1f14',
  },
  favoritePrice: {
    marginTop: 6,
    fontSize: 13,
    color: '#8b7c6f',
  },
  favoritesEmpty: {
    backgroundColor: '#fff6ea',
    borderRadius: 16,
    padding: 16,
  },
  favoritesEmptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5a4231',
  },
  favoritesEmptySubtitle: {
    marginTop: 6,
    fontSize: 12,
    color: '#8b7c6f',
    lineHeight: 18,
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2b1f14',
  },
  listSubtitle: {
    fontSize: 12,
    color: '#8b7c6f',
  },
  menuList: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee3d7',
  },
  menuCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuMetaText: {
    flex: 1,
    marginRight: 12,
  },
  menuName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2b1f14',
  },
  menuCategory: {
    marginTop: 4,
    fontSize: 12,
    color: '#8b7c6f',
  },
  menuPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#d5863d',
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e6d8c9',
    backgroundColor: '#f6ede4',
  },
  badgePillSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e6d8c9',
    backgroundColor: '#f6ede4',
  },
  badgeNew: {
    backgroundColor: '#e4f3e7',
    borderColor: '#cce1d1',
  },
  badgePopular: {
    backgroundColor: '#fff1d6',
    borderColor: '#f2d3a3',
  },
  badgePromo: {
    backgroundColor: '#fde7e5',
    borderColor: '#f4c4bf',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4e3523',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  badgeTextSmall: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4e3523',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  favoriteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e6d8c9',
    backgroundColor: '#f9f1e9',
  },
  favoriteButtonActive: {
    backgroundColor: '#2f2014',
    borderColor: '#2f2014',
  },
  favoriteButtonPressed: {
    transform: [{ scale: 0.97 }],
  },
  favoriteButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5a4231',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  favoriteButtonTextActive: {
    color: '#fff5e9',
  },
  favoriteButtonSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#efe2d6',
    backgroundColor: '#f7efe5',
  },
  favoriteButtonTextSmall: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5a4231',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tagPill: {
    backgroundColor: '#fff4e6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6a4a2f',
    textTransform: 'capitalize',
  },
  menuAvailability: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '600',
    color: '#9e3a33',
  },
  emptyState: {
    backgroundColor: '#fff6ea',
    padding: 18,
    borderRadius: 16,
    marginTop: 12,
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
});
